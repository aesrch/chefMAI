package com.example.dto.metrics
import kotlinx.serialization.Serializable

@Serializable
data class RecipeMetrics(
    val rcpID: String,
    val name: String,
    val ingredientMatchScore: Double,
    val isSuitable: Boolean
)

@Serializable
data class MetricsResponse(
    val suitabilityRate: Double,
    val precisionAtK: Double,
    val ingredientMatchScore: Double,
    val k: Int,
    val totalRecipes: Int,
    val relevantRecipes: Int,
    val recipes: List<RecipeMetrics>
)
