package com.example
import io.ktor.server.sessions.*
import com.example.session.UserSession
import io.ktor.server.application.*


fun Application.configureSessions() {
    install(Sessions) {
        cookie<UserSession>("USER_SESSION") {
            cookie.httpOnly = true
            cookie.secure = false // true in production
        }
    }
}
