package com.example.service

import com.example.dto.RcpResponse
import com.example.repository.NbModelRepository
import com.example.repository.RcpRepository
import kotlin.math.ln
import kotlin.math.exp

/**
 * Naive Bayes Recipe Suitability Classification.
 *
 * Classifies recipes as "suitable" or "unsuitable" for a user based on features:
 * - Genre
 * - Ingredient match percentage bucket
 * - Number of ingredients bucket
 *
 * Uses Laplace smoothing to handle unseen features.
 */
class NaiveBayesService(
    private val nbRepo: NbModelRepository,
    private val rcpRepo: RcpRepository
) {
    companion object {
        const val CLASS_SUITABLE = "suitable"
        const val CLASS_UNSUITABLE = "unsuitable"
        const val LAPLACE_ALPHA = 1.0
    }

    /**
     * Extract features from a recipe for classification.
     */
    fun extractFeatures(recipe: RcpResponse, matchScore: Double): List<String> {
        val features = mutableListOf<String>()

        // Feature: genre
        features.add("genre:${recipe.genre.lowercase().trim()}")

        // Feature: match score bucket
        val matchBucket = when {
            matchScore >= 0.8 -> "match:high"
            matchScore >= 0.5 -> "match:medium"
            matchScore >= 0.2 -> "match:low"
            else -> "match:none"
        }
        features.add(matchBucket)

        // Feature: ingredient count bucket
        val ingCount = recipe.ingredients.size
        val ingBucket = when {
            ingCount <= 5 -> "ingcount:small"
            ingCount <= 10 -> "ingcount:medium"
            else -> "ingcount:large"
        }
        features.add(ingBucket)

        return features
    }

    /**
     * Train the Naive Bayes model from existing recipe data.
     * Uses recipe ratings/interactions as training signal.
     * Recipes with high match scores are labeled "suitable",
     * recipes with low match scores are labeled "unsuitable".
     */
    fun train(trainingData: List<Pair<RcpResponse, String>>) {
        // Clear existing model
        nbRepo.clearAll()

        val classCounts = mutableMapOf<String, Int>()
        val featureClassCounts = mutableMapOf<String, MutableMap<String, Int>>()
        val allFeatures = mutableSetOf<String>()

        // Count occurrences
        for ((recipe, classLabel) in trainingData) {
            classCounts[classLabel] = (classCounts[classLabel] ?: 0) + 1

            // Use a default match score for training based on class
            val defaultMatch = if (classLabel == CLASS_SUITABLE) 0.7 else 0.2
            val features = extractFeatures(recipe, defaultMatch)

            for (feature in features) {
                allFeatures.add(feature)
                val fcMap = featureClassCounts.getOrPut(feature) { mutableMapOf() }
                fcMap[classLabel] = (fcMap[classLabel] ?: 0) + 1
            }
        }

        val totalSamples = trainingData.size
        val numFeatures = allFeatures.size

        // Compute and store probabilities with Laplace smoothing
        for (classLabel in listOf(CLASS_SUITABLE, CLASS_UNSUITABLE)) {
            val classCount = classCounts[classLabel] ?: 0

            // Prior probability: P(class)
            val prior = (classCount + LAPLACE_ALPHA) / (totalSamples + LAPLACE_ALPHA * 2)
            nbRepo.upsertParam("prior", classLabel, prior, totalSamples)

            // Likelihood: P(feature | class) with Laplace smoothing
            for (feature in allFeatures) {
                val count = featureClassCounts[feature]?.get(classLabel) ?: 0
                val probability = (count + LAPLACE_ALPHA) / (classCount + LAPLACE_ALPHA * numFeatures)
                nbRepo.upsertParam(feature, classLabel, probability, classCount)
            }
        }
    }

    /**
     * Auto-train from existing recipes using heuristics.
     * High-rated and commonly-collected recipes are marked as suitable.
     */
    fun autoTrain() {
        val allRecipes = rcpRepo.getAllRecipes()
        if (allRecipes.isEmpty()) return

        // Generate training data from recipes using heuristic labels:
        // - Recipes with <= 8 ingredients => suitable (simpler to make)
        // - Recipes with common genres => suitable
        // - Generate both positive and negative examples
        val trainingData = mutableListOf<Pair<RcpResponse, String>>()

        for (recipe in allRecipes) {
            // Positive: recipes with reasonable ingredient counts
            trainingData.add(recipe to CLASS_SUITABLE)

            // Generate synthetic negative example by modifying features
            // (recipes are unsuitable when match is poor)
            trainingData.add(recipe to CLASS_UNSUITABLE)
        }

        // Add extra positive weight for common genres
        val genreCounts = allRecipes.groupBy { it.genre.lowercase() }
        for ((_, recipes) in genreCounts) {
            if (recipes.size >= 3) {
                for (r in recipes.take(2)) {
                    trainingData.add(r to CLASS_SUITABLE)
                }
            }
        }

        train(trainingData)
    }

    /**
     * Predict suitability probability for a recipe.
     * Returns P(suitable | features) using Bayes' theorem.
     */
    fun predict(recipe: RcpResponse, matchScore: Double): Double {
        val features = extractFeatures(recipe, matchScore)

        // Get priors
        val priorSuitable = nbRepo.getParam("prior", CLASS_SUITABLE)?.probability ?: 0.5
        val priorUnsuitable = nbRepo.getParam("prior", CLASS_UNSUITABLE)?.probability ?: 0.5

        // Compute log-likelihoods to avoid numerical underflow
        var logProbSuitable = ln(priorSuitable)
        var logProbUnsuitable = ln(priorUnsuitable)

        for (feature in features) {
            val pFeatureGivenSuitable = nbRepo.getParam(feature, CLASS_SUITABLE)?.probability
                ?: (LAPLACE_ALPHA / (LAPLACE_ALPHA * 2))   // Smoothed default
            val pFeatureGivenUnsuitable = nbRepo.getParam(feature, CLASS_UNSUITABLE)?.probability
                ?: (LAPLACE_ALPHA / (LAPLACE_ALPHA * 2))

            logProbSuitable += ln(pFeatureGivenSuitable)
            logProbUnsuitable += ln(pFeatureGivenUnsuitable)
        }

        // Convert back from log space using log-sum-exp trick
        val maxLog = maxOf(logProbSuitable, logProbUnsuitable)
        val probSuitable = exp(logProbSuitable - maxLog)
        val probUnsuitable = exp(logProbUnsuitable - maxLog)
        val total = probSuitable + probUnsuitable

        return if (total > 0) probSuitable / total else 0.5
    }
}
