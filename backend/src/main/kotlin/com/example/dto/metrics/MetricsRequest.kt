package com.example.dto.metrics
import kotlinx.serialization.Serializable

@Serializable
data class MetricsRequest(
    val recipeIDs: List<String>,
    val userIngredients: List<String>,
    val k: Int = 5
)
