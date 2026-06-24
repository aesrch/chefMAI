package com.example.dto

import kotlinx.serialization.Serializable

@Serializable
data class SubstitutionRequest(
    val ingredientName: String,
    val amount: String? = null,
    val allergyContext: String? = null
)

@Serializable
data class SubstitutionResponse(
    val originalIngredient: String,
    val substitutes: List<SubstituteOption>
)

@Serializable
data class SubstituteOption(
    val name: String,
    val amountRequired: String,
    val explanation: String
)