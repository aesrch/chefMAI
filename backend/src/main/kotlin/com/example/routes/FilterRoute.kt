package com.example.routes

import com.example.dto.Filter
import com.example.repository.FilterRepository
import io.ktor.server.routing.*
import io.ktor.server.application.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.http.*
import io.ktor.server.sessions.*

fun Route.filterRoutes() {
  val fltrRepository = FilterRepository()
  
  get {
    val filter = call.request.queryParameters["genre"].toString()
    if (filter.isEmpty()) {
      call.respond(HttpStatusCode.BadRequest, "Missing Genre!")
      return@get
    }

    val recipes = fltrRepository.getRecipesByGenre(filter)
    if (recipes.isEmpty()) {
      call.respond(HttpStatusCode.NotFound, "No Recipes with such genre!")
    } else {
      call.respond(recipes)
    }
  }
} 