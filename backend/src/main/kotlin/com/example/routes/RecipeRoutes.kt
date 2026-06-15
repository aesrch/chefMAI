package com.example.routes

import com.example.dto.AddRcpRequest
import com.example.repository.RcpRepository
import com.example.dto.EditRcpRequest
import com.example.dto.DeleteRcpRequest
import io.ktor.server.routing.*
import io.ktor.server.application.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.http.*
import io.ktor.server.sessions.*

fun Route.recipeRoutes() {
  val recRepository = RcpRepository()

  post("/add") {
    val req = call.receive<AddRcpRequest>()

    recRepository.addRecipe(
      req.name, 
      req.accID, 
      req.ingredients.joinToString(","), 
      req.steps.joinToString("||"), 
      req.img, 
      req.genre,
      req.description,
      req.amount.joinToString(",")
    )

    call.respond(HttpStatusCode.Created, "Recipe added successfully!")
  }

  put("/edit") {
    val req = call.receive<EditRcpRequest>()

    recRepository.editRecipe(
      req.name, 
      req.rcpID,
      req.accID, 
      req.ingredients.joinToString(","), 
      req.steps.joinToString("||"), 
      req.img, 
      req.genre,
      req.description,
      req.amount.joinToString(",")
    )

    call.respond(HttpStatusCode.Accepted, "Recipe edited successfully!")
  }

  delete("/delete/{id}") {
    val rcpID = call.parameters["id"]

    if (rcpID == null) {
      call.respond(HttpStatusCode.BadRequest, "Missing recipeID!")
        return@delete
    }
    recRepository.deleteRecipe(rcpID)
    call.respond(HttpStatusCode.Accepted, "Recipe deleted successfully!")
  }

  // url looks like  GET /recipes/{id}
  get("{id}") {
    val recipeID = call.parameters["id"]

    if (recipeID == null) {
        call.respond(HttpStatusCode.BadRequest, "Missing recipeID!")
        return@get
    }

    val recipe = recRepository.getRecipeByID(recipeID)
    if (recipe == null) {
        call.respond(HttpStatusCode.NotFound, "Recipe not found.")
    } else {
        call.respond(recipe)
    }
  }

  // url looks like  GET /recipes/ingredients=tomato,onion
  get {
    val ingrs = call.request.queryParameters["ingredients"].toString().split(",")
    if (ingrs.isEmpty()) {
      call.respond(HttpStatusCode.BadRequest, "Missing ingredients!")
      return@get
    }

    val recipes = recRepository.getRecipesByIngredients(ingrs)
    if (recipes.isEmpty()) {
      call.respond(HttpStatusCode.NotFound, "No Recipes with such ingredients!")
    } else {
      call.respond(recipes)
    }
  }
}