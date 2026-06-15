package com.example.client

import io.ktor.client.*
import io.ktor.client.call.*
import io.ktor.client.engine.cio.*
import io.ktor.client.plugins.contentnegotiation.*
import io.ktor.client.request.*
import io.ktor.client.request.forms.*
import io.ktor.client.statement.*
import io.ktor.http.*
import io.ktor.serialization.kotlinx.json.json
import kotlinx.serialization.json.Json
import io.github.cdimascio.dotenv.dotenv

class YoloClient {

    // Load YOLO base URL from .env, default to localhost:8000
    private val baseUrl: String = dotenv()["YOLO_BASE_URL"] ?: "http://localhost:8000"

    // Expose HttpClient for graceful shutdown
    val client = HttpClient(CIO) {
        install(ContentNegotiation) {
            json(Json {
                prettyPrint = true
                isLenient = true
                ignoreUnknownKeys = true
            })
        }
    }

    /**
     * Sends an image to the YOLO server and returns the response as a String
     */
    suspend fun detectIngredients(imageBytes: ByteArray): String {
        val response: HttpResponse = client.post("$baseUrl/detect") {
            setBody(
                MultiPartFormDataContent(
                    formData {
                        append(
                            "file",
                            imageBytes,
                            Headers.build {
                                append(HttpHeaders.ContentType, "image/jpeg")
                                append(HttpHeaders.ContentDisposition, "filename=image.jpg")
                            }
                        )
                    }
                )
            )
        }
        return response.bodyAsText()
    }

    /**
     * Gracefully close the HTTP client
     */
    fun close() {
        client.close()
    }
}
