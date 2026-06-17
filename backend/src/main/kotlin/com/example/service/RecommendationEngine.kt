package com.example.service

import com.example.dto.RcpResponse
import com.example.dto.recommendation.ScoredRecipe
import com.example.dto.recommendation.RecommendationResponse
import com.example.repository.RcpRepository
import com.example.repository.RecommendationLogRepository

/**
 * Hybrid Recommendation Engine.
 *
 * Combines three signals into a final recommendation score:
 * FinalScore = (0.50 × IngredientMatchScore)
 *            + (0.30 × NaiveBayesSuitability)
 *            + (0.20 × BayesianPreferenceScore)
 *
 * Returns top-K ranked recipes with full score breakdowns.
 */
class RecommendationEngine(
    private val rcpRepo: RcpRepository,
    private val matchService: MatchScoringService,
    private val nbService: NaiveBayesService,
    private val prefService: BayesianPreferenceService,
    private val subService: SubstitutionService,
    private val logRepo: RecommendationLogRepository
) {

    companion object {
        const val WEIGHT_INGREDIENT_MATCH = 0.50
        const val WEIGHT_NB_SUITABILITY = 0.30
        const val WEIGHT_PREFERENCE = 0.20
    }

    /**
     * Generate recommendations for a user given their available ingredients.
     *
     * @param userIngredients ingredients the user has available
     * @param accId optional user account ID for personalized scores
     * @param topK number of top results to return
     * @return RecommendationResponse with scored and ranked recipes
     */
    fun recommend(
        userIngredients: List<String>,
        accId: String? = null,
        topK: Int = 10
    ): RecommendationResponse {
        // 1. Get all recipes from database
        val allRecipes = rcpRepo.getAllRecipes()

        if (allRecipes.isEmpty()) {
            return RecommendationResponse(
                recipes = emptyList(),
                totalEvaluated = 0,
                userIngredients = userIngredients
            )
        }

        // 2. Score each recipe
        val scoredRecipes = allRecipes.map { recipe ->
            scoreRecipe(recipe, userIngredients, accId)
        }

        // 3. Sort by final score descending, take top K
        val topRecipes = scoredRecipes
            .sortedByDescending { it.finalScore }
            .take(topK)

        // 4. Log recommendations (if user is logged in)
        if (accId != null) {
            for (scored in topRecipes) {
                logRepo.logRecommendation(
                    accId = accId,
                    rcpId = scored.rcpId,
                    ingredientMatch = scored.ingredientMatchScore,
                    nbSuitability = scored.nbSuitabilityScore,
                    preferenceScore = scored.preferenceScore,
                    finalScore = scored.finalScore
                )
            }
        }

        return RecommendationResponse(
            recipes = topRecipes,
            totalEvaluated = allRecipes.size,
            userIngredients = userIngredients
        )
    }

    /**
     * Score a single recipe across all three dimensions.
     */
    private fun scoreRecipe(
        recipe: RcpResponse,
        userIngredients: List<String>,
        accId: String?
    ): ScoredRecipe {
        // 1. Ingredient Match Score
        val matchResult = matchService.computeMatchScore(recipe.ingredients, userIngredients)
        val ingredientMatchScore = matchResult.score

        // 2. Naive Bayes Suitability
        val nbSuitability = nbService.predict(recipe, ingredientMatchScore)

        // 3. Bayesian User Preference
        val preferenceScore = if (accId != null) {
            prefService.computePreferenceScore(accId, recipe)
        } else {
            0.5  // Neutral score for anonymous users
        }

        // 4. Compute final weighted score
        val finalScore = (WEIGHT_INGREDIENT_MATCH * ingredientMatchScore) +
                (WEIGHT_NB_SUITABILITY * nbSuitability) +
                (WEIGHT_PREFERENCE * preferenceScore)

        // 5. Find substitutions for missing ingredients
        val substitutions = subService.findSubstitutionsForRecipe(
            matchResult.missingIngredients,
            userIngredients
        )

        return ScoredRecipe(
            rcpId = recipe.rcpID,
            accId = recipe.accID,
            name = recipe.name,
            ingredients = recipe.ingredients,
            steps = recipe.steps,
            img = recipe.img,
            genre = recipe.genre,
            description = recipe.description,
            amount = recipe.amount,
            ingredientMatchScore = roundTo(ingredientMatchScore, 4),
            nbSuitabilityScore = roundTo(nbSuitability, 4),
            preferenceScore = roundTo(preferenceScore, 4),
            finalScore = roundTo(finalScore, 4),
            matchedIngredients = matchResult.matchedIngredients,
            missingIngredients = matchResult.missingIngredients,
            substitutions = substitutions
        )
    }

    private fun roundTo(value: Double, decimals: Int): Double {
        var multiplier = 1.0
        repeat(decimals) { multiplier *= 10 }
        return kotlin.math.round(value * multiplier) / multiplier
    }
}
