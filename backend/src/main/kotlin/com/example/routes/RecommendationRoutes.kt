package com.example.routes

import com.example.dto.recommendation.RecommendationRequest
import com.example.dto.recommendation.FeedbackRequest
import com.example.service.RecommendationEngine
import com.example.repository.RecommendationLogRepository
import io.ktor.server.routing.*
import io.ktor.server.application.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.http.*
import io.ktor.server.sessions.*
import com.example.session.UserSession

fun Route.recommendationRoutes(
    recommendationEngine: RecommendationEngine,
    logRepo: RecommendationLogRepository
) {
    route("/recommend") {

        // POST /recommend
        // Body: { "ingredients": ["garlic", "butter", "pasta"], "accId": "acc-xxx", "topK": 10 }
        // Returns ranked recipe recommendations with full score breakdowns
        post {
            val req = call.receive<RecommendationRequest>()

            if (req.ingredients.isEmpty()) {
                call.respond(HttpStatusCode.BadRequest, "At least one ingredient is required")
                return@post
            }

            // Use session accId if not provided in request
            val accId = req.accId ?: call.sessions.get<UserSession>()?.accID

            val result = recommendationEngine.recommend(
                userIngredients = req.ingredients,
                accId = accId,
                topK = req.topK
            )

            call.respond(result)
        }

        // POST /recommend/feedback
        // Body: { "logId": "log-xxx", "feedback": "accepted" }
        // Update feedback for a recommendation
        post("/feedback") {
            val req = call.receive<FeedbackRequest>()

            val validFeedback = listOf("accepted", "rejected", "cooked", "ignored")
            if (req.feedback !in validFeedback) {
                call.respond(
                    HttpStatusCode.BadRequest,
                    "Feedback must be one of: ${validFeedback.joinToString()}"
                )
                return@post
            }

            logRepo.updateFeedback(req.logId, req.feedback)
            call.respond(HttpStatusCode.OK, "Feedback recorded")
        }
    }
}
