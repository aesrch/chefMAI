package com.example.service

import com.example.dto.metrics.MetricsSummary
import com.example.dto.metrics.PrecisionAtKResponse
import com.example.repository.RecommendationLogRepository

/**
 * Performance Metrics and Evaluation Service.
 *
 * Computes:
 * - Precision: TP / (TP + FP)
 * - Recall: TP / (TP + FN)
 * - F1 Score: 2 * (Precision * Recall) / (Precision + Recall)
 * - Average Ingredient Match Score
 * - Suitability Rate
 * - Precision@K
 *
 * Where:
 * - TP (True Positive) = recommendation accepted or cooked
 * - FP (False Positive) = recommendation rejected
 * - FN (False Negative) = not recommended but would have been relevant (approximated)
 */
class MetricsService(
    private val logRepo: RecommendationLogRepository
) {

    /**
     * Compute comprehensive metrics summary.
     */
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

        // True Positives: accepted or cooked
        val tp = accepted + cooked
        // False Positives: rejected
        val fp = rejected
        // We approximate False Negatives as 0 since we can't know what wasn't recommended
        // In practice, this means recall = tp / (tp + 0) = 1.0 (ceiling)
        // A more realistic approach: use ignored as partial FN
        val fn = (ignored * 0.1).toInt() // 10% of ignored assumed relevant

        val precision = if (tp + fp > 0) tp.toDouble() / (tp + fp) else 0.0
        val recall = if (tp + fn > 0) tp.toDouble() / (tp + fn) else 0.0
        val f1Score = if (precision + recall > 0) {
            2.0 * (precision * recall) / (precision + recall)
        } else 0.0

        // Average Ingredient Match Score
        val avgIngredientMatch = allLogs.map { it.ingredientMatch }.average()

        // Suitability Rate: percentage of recipes with NB suitability > 0.5
        val suitabilityRate = allLogs.count { it.nbSuitability > 0.5 }.toDouble() / total

        // Precision@K for K = 1, 3, 5, 10
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

    /**
     * Compute Precision@K: proportion of relevant items in the top-K recommendations.
     * "Relevant" = accepted or cooked.
     */
    fun computePrecisionAtK(k: Int): Double {
        val allLogs = logRepo.getAllLogs()
        if (allLogs.isEmpty()) return 0.0

        // Group by user and compute precision@K per user, then average
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

    /**
     * Get Precision@K details for a specific K value.
     */
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

    private fun roundTo(value: Double, decimals: Int): Double {
        var multiplier = 1.0
        repeat(decimals) { multiplier *= 10 }
        return kotlin.math.round(value * multiplier) / multiplier
    }
}
