package com.example.routes

import com.example.dto.preference.TrackInteractionRequest
import com.example.service.BayesianPreferenceService
import com.example.repository.UserPreferenceRepository
import io.ktor.server.routing.*
import io.ktor.server.application.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.http.*
import io.ktor.server.sessions.*
import com.example.session.UserSession

fun Route.preferenceRoutes(prefService: BayesianPreferenceService) {
    route("/preferences") {

        // POST /preferences/track
        // Body: { "rcpId": "rcp-001", "genre": "Meal", "interaction": "like", "ratingValue": null }
        // Track a user interaction for preference learning
        post("/track") {
            val session = call.sessions.get<UserSession>()
                ?: return@post call.respond(HttpStatusCode.Unauthorized, "Login required")

            val req = call.receive<TrackInteractionRequest>()

            val validInteractions = listOf("view", "cook", "like", "dislike", "save", "rate")
            if (req.interaction !in validInteractions) {
                call.respond(
                    HttpStatusCode.BadRequest,
                    "Interaction must be one of: ${validInteractions.joinToString()}"
                )
                return@post
            }

            try {
                prefService.trackInteraction(
                    accId = session.accID,
                    rcpId = req.rcpId,
                    genre = req.genre,
                    interaction = req.interaction,
                    ratingValue = req.ratingValue
                )
                call.respond(HttpStatusCode.Created, "Interaction tracked")
            } catch (e: Exception) {
                e.printStackTrace()
                call.respond(
                    HttpStatusCode.BadRequest,
                    "Failed to track interaction: ${e.message}"
                )
            }
        }

        // GET /preferences/scores
        // Get preference summary for the logged-in user
        get("/scores") {
            val session = call.sessions.get<UserSession>()
                ?: return@get call.respond(HttpStatusCode.Unauthorized, "Login required")

            val genreScores = prefService.getUserPreferenceSummary(session.accID)
            val totalInteractions = com.example.repository.UserPreferenceRepository()
                .getTotalInteractions(session.accID)

            call.respond(
                com.example.dto.preference.UserPreferenceScores(
                    accId = session.accID,
                    genreAffinities = genreScores,
                    totalInteractions = totalInteractions.toInt(),
                    topGenres = genreScores.entries
                        .sortedByDescending { it.value }
                        .take(3)
                        .map { it.key }
                )
            )
        }
    }
}
