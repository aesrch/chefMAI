package com.example.service

import com.example.dto.SubstituteOption
import com.example.dto.SubstitutionRequest
import com.example.dto.SubstitutionResponse

class SubstitutionService {

    suspend fun findSubstitute(request: SubstitutionRequest): SubstitutionResponse {
        // TODO: Replace this dummy data with your actual YOLO AI or MySQL logic later!
        
        val fakeSubstitutes = listOf(
            SubstituteOption(
                name = "Greek Yogurt",
                amountRequired = request.amount ?: "Same amount",
                explanation = "A great alternative that provides a similar texture."
            )
        )

        return SubstitutionResponse(
            originalIngredient = request.ingredientName,
            substitutes = fakeSubstitutes
        )
    }
}