package com.example.dto.detection

import kotlinx.serialization.Serializable

@Serializable
data class DetectionResponseDto(
    val ingredients: List<IngredientDto>
)
