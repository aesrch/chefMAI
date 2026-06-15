package com.example.routes

import com.example.service.YoloService
import com.example.client.YoloClient
import io.ktor.http.*
import io.ktor.http.content.*
import io.ktor.server.application.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import com.example.model.HealthResponse


fun Route.detectionRoutes(yoloService: YoloService) {
    route("/detection") {
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
                call.respond(
                    HttpStatusCode.BadRequest,
                    "Image file is required"
                )
                return@post
            }

            val result = yoloService.analyzeImage(imageBytes!!)
            call.respond(HttpStatusCode.OK, result)
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
