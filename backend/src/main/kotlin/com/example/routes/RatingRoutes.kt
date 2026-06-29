package com.example.routes

import com.example.repository.RatingRepository
import io.ktor.server.application.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import io.ktor.http.*
import io.ktor.server.sessions.*
import java.util.*
import com.example.session.UserSession
import com.example.dto.rating.RateRequestDto
import com.example.dto.rating.RateResponseDto
import com.example.dto.rating.AverageRatingDto



import com.example.service.BayesianPreferenceService
import com.example.repository.RcpRepository

fun Route.ratingRoutes(prefService: BayesianPreferenceService, rcpRepo: RcpRepository) {

    val ratingRepo = RatingRepository()


    post("/rate/{rcpID}") {
        try {
            val session = call.sessions.get<UserSession>()
                ?: return@post call.respond(HttpStatusCode.Unauthorized, "Login required")

            val rcpID = call.parameters["rcpID"]
                ?: return@post call.respond(HttpStatusCode.BadRequest, "Missing recipe ID")

            val dto = call.receive<RateRequestDto>()

            ratingRepo.createRating(
                rcpID = rcpID,
                accID = session.accID,  
                rateStar = dto.rateStar,
                rateText = dto.rateText
            )

            // Track interaction for preference scoring
            val recipe = rcpRepo.getRecipeByID(rcpID)
            if (recipe != null) {
                prefService.trackInteraction(
                    accId = session.accID,
                    rcpId = rcpID,
                    genre = recipe.genre,
                    interaction = "rate",
                    ratingValue = dto.rateStar
                )
            }

            call.respond(HttpStatusCode.Created, "Rating created")
        } catch (e: Exception) {
            e.printStackTrace()
            call.respond(HttpStatusCode.InternalServerError, "Something went wrong: ${e.message}")
        }
    }


    get("/get-rating/{rcpID}") {

        val rcpID = call.parameters["rcpID"]
            ?: return@get call.respond(HttpStatusCode.BadRequest)

        val (avg, count) = ratingRepo.getAverageRating(rcpID)

        call.respond(
            AverageRatingDto(
                rcpID = rcpID,
                averageStar = avg,
                totalRatings = count
            )
        )
    }


    get("/get-all/{rcpID}") {

        val rcpID = call.parameters["rcpID"]
            ?: return@get call.respond(HttpStatusCode.BadRequest)

        val ratings = ratingRepo.getRatingsByRecipe(rcpID)

        call.respond(ratings)
    }
}
