package com.example.dto.recommendation

import kotlinx.serialization.Serializable
import com.example.dto.substitution.SubstitutionDto

@Serializable
data class RecommendationRequest(
    val ingredients: List<String>,
    val accId: String? = null,
    val topK: Int = 10
)

@Serializable
data class ScoredRecipe(
    val rcpId: String,
    val accId: String,
    val name: String,
    val ingredients: List<String>,
    val steps: List<String>,
    val img: String,
    val genre: String,
    val description: String,
    val amount: List<String>,
    val ingredientMatchScore: Double,
    val nbSuitabilityScore: Double,
    val preferenceScore: Double,
    val finalScore: Double,
    val matchedIngredients: List<String>,
    val missingIngredients: List<String>,
    val substitutions: Map<String, List<SubstitutionDto>> = emptyMap()
)

@Serializable
data class RecommendationResponse(
    val recipes: List<ScoredRecipe>,
    val totalEvaluated: Int,
    val userIngredients: List<String>
)

@Serializable
data class FeedbackRequest(
    val logId: String,
    val feedback: String   // accepted, rejected, cooked, ignored
)
