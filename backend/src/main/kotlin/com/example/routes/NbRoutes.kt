package com.example.routes

import com.example.service.NaiveBayesService
import io.ktor.server.routing.*
import io.ktor.server.application.*
import io.ktor.server.response.*
import io.ktor.http.*
import kotlinx.serialization.Serializable

@Serializable
data class NbStatusResponse(
    val status: String,
    val samplePrediction: Double
)

fun Route.nbRoutes(nbService: NaiveBayesService) {
    route("/nb") {

        // POST /nb/train
        // Trigger auto-training of the Naive Bayes model from existing recipes
        post("/train") {
            try {
                nbService.autoTrain()
                call.respond(HttpStatusCode.OK, "Naive Bayes model trained successfully")
            } catch (e: Exception) {
                e.printStackTrace()
                call.respond(
                    HttpStatusCode.InternalServerError,
                    "Training failed: ${e.message}"
                )
            }
        }

        // GET /nb/status
        // Check if the model has been trained
        get("/status") {
            try {
                val prior = nbService.predict(
                    com.example.dto.RcpResponse(
                        rcpID = "test",
                        accID = "test",
                        name = "test",
                        ingredients = listOf("test"),
                        steps = listOf("test"),
                        img = "",
                        genre = "test",
                        description = "test",
                        amount = listOf("1")
                    ),
                    0.5
                )
                call.respond(
                    NbStatusResponse(
                        status = "Model loaded",
                        samplePrediction = prior
                    )
                )
            } catch (e: Exception) {
                e.printStackTrace()
                call.respond(
                    HttpStatusCode.InternalServerError,
                    "Model prediction check failed: ${e.message}"
                )
            }
        }
    }
}
