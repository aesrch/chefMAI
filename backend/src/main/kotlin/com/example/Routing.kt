package com.example

import io.ktor.serialization.kotlinx.json.*
import io.ktor.server.application.*
import io.ktor.server.plugins.contentnegotiation.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import com.example.model.HealthResponse
import com.example.routes.*
import com.example.routes.detectionRoutes
import com.example.client.YoloClient
import com.example.service.YoloService
import com.example.service.MetricsService
import com.example.repository.RcpRepository

fun Application.configureRouting() {
    val yoloClient = YoloClient() 
    val yoloService = YoloService(yoloClient)

    val rcpRepository = RcpRepository()
    val metricsService = MetricsService(rcpRepository)

    routing {
        get("/") {
            call.respondText("Hello World!")
        }

        get("/health") {
            call.respond(
                HealthResponse(
                    status = "OK",
                    service = "ktor-backend"
                )
            )
        }

        //login signup routes
        authRoutes()
        route("/users") {
            post { 
                // user registration
            }
            get("/{id}") { 
                // get user by id
            }
        }

        route("/recipes") {
            recipeRoutes()
        }

        route("/filter") {
            filterRoutes()
        }

        ratingRoutes()

        //images
        imageRoutes()


        //detection
        detectionRoutes(yoloService)

        //metrics evaluation
        metricsRoutes(metricsService)

    }
}