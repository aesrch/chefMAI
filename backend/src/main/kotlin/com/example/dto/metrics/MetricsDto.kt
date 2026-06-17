package com.example.dto.metrics

import kotlinx.serialization.Serializable

@Serializable
data class MetricsSummary(
    val totalRecommendations: Int,
    val totalAccepted: Int,
    val totalRejected: Int,
    val totalCooked: Int,
    val totalIgnored: Int,
    val precision: Double,
    val recall: Double,
    val f1Score: Double,
    val averageIngredientMatchScore: Double,
    val suitabilityRate: Double,
    val precisionAtK: Map<Int, Double>
)

@Serializable
data class PrecisionAtKResponse(
    val k: Int,
    val precision: Double,
    val relevantInTopK: Int,
    val totalTopK: Int
)
