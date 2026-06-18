package com.example.service

import com.example.dto.metrics.*
import com.example.dto.recommendation.ScoredRecipe
import com.example.db.AccTable
import com.example.repository.AccRepository
import com.example.repository.RecommendationLogRepository
import com.example.repository.UserPreferenceRepository
import org.mindrot.jbcrypt.BCrypt
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter
import kotlin.math.roundToInt

class EvaluationService(
    private val recommendationEngine: RecommendationEngine,
    private val metricsService: MetricsService,
    private val accRepo: AccRepository,
    private val logRepo: RecommendationLogRepository,
    private val prefRepo: UserPreferenceRepository
) {

    data class ScenarioDef(
        val id: Int,
        val category: String,
        val ingredients: List<String>
    )

    companion object {
        val EVAL_USERNAME = "evaluser"
        val EVAL_PASSWORD = "password123"

        val scenarios = listOf(
            ScenarioDef(1, "High Match", listOf("beef", "soysauce", "lemon", "garlic", "onion", "olive oil", "water", "salt")),
            ScenarioDef(2, "High Match", listOf("flour", "eggs", "milk", "sunflower oil", "sugar", "raspberries", "blueberries")),
            ScenarioDef(3, "High Match", listOf("bread", "eggs", "salt")),
            ScenarioDef(4, "High Match", listOf("onion", "thyme", "olive oil", "potatoes", "vegetable stock")),
            ScenarioDef(5, "High Match", listOf("fettuccine", "heavy cream", "butter", "parmesan", "parsley", "black pepper")),
            ScenarioDef(6, "Medium Match", listOf("beef", "garlic", "onion", "egg", "bread", "tomato")),
            ScenarioDef(7, "Medium Match", listOf("flour", "eggs", "milk", "butter", "sugar", "vanilla extract")),
            ScenarioDef(8, "Medium Match", listOf("potatoes", "eggs", "olive oil", "onion", "spinach", "tomato", "red wine vinegar")),
            ScenarioDef(9, "Medium Match", listOf("mushrooms", "garlic", "lasagne sheet", "breadcrumbs", "olive oil", "sage")),
            ScenarioDef(10, "Medium Match", listOf("paneer", "cumin", "tomato", "peas", "chili", "coriander")),
            ScenarioDef(11, "Medium Match", listOf("onion", "garlic", "tomato", "carrots", "celery", "red pepper", "kidney beans")),
            ScenarioDef(12, "Medium Match", listOf("strawberries", "blueberries", "banana", "orange juice", "sugar", "ice")),
            ScenarioDef(13, "Medium Match", listOf("butter", "flour", "sugar", "eggs", "milk", "dried fruit")),
            ScenarioDef(14, "Low Match", listOf("water", "salt")),
            ScenarioDef(15, "Low Match", listOf("black pepper", "olive oil")),
            ScenarioDef(16, "Low Match", listOf("cumin", "green chili")),
            ScenarioDef(17, "Low Match", listOf("cinnamon", "clear honey")),
            ScenarioDef(18, "Low Match", listOf("yeast", "caster sugar")),
            ScenarioDef(19, "Low Match", listOf("thyme", "rosemary")),
            ScenarioDef(20, "Low Match", listOf("ice", "fresh basil")),
            ScenarioDef(21, "Missing Ingredient", listOf("eggs", "milk", "sunflower oil", "sugar", "raspberries", "blueberries")),
            ScenarioDef(22, "Missing Ingredient", listOf("soysauce", "lemon", "garlic", "onion", "olive oil", "water", "salt")),
            ScenarioDef(23, "Missing Ingredient", listOf("heavy cream", "butter", "parmesan", "parsley", "black pepper")),
            ScenarioDef(24, "Missing Ingredient", listOf("sunflower oil", "cumin", "turmeric", "coriander", "green chili", "large tomato", "peas", "garam masala")),
            ScenarioDef(25, "Missing Ingredient", listOf("eggs", "salt")),
            ScenarioDef(26, "Substitution", listOf("red onion", "thyme", "olive oil", "potatoes", "vegetable stock")),
            ScenarioDef(27, "Substitution", listOf("fettuccine", "coconut cream", "butter", "parmesan", "parsley", "black pepper")),
            ScenarioDef(28, "Substitution", listOf("flour", "eggs", "oat milk", "sunflower oil", "sugar", "raspberries", "blueberries")),
            ScenarioDef(29, "Substitution", listOf("beef", "soysauce", "lime juice", "garlic", "onion", "olive oil", "water", "salt")),
            ScenarioDef(30, "Substitution", listOf("fettuccine", "heavy cream", "butter", "pecorino romano", "parsley", "black pepper"))
        )
    }

    fun runEvaluation(): EvaluationTestResult {
        val accId = setupEvalUser()

        logRepo.deleteByAccId(accId)
        prefRepo.deleteByAccId(accId)

        val rawResults = mutableListOf<RawResultEntry>()
        val scenarioResults = mutableListOf<ScenarioResult>()

        for (sc in scenarios) {
            val response = recommendationEngine.recommend(
                userIngredients = sc.ingredients,
                accId = accId,
                topK = 25
            )

            val allRecipes = response.recipes

            val top10 = allRecipes.take(10)
            var scenarioSuitables = 0

            for (recipe in top10) {
                val feedback = simulateFeedback(recipe.ingredientMatchScore)
                val interaction = when (feedback) {
                    "cooked" -> "cook"
                    "accepted" -> "like"
                    "rejected" -> "dislike"
                    else -> null
                }

                if (recipe.nbSuitabilityScore > 0.5) scenarioSuitables++

                if (interaction != null) {
                    prefRepo.trackInteraction(
                        accId = accId,
                        rcpId = recipe.rcpId,
                        genre = recipe.genre,
                        interaction = interaction
                    )
                }

                rawResults.add(RawResultEntry(
                    scenarioId = sc.id,
                    category = sc.category,
                    recipeId = recipe.rcpId,
                    recipeName = recipe.name,
                    genre = recipe.genre,
                    matchScore = roundTo4(recipe.ingredientMatchScore),
                    nbSuitability = roundTo4(recipe.nbSuitabilityScore),
                    preferenceScore = roundTo4(recipe.preferenceScore),
                    finalScore = roundTo4(recipe.finalScore),
                    feedback = feedback
                ))
            }

            val allRelevantInDb = allRecipes.count { it.ingredientMatchScore >= 0.5 }
            val tp = top10.count { it.ingredientMatchScore >= 0.5 }
            val fp = top10.count { it.ingredientMatchScore < 0.5 }
            val fn = (allRelevantInDb - tp).coerceAtLeast(0)

            val precision = if (top10.isNotEmpty()) tp.toDouble() / top10.size else 0.0
            val recall = if (allRelevantInDb > 0) tp.toDouble() / allRelevantInDb else 1.0
            val f1 = if (precision + recall > 0) 2.0 * precision * recall / (precision + recall) else 0.0
            val suitabilityRate = if (top10.isNotEmpty()) scenarioSuitables.toDouble() / top10.size else 0.0
            val avgMatchScore = if (top10.isNotEmpty()) top10.map { it.ingredientMatchScore }.average() else 0.0

            val pAtK = (1..10).associate { k ->
                val topK = top10.take(k)
                val relK = topK.count { it.ingredientMatchScore >= 0.5 }
                k to (if (k <= top10.size) relK.toDouble() / k else 0.0)
            }

            scenarioResults.add(ScenarioResult(
                id = sc.id,
                category = sc.category,
                ingredients = sc.ingredients,
                metrics = ScenarioMetrics(
                    precision = roundTo4(precision),
                    recall = roundTo4(recall),
                    f1 = roundTo4(f1),
                    suitabilityRate = roundTo4(suitabilityRate),
                    avgMatchScore = roundTo4(avgMatchScore),
                    pAt5 = roundTo4(pAtK[5] ?: 0.0),
                    pAt10 = roundTo4(pAtK[10] ?: 0.0),
                    pAtK = pAtK.mapValues { roundTo4(it.value) }
                )
            ))
        }

        bulkUpdateFeedback(accId)

        val globalSummary = metricsService.computeMetrics()

        logRepo.deleteByAccId(accId)
        prefRepo.deleteByAccId(accId)
        val precisionCurve = (1..10).associate { k ->
            k to metricsService.computePrecisionAtK(k)
        }

        val statsMap = computeSummaryStats(scenarioResults)

        return EvaluationTestResult(
            scenarios = scenarioResults,
            summaryStats = statsMap,
            globalMetrics = globalSummary,
            precisionAtKCurve = precisionCurve.mapValues { roundTo4(it.value) },
            rawResults = rawResults,
            timestamp = LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME)
        )
    }

    private fun setupEvalUser(): String {
        val existing = accRepo.findByUsername(EVAL_USERNAME)
        if (existing != null) {
            return existing[AccTable.accID]
        }

        val hashed = BCrypt.hashpw(EVAL_PASSWORD, BCrypt.gensalt())
        accRepo.createAccount(
            accName = "Eval User",
            accUserName = EVAL_USERNAME,
            hashedPass = hashed,
            accPresentation = "Evaluation Account",
            accLink = "",
            imgID = null
        )

        val user = accRepo.findByUsername(EVAL_USERNAME)
        return user?.get(AccTable.accID) ?: "acc-eval"
    }

    private fun simulateFeedback(matchScore: Double): String {
        return when {
            matchScore >= 0.75 -> "cooked"
            matchScore >= 0.5 -> "accepted"
            matchScore >= 0.2 -> "rejected"
            else -> "ignored"
        }
    }

    private fun bulkUpdateFeedback(accId: String) {
        val logs = logRepo.getLogsByUser(accId)
        for (log in logs) {
            val feedback = simulateFeedback(log.ingredientMatch)
            logRepo.updateFeedback(log.logId, feedback)
        }
    }

    private fun computeSummaryStats(scenarioResults: List<ScenarioResult>): Map<String, SummaryStatsMap> {
        val precisions = scenarioResults.map { it.metrics.precision }
        val recalls = scenarioResults.map { it.metrics.recall }
        val f1s = scenarioResults.map { it.metrics.f1 }
        val suitabilities = scenarioResults.map { it.metrics.suitabilityRate }
        val matchScores = scenarioResults.map { it.metrics.avgMatchScore }
        val p5s = scenarioResults.map { it.metrics.pAt5 }
        val p10s = scenarioResults.map { it.metrics.pAt10 }

        return mapOf(
            "Precision" to statsFor(precisions),
            "Recall" to statsFor(recalls),
            "F1 Score" to statsFor(f1s),
            "Suitability Rate" to statsFor(suitabilities),
            "Ingredient Match Score" to statsFor(matchScores),
            "Precision@5" to statsFor(p5s),
            "Precision@10" to statsFor(p10s)
        )
    }

    private fun statsFor(values: List<Double>): SummaryStatsMap {
        if (values.isEmpty()) return SummaryStatsMap(0.0, 0.0, 0.0, 0.0, 0.0)
        val sorted = values.sorted()
        val n = values.size
        val mean = values.average()
        val median = if (n % 2 == 1) sorted[n / 2] else (sorted[n / 2 - 1] + sorted[n / 2]) / 2.0
        val variance = values.map { (it - mean) * (it - mean) }.average()
        val std = kotlin.math.sqrt(variance)

        return SummaryStatsMap(
            mean = roundTo4(mean),
            median = roundTo4(median),
            min = roundTo4(sorted.first()),
            max = roundTo4(sorted.last()),
            std = roundTo4(std)
        )
    }

    private fun roundTo4(value: Double): Double {
        return kotlin.math.round(value * 10000.0) / 10000.0
    }
}
