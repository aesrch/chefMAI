package com.example.service

import com.example.client.YoloClient
import com.example.dto.detection.DetectionResponseDto
import com.example.dto.detection.IngredientDto
import kotlinx.serialization.json.Json
import kotlinx.serialization.decodeFromString

class YoloService(
    private val yoloClient: YoloClient
) {

    suspend fun analyzeImage(image: ByteArray): DetectionResponseDto {

    // YOLO client returns a raw JSON string
    val detectionJson = yoloClient.detectIngredients(image)

    // Deserialize JSON into DetectionResponseDto
    val detection: DetectionResponseDto = Json.decodeFromString(detectionJson)

    // Filter duplicates
    val cleanedIngredients = detection.ingredients
        .distinctBy { it.name.lowercase() }

    return DetectionResponseDto(
        ingredients = cleanedIngredients
    )
}
}
