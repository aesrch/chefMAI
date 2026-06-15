package com.example.service

import com.example.dto.RcpResponse
import com.example.dto.metrics.MetricsRequest
import com.example.dto.metrics.MetricsResponse
import com.example.dto.metrics.RecipeMetrics
import com.example.repository.RcpRepository

class MetricsService(
    private val rcpRepository: RcpRepository
) {

    fun evaluate(request: MetricsRequest): MetricsResponse {
        val recipes = request.recipeIDs.mapNotNull { rcpRepository.getRecipeByID(it) }
        if (recipes.isEmpty()) {
            return MetricsResponse(
                suitabilityRate = 0.0,
                precisionAtK = 0.0,
                ingredientMatchScore = 0.0,
                k = request.k,
                totalRecipes = 0,
                relevantRecipes = 0,
                recipes = emptyList()
            )
        }

        val userIngrs = request.userIngredients.map { it.lowercase().trim() }
        val threshold = 0.5

        val recipeMetrics = recipes.map { recipe ->
            val matchScore = ingredientMatchScore(recipe, userIngrs)
            RecipeMetrics(
                rcpID = recipe.rcpID,
                name = recipe.name,
                ingredientMatchScore = matchScore,
                isSuitable = matchScore >= threshold
            )
        }

        val avgIngredientMatch = recipeMetrics.map { it.ingredientMatchScore }.average()
        val totalRecipes = recipeMetrics.size
        val relevantRecipes = recipeMetrics.count { it.isSuitable }
        val suitabilityRate = if (totalRecipes > 0) {
            relevantRecipes.toDouble() / totalRecipes.toDouble()
        } else 0.0

        val sorted = recipeMetrics.sortedByDescending { it.ingredientMatchScore }
        val k = request.k.coerceAtMost(sorted.size)
        val topK = sorted.take(k)
        val relevantInTopK = topK.count { it.isSuitable }
        val precisionAtK = if (k > 0) relevantInTopK.toDouble() / k.toDouble() else 0.0

        return MetricsResponse(
            suitabilityRate = Math.round(suitabilityRate * 100.0) / 100.0,
            precisionAtK = Math.round(precisionAtK * 100.0) / 100.0,
            ingredientMatchScore = Math.round(avgIngredientMatch * 100.0) / 100.0,
            k = k,
            totalRecipes = totalRecipes,
            relevantRecipes = relevantRecipes,
            recipes = recipeMetrics
        )
    }

    private fun ingredientMatchScore(recipe: RcpResponse, userIngredients: List<String>): Double {
        val recipeIngrs = recipe.ingredients.map { it.lowercase().trim() }
        if (recipeIngrs.isEmpty()) return 0.0

        val matched = userIngredients.count { ui ->
            recipeIngrs.any { ri -> ri.contains(ui) || ui.contains(ri) }
        }
        return matched.toDouble() / recipeIngrs.size.toDouble()
    }
}
