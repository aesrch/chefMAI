package com.example.service

import com.example.dto.RcpResponse

/**
 * Ingredient Match Scoring Service.
 * Computes: IngredientMatchScore = |available ∩ required| / |required|
 */
class MatchScoringService {

    data class MatchResult(
        val score: Double,
        val matchedIngredients: List<String>,
        val missingIngredients: List<String>
    )

    /**
     * Compute the ingredient match score for a single recipe.
     *
     * @param recipeIngredients list of ingredients required by the recipe
     * @param userIngredients list of ingredients available to the user
     * @return MatchResult with score (0.0 - 1.0), matched, and missing lists
     */
    fun computeMatchScore(
        recipeIngredients: List<String>,
        userIngredients: List<String>
    ): MatchResult {
        if (recipeIngredients.isEmpty()) {
            return MatchResult(0.0, emptyList(), emptyList())
        }

        val userNormalized = userIngredients.map { it.lowercase().trim() }
        val matched = mutableListOf<String>()
        val missing = mutableListOf<String>()

        for (recipeIng in recipeIngredients) {
            val rNorm = recipeIng.lowercase().trim()
            val isMatched = userNormalized.any { ui ->
                // Fuzzy matching: check if either contains the other,
                // or if the first word matches (e.g., "olive oil" matches "olive")
                rNorm.contains(ui) ||
                        ui.contains(rNorm) ||
                        rNorm.split(" ").first().let { firstWord ->
                            firstWord.length > 2 && ui.contains(firstWord)
                        } ||
                        ui.split(" ").first().let { firstWord ->
                            firstWord.length > 2 && rNorm.contains(firstWord)
                        }
            }

            if (isMatched) matched.add(recipeIng)
            else missing.add(recipeIng)
        }

        val score = matched.size.toDouble() / recipeIngredients.size.toDouble()
        return MatchResult(score, matched, missing)
    }

    /**
     * Score all recipes against user's ingredients and return sorted results.
     *
     * @param recipes list of all recipes
     * @param userIngredients list of user's available ingredients
     * @return list of pairs (recipe, matchResult) sorted by score descending
     */
    fun scoreAllRecipes(
        recipes: List<RcpResponse>,
        userIngredients: List<String>
    ): List<Pair<RcpResponse, MatchResult>> {
        return recipes.map { recipe ->
            val result = computeMatchScore(recipe.ingredients, userIngredients)
            recipe to result
        }.sortedByDescending { it.second.score }
    }
}
