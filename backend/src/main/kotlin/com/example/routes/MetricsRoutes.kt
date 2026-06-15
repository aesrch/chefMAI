package com.example.routes

import com.example.dto.metrics.MetricsRequest
import com.example.service.MetricsService
import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*

fun Route.metricsRoutes(service: MetricsService) {

    post("/metrics/evaluate") {
        val req = try {
            call.receive<MetricsRequest>()
        } catch (e: Exception) {
            return@post call.respond(HttpStatusCode.BadRequest, "Invalid request body")
        }

        if (req.recipeIDs.isEmpty()) {
            return@post call.respond(HttpStatusCode.BadRequest, "At least one recipeID is required")
        }
        if (req.userIngredients.isEmpty()) {
            return@post call.respond(HttpStatusCode.BadRequest, "At least one user ingredient is required")
        }

        val result = service.evaluate(req)
        call.respond(result)
    }
}
