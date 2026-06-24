package com.example.routes

import com.example.dto.SubstitutionRequest
import com.example.service.SubstitutionService
import io.ktor.server.application.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*

fun Route.substitutionRoutes(substitutionService: SubstitutionService) {
    
    route("/api/substitute") {
        post {
            // 1. Grab the JSON request sent by the frontend
            val request = call.receive<SubstitutionRequest>()
            
            // 2. Pass it to your service to calculate the substitute
            val response = substitutionService.findSubstitute(request)
            
            // 3. Send the JSON answer back to the frontend
            call.respond(response)
        }
    }
}