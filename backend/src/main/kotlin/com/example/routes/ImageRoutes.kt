package com.example.routes

import io.ktor.server.application.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import io.ktor.http.*
import io.ktor.http.content.*
import com.example.dto.ImgUpload
import com.example.dto.ImgUploadResponse
import com.example.repository.ImgRepository
import java.io.File
import io.github.cdimascio.dotenv.dotenv

fun Route.imageRoutes() {

    // Load base path from .env
    val dotenv = dotenv()
    val basePath = dotenv["IMAGE_BASE_PATH"]
        ?: throw RuntimeException("IMAGE_BASE_PATH not set in .env")

    post("/upload-image") {

        val multipart = call.receiveMultipart()

        var originalFileName: String? = null
        var fileBytes: ByteArray? = null
        var mimeType: String? = null

        multipart.forEachPart { part ->
            when (part) {
                is PartData.FileItem -> {
                    originalFileName = part.originalFileName
                    mimeType = part.contentType?.toString()
                    fileBytes = part.streamProvider().readBytes()
                }
                else -> {}
            }
            part.dispose()
        }

        //Missing file
        if (originalFileName == null || fileBytes == null || mimeType == null) {
            call.respond(HttpStatusCode.BadRequest, "No file uploaded")
            return@post
        }

        //Image Validation
        val allowedTypes = listOf("image/jpeg", "image/png", "image/webp")
        if (mimeType !in allowedTypes) {
            call.respond(HttpStatusCode.UnsupportedMediaType, "Invalid image type")
            return@post
        }

        val maxSize = 5 * 1024 * 1024
        if (fileBytes!!.size > maxSize) {
            call.respond(HttpStatusCode.PayloadTooLarge, "File too large")
            return@post
        }

        val uploadData = ImgUpload(
            originalFileName = originalFileName!!,
            fileBytes = fileBytes!!,
            mimeType = mimeType!!
        )

        val imgID = ImgRepository.saveImage(uploadData)

        call.respond(
            HttpStatusCode.Created,
            ImgUploadResponse(imgID)
        )
    }


    get("/images/{imgID}") {
        val imgID = call.parameters["imgID"]
        if (imgID.isNullOrBlank()) {
            call.respond(HttpStatusCode.BadRequest, "imgID is required")
            return@get
        }

        // Get relative path from DB
        val imgPath = ImgRepository.getImgPathById(imgID)
        if (imgPath.isNullOrBlank()) {
            call.respond(HttpStatusCode.NotFound, "Image not found in database")
            return@get
        }

        // Combine base path + DB path
        val file = File(basePath + imgPath)
        if (!file.exists()) {
            call.respond(
                HttpStatusCode.NotFound,
                "File does not exist on server. Tried: ${file.absolutePath}"
            )
            return@get
        }

        // Detect MIME type from file extension
        val contentType = when (file.extension.lowercase()) {
            "png" -> ContentType.Image.PNG
            "jpg", "jpeg" -> ContentType.Image.JPEG
            "gif" -> ContentType.Image.GIF
            else -> ContentType.Application.OctetStream
        }

        // Stream the image efficiently
        call.respondOutputStream(contentType = contentType) {
            file.inputStream().use { input ->
                input.copyTo(this)
            }
        }
    }

}