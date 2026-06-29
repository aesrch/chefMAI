package com.example.routes

import com.example.service.SubstitutionService
import io.ktor.server.routing.*
import io.ktor.server.application.*
import io.ktor.server.response.*
import io.ktor.http.*

fun Route.substitutionRoutes(substitutionService: SubstitutionService) {
    route("/substitutions") {

        // GET /substitutions?ingredient=butter
        // Find substitutions for a specific ingredient
        get {
            val ingredient = call.request.queryParameters["ingredient"]
            if (ingredient.isNullOrBlank()) {
                call.respond(HttpStatusCode.BadRequest, "Missing 'ingredient' query parameter")
                return@get
            }

            val subs = substitutionService.findSubstitutionsFor(ingredient)
            call.respond(subs)
        }

        // GET /substitutions/all
        // Get all substitutions in the system
        get("/all") {
            val subs = substitutionService.getAllSubstitutions()
            call.respond(subs)
        }

        // GET /substitutions/available?ingredient=butter&userIngredients=milk,lemon
        // Find substitutions that can be made with user's available ingredients
        get("/available") {
            val ingredient = call.request.queryParameters["ingredient"]
            val userIngredientsParam = call.request.queryParameters["userIngredients"]

            if (ingredient.isNullOrBlank()) {
                call.respond(HttpStatusCode.BadRequest, "Missing 'ingredient' query parameter")
                return@get
            }

            val userIngredients = userIngredientsParam
                ?.split(",")
                ?.map { it.trim() }
                ?: emptyList()

            val subs = substitutionService.findAvailableSubstitutions(ingredient, userIngredients)
            call.respond(subs)
        }
    }
}
