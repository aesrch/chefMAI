package com.example.service

import com.example.dto.substitution.SubstitutionDto
import com.example.repository.SubstitutionRepository

/**
 * Smart Ingredient Substitution Engine.
 * Provides intelligent ingredient substitutions based on what the user has available.
 */
class SubstitutionService(
    private val substitutionRepo: SubstitutionRepository
) {

    /**
     * Find all possible substitutions for a missing ingredient.
     */
    fun findSubstitutionsFor(ingredientName: String): List<SubstitutionDto> {
        return substitutionRepo.findSubstitutions(ingredientName)
    }

    /**
     * Find substitutions that can be made with the user's available ingredients.
     */
    fun findAvailableSubstitutions(
        missingIngredient: String,
        userIngredients: List<String>
    ): List<SubstitutionDto> {
        return substitutionRepo.findAvailableSubstitutions(missingIngredient, userIngredients)
    }

    /**
     * For a recipe, find substitutions for all missing ingredients.
     * Returns a map of missing ingredient -> list of possible substitutions.
     */
    fun findSubstitutionsForRecipe(
        recipeIngredients: List<String>,
        userIngredients: List<String>
    ): Map<String, List<SubstitutionDto>> {
        val userNormalized = userIngredients.map { it.lowercase().trim() }
        val result = mutableMapOf<String, List<SubstitutionDto>>()

        for (recipeIngredient in recipeIngredients) {
            val normalized = recipeIngredient.lowercase().trim()
            // Check if user has this ingredient
            val userHas = userNormalized.any { ui ->
                normalized.contains(ui) || ui.contains(normalized.split(" ").first())
            }

            if (!userHas) {
                // Find substitutions for this missing ingredient
                val subs = substitutionRepo.findSubstitutions(recipeIngredient)
                if (subs.isNotEmpty()) {
                    result[recipeIngredient] = subs
                }
            }
        }

        return result
    }

    /**
     * Get all substitutions in the system.
     */
    fun getAllSubstitutions(): List<SubstitutionDto> {
        return substitutionRepo.getAll()
    }
}
