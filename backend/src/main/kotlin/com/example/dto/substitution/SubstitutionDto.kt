package com.example.dto.substitution

import kotlinx.serialization.Serializable

@Serializable
data class SubstitutionDto(
    val subId: String,
    val originalName: String,
    val substituteName: String,
    val ratio: String?,
    val notes: String?,
    val category: String?,
    val confidence: Double
)

@Serializable
data class SubstitutionRequest(
    val ingredientName: String
)

@Serializable
data class RecipeSubstitutionResponse(
    val rcpId: String,
    val recipeName: String,
    val missingIngredients: List<String>,
    val substitutions: Map<String, List<SubstitutionDto>>
)
