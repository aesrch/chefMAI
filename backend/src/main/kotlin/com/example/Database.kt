package com.example

import io.ktor.server.application.*
import org.jetbrains.exposed.sql.Database
import io.github.cdimascio.dotenv.dotenv
import org.slf4j.LoggerFactory
import java.io.File
import java.sql.DriverManager

private val migrationLog = LoggerFactory.getLogger("com.example.migrations")

fun Application.configureDatabase() {
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

    runMigrations(dbUrl!!, dbUser!!, dbPassword!!)
}

private fun runMigrations(dbUrl: String, dbUser: String, dbPassword: String) {
    val migrationsDir = File("migrations")
    if (!migrationsDir.isDirectory) return

    val migrationFiles = migrationsDir.listFiles()
        ?.filter { it.name.endsWith(".sql") && it.name.startsWith("V") }
        ?.sortedBy { it.name }
        ?: return

    DriverManager.getConnection(dbUrl, dbUser, dbPassword).use { conn ->
        val stmt = conn.createStatement()

        stmt.executeUpdate("""
            CREATE TABLE IF NOT EXISTS schema_migrations (
                version VARCHAR(100) PRIMARY KEY,
                applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        val applied = mutableSetOf<String>()
        val rs = stmt.executeQuery("SELECT version FROM schema_migrations")
        while (rs.next()) applied.add(rs.getString("version"))
        rs.close()

        for (file in migrationFiles) {
            if (file.name in applied) continue
            migrationLog.info("Applying migration: ${file.name}")
            val rawSql = file.readText()
            val statements = rawSql.lines()
                .filterNot { it.trimStart().startsWith("--") || it.isBlank() }
                .joinToString(" ")
                .split(";")
                .map { it.trim() }
                .filter { it.isNotBlank() }
            for (statement in statements) {
                stmt.executeUpdate(statement)
            }
            stmt.executeUpdate("INSERT INTO schema_migrations (version) VALUES ('${file.name.replace("'", "''")}')")
            migrationLog.info("Applied migration: ${file.name}")
        }
        stmt.close()
    }
}
