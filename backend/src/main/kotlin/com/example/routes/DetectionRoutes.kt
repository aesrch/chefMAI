package com.example.routes

import com.example.service.YoloService
import com.example.service.RecommendationEngine
import io.ktor.http.*
import io.ktor.http.content.*
import io.ktor.server.application.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import io.ktor.server.sessions.*
import com.example.model.HealthResponse
import com.example.session.UserSession
import kotlinx.serialization.Serializable

@Serializable
data class DetectAndRecommendResponse(
    val detectedIngredients: List<String>,
    val recommendation: com.example.dto.recommendation.RecommendationResponse
)

fun Route.detectionRoutes(
    yoloService: YoloService,
    recommendationEngine: RecommendationEngine? = null
) {
    route("/detection") {

        // POST /detection/ingredients
        // Detect ingredients from an uploaded image via YOLO
        post("/ingredients") {
            val multipart = call.receiveMultipart()
            var imageBytes: ByteArray? = null

            multipart.forEachPart { part ->
                if (part is PartData.FileItem) {
                    imageBytes = part.streamProvider().readBytes()
                }
                part.dispose()
            }

            if (imageBytes == null) {
                call.respond(HttpStatusCode.BadRequest, "Image file is required")
                return@post
            }

            try {
                val result = yoloService.analyzeImage(imageBytes!!)
                call.respond(HttpStatusCode.OK, result)
            } catch (e: Exception) {
                e.printStackTrace()
                call.respond(
                    HttpStatusCode.ServiceUnavailable,
                    "Object detection service is currently offline. Please try again later."
                )
            }
        }

        // POST /detection/recommend
        // Priority 7: Full CV → Recommendation pipeline
        // Detects ingredients in the image, then immediately runs the recommendation engine
        post("/recommend") {
            if (recommendationEngine == null) {
                call.respond(HttpStatusCode.ServiceUnavailable, "Recommendation engine not available")
                return@post
            }

            val multipart = call.receiveMultipart()
            var imageBytes: ByteArray? = null

            multipart.forEachPart { part ->
                if (part is PartData.FileItem) {
                    imageBytes = part.streamProvider().readBytes()
                }
                part.dispose()
            }

            if (imageBytes == null) {
                call.respond(HttpStatusCode.BadRequest, "Image file is required")
                return@post
            }

            // Step 1 & 2: Detect ingredients via YOLO and extract names
            val detectedIngredients = try {
                val yoloResult = yoloService.analyzeImage(imageBytes!!)
                yoloResult.ingredients.map { it.name }
            } catch (e: Exception) {
                e.printStackTrace()
                call.respond(
                    HttpStatusCode.ServiceUnavailable,
                    "Object detection service is currently offline. Recommendations could not be loaded."
                )
                return@post
            }

            if (detectedIngredients.isEmpty()) {
                call.respond(
                    HttpStatusCode.OK,
                    DetectAndRecommendResponse(
                        detectedIngredients = emptyList(),
                        recommendation = com.example.dto.recommendation.RecommendationResponse(
                            recipes = emptyList(),
                            totalEvaluated = 0,
                            userIngredients = emptyList()
                        )
                    )
                )
                return@post
            }

            // Step 3: Get user session for personalized recommendations
            val accId = call.sessions.get<UserSession>()?.accID

            // Step 4: Run hybrid recommendation engine on detected ingredients
            val recommendations = recommendationEngine.recommend(
                userIngredients = detectedIngredients,
                accId = accId,
                topK = 10
            )

            call.respond(
                HttpStatusCode.OK,
                DetectAndRecommendResponse(
                    detectedIngredients = detectedIngredients,
                    recommendation = recommendations
                )
            )
        }

        get("/health") {
            call.respond(
                HealthResponse(
                    status = "OK",
                    service = "DETECTION-backend"
                )
            )
        }
    }
}
