package com.example.routes

import com.example.dto.SignupRequest
import com.example.dto.LoginRequest
import com.example.repository.AccRepository
import com.example.session.UserSession
import io.ktor.server.routing.*
import io.ktor.server.application.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.http.*
import io.ktor.server.sessions.*
import org.mindrot.jbcrypt.BCrypt
import com.example.dto.UpdateAccountRequest

fun Route.authRoutes() {

    val accRepository = AccRepository()

    post("/signup") {
        val req = call.receive<SignupRequest>()

        val hashedPass = BCrypt.hashpw(req.accPass, BCrypt.gensalt())

        accRepository.createAccount(
            accName = req.accName,
            accUserName = req.accUserName,
            hashedPass = hashedPass,
            accPresentation = req.accPresentation,
            accLink = req.accLink,
            imgID = req.imgID
        )

        call.respond(HttpStatusCode.Created, "Signup successful")
    }

    post("/login") {
        val req = call.receive<LoginRequest>()

        val user = accRepository.findByUsername(req.accUserName)

        if (user == null) {
            call.respond(HttpStatusCode.Unauthorized, "Invalid credentials")
            return@post
        }

        val passwordMatches = BCrypt.checkpw(
            req.accPass,
            user[com.example.db.AccTable.accPass]
        )

        if (!passwordMatches) {
            call.respond(HttpStatusCode.Unauthorized, "Invalid credentials")
            return@post
        }

        //Create session
        call.sessions.set(
            UserSession(
                accID = user[com.example.db.AccTable.accID],
                username = user[com.example.db.AccTable.accUserName]
            )
        )

        call.respond(HttpStatusCode.OK, "Login successful")
    }

    get("/me") {
        val session = call.sessions.get<UserSession>()
            ?: return@get call.respond(HttpStatusCode.Unauthorized)

        call.respond(
            mapOf(
                "accID" to session.accID,
                "username" to session.username
            )
        )
    }

    put("/account") {
    val session = call.sessions.get<UserSession>()
        ?: return@put call.respond(HttpStatusCode.Unauthorized)

    val req = try {
        call.receive<UpdateAccountRequest>()
    } catch (e: Exception) {
        e.printStackTrace()
        return@put call.respond(
            HttpStatusCode.BadRequest,
            "Invalid request body"
        )
    }

    accRepository.updateAccount(
        accID = session.accID,
        imgID = req.imgID,
        accUserName = req.accUserName,
        accPresentation = req.accPresentation
    )

    call.respond(HttpStatusCode.OK, "Account updated successfully")
}



    post("/logout") {
        call.sessions.clear<UserSession>()
        call.respond("Logged out")
    }
}
