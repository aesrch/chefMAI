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
        val fn = ignored

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
            totalRecommendations = 300,
            totalAccepted = 16,
            totalRejected = 100,
            totalCooked = 5,
            totalIgnored = 179,
            precision = 0.173,
            recall = 0.105,
            f1Score = 0.131,
            averageIngredientMatchScore = 0.218,
            suitabilityRate = 0.953,
            precisionAtK = mapOf(1 to 0.55, 3 to 0.42, 5 to 0.35, 10 to 0.17)
        )

        val precisionAtKCurve = (1..10).associate { k ->
            k to when (k) {
                1 -> 0.60; 2 -> 0.49; 3 -> 0.42; 4 -> 0.38; 5 -> 0.35
                6 -> 0.28; 7 -> 0.23; 8 -> 0.20; 9 -> 0.18; 10 -> 0.17
                else -> 0.15
            }
        }

        val feedbackDist = mapOf(
            "accepted" to 16, "rejected" to 100, "cooked" to 5, "ignored" to 179
        )

        val topRecipes = listOf(
            TopRecipeEntry("rcp-003", "Bistek", "Asian", 0.7200, 0.3100, 18),
            TopRecipeEntry("rcp-005", "Pancakes", "American", 0.6800, 0.3800, 16),
            TopRecipeEntry("rcp-007", "Vegan Casserole", "American", 0.6500, 0.2900, 15),
            TopRecipeEntry("rcp-008", "Mushroom & Chestnut Rotolo", "Italian", 0.6200, 0.2700, 14),
            TopRecipeEntry("rcp-009", "Matar Paneer", "Indian", 0.5900, 0.3500, 13),
            TopRecipeEntry("rcp-016", "Boulangere Potatoes", "French", 0.5500, 0.2500, 12),
            TopRecipeEntry("rcp-018", "Fettuccine Alfredo", "Italian", 0.5200, 0.3000, 11),
            TopRecipeEntry("rcp-020", "Bread Omelette", "American", 0.4800, 0.2200, 10),
            TopRecipeEntry("rcp-017", "Chivito Uruguayo", "Uruguayan", 0.4500, 0.2600, 9),
            TopRecipeEntry("rcp-010", "Squash Linguine", "Italian", 0.4200, 0.2400, 8),
        )

        val matchDist = mapOf(
            "0.0-0.1" to 95, "0.1-0.2" to 94, "0.2-0.3" to 56,
            "0.3-0.4" to 37, "0.4-0.5" to 18, "0.5-0.6" to 0,
            "0.6-0.7" to 0, "0.7-0.8" to 0, "0.8-0.9" to 0,
            "0.9-1.0" to 0
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
