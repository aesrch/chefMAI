package com.example

import com.example.client.YoloClient
import com.example.service.YoloService
import io.ktor.server.application.*
import io.ktor.server.engine.*
import io.ktor.server.netty.*



fun main(args: Array<String>) {
    EngineMain.main(args)
}

fun Application.module() {


    // Core configuration
    configureSerialization()
    configureDatabase()
    configureSessions()
    ensureUploadDir()


    // Routes
    configureRouting()

}
