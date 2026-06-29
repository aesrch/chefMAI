package com.example.routes

import com.example.service.MetricsService
import com.example.service.EvaluationService
import io.ktor.server.routing.*
import io.ktor.server.application.*
import io.ktor.server.response.*
import io.ktor.http.*
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json

fun Route.metricsRoutes(metricsService: MetricsService) {
    route("/metrics") {

        get("/summary") {
            val metrics = metricsService.computeMetrics()
            call.respond(metrics)
        }

        get("/precision-at-k/{k}") {
            val k = call.parameters["k"]?.toIntOrNull()
            if (k == null || k <= 0) {
                call.respond(HttpStatusCode.BadRequest, "K must be a positive integer")
                return@get
            }

            val result = metricsService.getPrecisionAtKDetail(k)
            call.respond(result)
        }

        get("/report") {
            val report = metricsService.computeEvaluationReport()
            call.respond(report)
        }
    }
}

fun Route.evaluationRoutes(evaluationService: EvaluationService) {
    route("/metrics") {

        post("/run-evaluation") {
            try {
                val result = evaluationService.runEvaluation()
                call.respond(result)
            } catch (e: Exception) {
                call.respond(HttpStatusCode.InternalServerError, "Evaluation failed: ${e.message}")
            }
        }

        get("/export/csv") {
            try {
                val result = evaluationService.runEvaluation()
                val csv = buildCsv(result)
                call.response.header(HttpHeaders.ContentDisposition, "attachment; filename=metrics.csv")
                call.respondText(csv, ContentType.Text.CSV)
            } catch (e: Exception) {
                call.respond(HttpStatusCode.InternalServerError, "Export failed: ${e.message}")
            }
        }

        get("/export/md") {
            try {
                val result = evaluationService.runEvaluation()
                val md = buildMarkdownReport(result)
                call.response.header(HttpHeaders.ContentDisposition, "attachment; filename=evaluation_report.md")
                call.respondText(md, ContentType.Text.Plain)
            } catch (e: Exception) {
                call.respond(HttpStatusCode.InternalServerError, "Export failed: ${e.message}")
            }
        }
    }
}

private fun buildCsv(result: com.example.dto.metrics.EvaluationTestResult): String {
    val sb = StringBuilder()
    sb.appendLine("ScenarioID,Category,Precision,Recall,F1_Score,SuitabilityRate,AvgIngredientMatchScore,Precision_at_5,Precision_at_10")
    for (sc in result.scenarios) {
        val m = sc.metrics
        sb.appendLine("${sc.id},${sc.category},${m.precision},${m.recall},${m.f1},${m.suitabilityRate},${m.avgMatchScore},${m.pAt5},${m.pAt10}")
    }
    return sb.toString()
}

private fun buildMarkdownReport(result: com.example.dto.metrics.EvaluationTestResult): String {
    val s = result.summaryStats
    return """# Chef MAI Recommendation System Evaluation Report

## 1. Methodology

The evaluation was performed by creating 30 unique recommendation scenarios across 5 categories (High Match, Medium Match, Low Match, Missing Ingredients, Substitutions).

## 2. Statistical Summary

| Metric | Mean | Median | Min | Max | Std Dev |
|:---|---|---|---|---|---|
| **Precision** | ${s["Precision"]?.mean} | ${s["Precision"]?.median} | ${s["Precision"]?.min} | ${s["Precision"]?.max} | ${s["Precision"]?.std} |
| **Recall** | ${s["Recall"]?.mean} | ${s["Recall"]?.median} | ${s["Recall"]?.min} | ${s["Recall"]?.max} | ${s["Recall"]?.std} |
| **F1 Score** | ${s["F1 Score"]?.mean} | ${s["F1 Score"]?.median} | ${s["F1 Score"]?.min} | ${s["F1 Score"]?.max} | ${s["F1 Score"]?.std} |
| **Suitability Rate** | ${s["Suitability Rate"]?.mean} | ${s["Suitability Rate"]?.median} | ${s["Suitability Rate"]?.min} | ${s["Suitability Rate"]?.max} | ${s["Suitability Rate"]?.std} |
| **Ingredient Match Score** | ${s["Ingredient Match Score"]?.mean} | ${s["Ingredient Match Score"]?.median} | ${s["Ingredient Match Score"]?.min} | ${s["Ingredient Match Score"]?.max} | ${s["Ingredient Match Score"]?.std} |
| **Precision@5** | ${s["Precision@5"]?.mean} | ${s["Precision@5"]?.median} | ${s["Precision@5"]?.min} | ${s["Precision@5"]?.max} | ${s["Precision@5"]?.std} |
| **Precision@10** | ${s["Precision@10"]?.mean} | ${s["Precision@10"]?.median} | ${s["Precision@10"]?.min} | ${s["Precision@10"]?.max} | ${s["Precision@10"]?.std} |

## 3. Scoring Formula

FinalScore = (0.50 × IngredientMatch) + (0.30 × NaiveBayes) + (0.20 × BayesianPreference)

## 4. Global Metrics (Logged)

| Metric | Value |
|---|---|
| Precision | ${result.globalMetrics?.precision} |
| Recall | ${result.globalMetrics?.recall} |
| F1 Score | ${result.globalMetrics?.f1Score} |
| Suitability Rate | ${result.globalMetrics?.suitabilityRate} |
| Avg Ingredient Match | ${result.globalMetrics?.averageIngredientMatchScore} |
| Total Recommendations | ${result.globalMetrics?.totalRecommendations} |

_Generated on: ${result.timestamp}_
"""
}
