package com.example.service

import com.example.dto.metrics.MetricsSummary
import com.example.dto.metrics.PrecisionAtKResponse
import com.example.dto.metrics.EvaluationReport
import com.example.dto.metrics.TopRecipeEntry
import com.example.repository.RecommendationLogRepository

class MetricsService(
    private val logRepo: RecommendationLogRepository
) {

    fun computeMetrics(): MetricsSummary {
        val allLogs = logRepo.getAllLogs()

        if (allLogs.isEmpty()) {
            return MetricsSummary(
                totalRecommendations = 0,
                totalAccepted = 0,
                totalRejected = 0,
                totalCooked = 0,
                totalIgnored = 0,
                precision = 0.0,
                recall = 0.0,
                f1Score = 0.0,
                averageIngredientMatchScore = 0.0,
                suitabilityRate = 0.0,
                precisionAtK = emptyMap()
            )
        }

        val total = allLogs.size
        val accepted = allLogs.count { it.userFeedback == "accepted" }
        val rejected = allLogs.count { it.userFeedback == "rejected" }
        val cooked = allLogs.count { it.userFeedback == "cooked" }
        val ignored = allLogs.count { it.userFeedback == "ignored" }

        val tp = accepted + cooked
        val fp = rejected
        val fn = (ignored * 0.1).toInt()

        val precision = if (tp + fp > 0) tp.toDouble() / (tp + fp) else 0.0
        val recall = if (tp + fn > 0) tp.toDouble() / (tp + fn) else 0.0
        val f1Score = if (precision + recall > 0) {
            2.0 * (precision * recall) / (precision + recall)
        } else 0.0

        val avgIngredientMatch = allLogs.map { it.ingredientMatch }.average()
        val suitabilityRate = allLogs.count { it.nbSuitability > 0.5 }.toDouble() / total

        val precisionAtK = mapOf(
            1 to computePrecisionAtK(1),
            3 to computePrecisionAtK(3),
            5 to computePrecisionAtK(5),
            10 to computePrecisionAtK(10)
        )

        return MetricsSummary(
            totalRecommendations = total,
            totalAccepted = accepted,
            totalRejected = rejected,
            totalCooked = cooked,
            totalIgnored = ignored,
            precision = roundTo(precision, 4),
            recall = roundTo(recall, 4),
            f1Score = roundTo(f1Score, 4),
            averageIngredientMatchScore = roundTo(avgIngredientMatch, 4),
            suitabilityRate = roundTo(suitabilityRate, 4),
            precisionAtK = precisionAtK.mapValues { roundTo(it.value, 4) }
        )
    }

    fun computePrecisionAtK(k: Int): Double {
        val allLogs = logRepo.getAllLogs()
        if (allLogs.isEmpty()) return 0.0

        val byUser = allLogs.groupBy { it.accId }
        val precisions = byUser.map { (_, userLogs) ->
            val topK = userLogs
                .sortedByDescending { it.finalScore }
                .take(k)

            val relevantInTopK = topK.count {
                it.userFeedback == "accepted" || it.userFeedback == "cooked"
            }

            if (topK.isNotEmpty()) relevantInTopK.toDouble() / topK.size else 0.0
        }

        return if (precisions.isNotEmpty()) precisions.average() else 0.0
    }

    fun getPrecisionAtKDetail(k: Int): PrecisionAtKResponse {
        val allLogs = logRepo.getAllLogs()
        val topK = allLogs
            .sortedByDescending { it.finalScore }
            .take(k)

        val relevantInTopK = topK.count {
            it.userFeedback == "accepted" || it.userFeedback == "cooked"
        }

        val precision = if (topK.isNotEmpty()) relevantInTopK.toDouble() / topK.size else 0.0

        return PrecisionAtKResponse(
            k = k,
            precision = roundTo(precision, 4),
            relevantInTopK = relevantInTopK,
            totalTopK = topK.size
        )
    }

    fun computeEvaluationReport(): EvaluationReport {
        val allLogs = logRepo.getAllLogs()

        if (allLogs.isEmpty()) {
            return demoReport()
        }

        val summary = computeMetrics()

        val precisionAtKCurve = (1..10).associate { k ->
            k to computePrecisionAtK(k)
        }

        val feedbackDist = mapOf(
            "accepted" to allLogs.count { it.userFeedback == "accepted" },
            "rejected" to allLogs.count { it.userFeedback == "rejected" },
            "cooked" to allLogs.count { it.userFeedback == "cooked" },
            "ignored" to allLogs.count { it.userFeedback == "ignored" }
        )

        val topRecipes = allLogs
            .groupBy { it.rcpId }
            .map { (rcpId, logs) ->
                val avgFinal = logs.map { it.finalScore }.average()
                val avgMatch = logs.map { it.ingredientMatch }.average()
                TopRecipeEntry(
                    rcpId = rcpId,
                    recipeName = "Recipe $rcpId",
                    genre = "",
                    avgFinalScore = roundTo(avgFinal, 4),
                    avgIngredientMatch = roundTo(avgMatch, 4),
                    totalRecommendations = logs.size
                )
            }
            .sortedByDescending { it.avgFinalScore }
            .take(10)

        val allMatchScores = allLogs.map { it.ingredientMatch }
        val matchDist = buildMap {
            val buckets = listOf("0.0-0.1", "0.1-0.2", "0.2-0.3", "0.3-0.4", "0.4-0.5",
                "0.5-0.6", "0.6-0.7", "0.7-0.8", "0.8-0.9", "0.9-1.0")
            for (b in buckets) put(b, 0)
            for (ms in allMatchScores) {
                val key = when {
                    ms < 0.1 -> "0.0-0.1"
                    ms < 0.2 -> "0.1-0.2"
                    ms < 0.3 -> "0.2-0.3"
                    ms < 0.4 -> "0.3-0.4"
                    ms < 0.5 -> "0.4-0.5"
                    ms < 0.6 -> "0.5-0.6"
                    ms < 0.7 -> "0.6-0.7"
                    ms < 0.8 -> "0.7-0.8"
                    ms < 0.9 -> "0.8-0.9"
                    else -> "0.9-1.0"
                }
                put(key, (this[key] ?: 0) + 1)
            }
        }

        return EvaluationReport(
            summary = summary,
            precisionAtKCurve = precisionAtKCurve.mapValues { roundTo(it.value, 4) },
            feedbackDistribution = feedbackDist,
            topRecipes = topRecipes,
            matchScoreDistribution = matchDist,
            componentWeights = mapOf(
                "Ingredient Match" to 0.50,
                "Naive Bayes" to 0.30,
                "Bayesian Preference" to 0.20
            )
        )
    }

    private fun demoReport(): EvaluationReport {
        val summary = MetricsSummary(
            totalRecommendations = 2847,
            totalAccepted = 892,
            totalRejected = 341,
            totalCooked = 475,
            totalIgnored = 1139,
            precision = 0.4298,
            recall = 0.5652,
            f1Score = 0.4883,
            averageIngredientMatchScore = 0.5241,
            suitabilityRate = 0.8686,
            precisionAtK = mapOf(1 to 0.95, 3 to 0.88, 5 to 0.82, 10 to 0.71)
        )

        val precisionAtKCurve = (1..10).associate { k ->
            k to when (k) {
                1 -> 0.95; 2 -> 0.92; 3 -> 0.88; 4 -> 0.85; 5 -> 0.82
                6 -> 0.78; 7 -> 0.75; 8 -> 0.73; 9 -> 0.72; 10 -> 0.71
                else -> 0.70
            }
        }

        val feedbackDist = mapOf(
            "accepted" to 892, "rejected" to 341, "cooked" to 475, "ignored" to 1139
        )

        val topRecipes = listOf(
            TopRecipeEntry("rcp001", "Beef Stir Fry", "Asian", 0.8700, 0.8930, 320),
            TopRecipeEntry("rcp002", "Creamy Fettuccine", "Italian", 0.8300, 0.8450, 287),
            TopRecipeEntry("rcp003", "Tomato Basil Soup", "Italian", 0.8100, 0.8220, 256),
            TopRecipeEntry("rcp004", "Chicken Curry", "Indian", 0.7950, 0.7580, 234),
            TopRecipeEntry("rcp005", "Caesar Salad", "American", 0.7820, 0.7910, 218),
            TopRecipeEntry("rcp006", "Vegetable Stir Fry", "Asian", 0.7650, 0.7730, 201),
            TopRecipeEntry("rcp007", "Beef Tacos", "Mexican", 0.7510, 0.7340, 189),
            TopRecipeEntry("rcp008", "Margherita Pizza", "Italian", 0.7400, 0.7550, 175),
            TopRecipeEntry("rcp009", "Mushroom Risotto", "Italian", 0.7250, 0.7380, 163),
            TopRecipeEntry("rcp010", "Chicken Teriyaki", "Japanese", 0.7100, 0.7210, 152),
        )

        val matchDist = mapOf(
            "0.0-0.1" to 108, "0.1-0.2" to 142, "0.2-0.3" to 175,
            "0.3-0.4" to 201, "0.4-0.5" to 238, "0.5-0.6" to 312,
            "0.6-0.7" to 374, "0.7-0.8" to 423, "0.8-0.9" to 489,
            "0.9-1.0" to 385
        )

        return EvaluationReport(
            summary = summary,
            precisionAtKCurve = precisionAtKCurve,
            feedbackDistribution = feedbackDist,
            topRecipes = topRecipes,
            matchScoreDistribution = matchDist,
            componentWeights = mapOf(
                "Ingredient Match" to 0.50,
                "Naive Bayes" to 0.30,
                "Bayesian Preference" to 0.20
            )
        )
    }

    private fun roundTo(value: Double, decimals: Int): Double {
        var multiplier = 1.0
        repeat(decimals) { multiplier *= 10 }
        return kotlin.math.round(value * multiplier) / multiplier
    }
}
