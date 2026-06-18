package com.example.dto.metrics

import kotlinx.serialization.Serializable

@Serializable
data class EvaluationReport(
    val summary: MetricsSummary,
    val precisionAtKCurve: Map<Int, Double>,
    val feedbackDistribution: Map<String, Int>,
    val topRecipes: List<TopRecipeEntry>,
    val matchScoreDistribution: Map<String, Int>,
    val componentWeights: Map<String, Double>
)

@Serializable
data class TopRecipeEntry(
    val rcpId: String,
    val recipeName: String,
    val genre: String,
    val avgFinalScore: Double,
    val avgIngredientMatch: Double,
    val totalRecommendations: Int
)

@Serializable
data class EvaluationTestResult(
    val scenarios: List<ScenarioResult>,
    val summaryStats: Map<String, SummaryStatsMap>,
    val globalMetrics: MetricsSummary?,
    val precisionAtKCurve: Map<Int, Double>,
    val rawResults: List<RawResultEntry>,
    val timestamp: String
)

@Serializable
data class ScenarioResult(
    val id: Int,
    val category: String,
    val ingredients: List<String>,
    val metrics: ScenarioMetrics
)

@Serializable
data class ScenarioMetrics(
    val precision: Double,
    val recall: Double,
    val f1: Double,
    val suitabilityRate: Double,
    val avgMatchScore: Double,
    val pAt5: Double,
    val pAt10: Double,
    val pAtK: Map<Int, Double>
)

@Serializable
data class SummaryStatsMap(
    val mean: Double,
    val median: Double,
    val min: Double,
    val max: Double,
    val std: Double
)

@Serializable
data class RawResultEntry(
    val scenarioId: Int,
    val category: String,
    val recipeId: String,
    val recipeName: String,
    val genre: String,
    val matchScore: Double,
    val nbSuitability: Double,
    val preferenceScore: Double,
    val finalScore: Double,
    val feedback: String
)
