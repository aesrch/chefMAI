package com.example.service

import com.example.repository.UserPreferenceRepository
import com.example.dto.RcpResponse

/**
 * Bayesian User Preference Learning Service.
 *
 * Uses a Beta distribution prior (α=1, β=1 uniform) updated with
 * user interaction signals to compute a preference score per recipe.
 *
 * Factors:
 * - Genre affinity: How often the user likes recipes in this genre
 * - Interaction history: Direct positive/negative interactions with this recipe
 * - Rating tendency: Average rating the user gives
 */
class BayesianPreferenceService(
    private val prefRepo: UserPreferenceRepository
) {

    companion object {
        // Beta distribution prior parameters (uniform prior)
        const val ALPHA_PRIOR = 1.0
        const val BETA_PRIOR = 1.0

        // Interaction weights for updating the Beta distribution
        val INTERACTION_WEIGHTS = mapOf(
            "cook" to 3.0,    // Strongest positive signal
            "rate" to 2.0,    // Strong signal (depends on rating value)
            "like" to 2.0,    // Positive signal
            "save" to 1.5,    // Moderate positive signal
            "view" to 0.5,    // Weak positive signal
            "dislike" to -2.0 // Negative signal
        )
    }

    /**
     * Compute the Bayesian preference score for a recipe for a specific user.
     * Returns a value between 0.0 and 1.0.
     *
     * The score is the posterior mean of the Beta distribution:
     * E[θ] = α / (α + β)
     *
     * where α is updated by positive signals and β by negative signals.
     */
    fun computePreferenceScore(accId: String, recipe: RcpResponse): Double {
        var alpha = ALPHA_PRIOR
        var beta = BETA_PRIOR

        val interactions = prefRepo.getInteractionsByUser(accId)

        // Factor 1: Genre affinity
        val genreAffinities = prefRepo.getGenreAffinities(accId)
        val totalInteractions = prefRepo.getTotalInteractions(accId).toDouble()

        if (totalInteractions > 0) {
            val recipeGenre = recipe.genre.lowercase().trim()
            val genreCount = genreAffinities[recipeGenre] ?: 0
            val genreAffinity = genreCount.toDouble() / totalInteractions

            // Update alpha/beta based on genre affinity
            alpha += genreAffinity * 2.0
            beta += (1.0 - genreAffinity) * 0.5
        }

        // Factor 2: Direct recipe interactions
        val recipeInteractions = interactions.filter { it.rcpId == recipe.rcpID }
        for (interaction in recipeInteractions) {
            val weight = INTERACTION_WEIGHTS[interaction.interaction] ?: 0.0

            if (weight > 0) {
                // For ratings, scale the weight by the rating value
                val adjustedWeight = if (interaction.interaction == "rate" && interaction.ratingValue != null) {
                    weight * (interaction.ratingValue.toDouble() / 5.0)
                } else {
                    weight
                }
                alpha += adjustedWeight
            } else {
                beta += kotlin.math.abs(weight)
            }
        }

        // Factor 3: Similar genre interactions (collaborative signal)
        val recipeGenre = recipe.genre.lowercase().trim()
        val sameGenreInteractions = interactions.filter {
            it.genre?.lowercase()?.trim() == recipeGenre
        }
        for (interaction in sameGenreInteractions) {
            val weight = (INTERACTION_WEIGHTS[interaction.interaction] ?: 0.0) * 0.3  // Reduced weight for indirect signal
            if (weight > 0) alpha += weight
            else beta += kotlin.math.abs(weight)
        }

        // Posterior mean of Beta distribution
        return alpha / (alpha + beta)
    }

    /**
     * Get preference scores summary for a user.
     */
    fun getUserPreferenceSummary(accId: String): Map<String, Double> {
        val genreAffinities = prefRepo.getGenreAffinities(accId)
        val total = genreAffinities.values.sum().toDouble().coerceAtLeast(1.0)

        return genreAffinities.mapValues { (_, count) ->
            count.toDouble() / total
        }
    }

    /**
     * Track a new user interaction.
     */
    fun trackInteraction(
        accId: String,
        rcpId: String?,
        genre: String?,
        interaction: String,
        ratingValue: Int? = null
    ) {
        prefRepo.trackInteraction(accId, rcpId, genre, interaction, ratingValue)
    }

    /**
     * Get recipe IDs that a user has positively interacted with.
     */
    fun getPositiveRecipeIds(accId: String): Set<String> {
        return prefRepo.getPositiveRecipeIds(accId)
    }
}
