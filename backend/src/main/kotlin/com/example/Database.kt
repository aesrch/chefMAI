package com.example

import io.ktor.server.application.*
import org.jetbrains.exposed.sql.Database
import io.github.cdimascio.dotenv.dotenv

fun Application.configureDatabase() {
    // Load .env variables
    val dotenv = dotenv()
    val dbUrl = dotenv["DB_URL"]
    val dbUser = dotenv["DB_USER"]
    val dbPassword = dotenv["DB_PASSWORD"]

    Database.connect(
        url = dbUrl,
        driver = "com.mysql.cj.jdbc.Driver",
        user = dbUser,
        password = dbPassword
    )
}
