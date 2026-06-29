package com.example

import com.example.client.YoloClient
import com.example.service.YoloService
import io.ktor.server.application.*
import io.ktor.server.engine.*
import io.ktor.server.netty.*
import io.ktor.server.plugins.cors.routing.CORS
import io.ktor.http.HttpHeaders
import io.ktor.http.HttpMethod

fun main(args: Array<String>) {
    EngineMain.main(args)
}

fun Application.module() {
    // Configure CORS
    install(CORS) {
        allowHost("localhost:5173", schemes = listOf("http", "https"))
        allowHost("127.0.0.1:5173", schemes = listOf("http", "https"))
        allowHeader(HttpHeaders.ContentType)
        allowHeader(HttpHeaders.Authorization)
        allowMethod(HttpMethod.Options)
        allowMethod(HttpMethod.Put)
        allowMethod(HttpMethod.Patch)
        allowMethod(HttpMethod.Delete)
        allowCredentials = true
        allowNonSimpleContentTypes = true
    }

    // Core configuration
    configureSerialization()
    configureDatabase()
    configureSessions()
    ensureUploadDir()

    // Routes
    configureRouting()
}
