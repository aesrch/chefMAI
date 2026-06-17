package com.example.routes

import com.example.service.MetricsService
import io.ktor.server.routing.*
import io.ktor.server.application.*
import io.ktor.server.response.*
import io.ktor.http.*

fun Route.metricsRoutes(metricsService: MetricsService) {
    route("/metrics") {

        // GET /metrics/summary
        // Returns comprehensive metrics: Precision, Recall, F1, avg match score, etc.
        get("/summary") {
            val metrics = metricsService.computeMetrics()
            call.respond(metrics)
        }

        // GET /metrics/precision-at-k/{k}
        // Returns Precision@K details for a specific K value
        get("/precision-at-k/{k}") {
            val k = call.parameters["k"]?.toIntOrNull()
            if (k == null || k <= 0) {
                call.respond(HttpStatusCode.BadRequest, "K must be a positive integer")
                return@get
            }

            val result = metricsService.getPrecisionAtKDetail(k)
            call.respond(result)
        }
    }
}
