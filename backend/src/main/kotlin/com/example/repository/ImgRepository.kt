package com.example.repository

import java.io.File
import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.transactions.transaction
import com.example.db.ImgTable
import com.example.dto.ImgUpload

object ImgRepository {

    private const val PUBLIC_IMAGE_PATH = "/uploads/images"
    private val UPLOAD_DIR = File("uploads/images").apply {
        if (!exists()) mkdirs()
    }

    fun saveImage(data: ImgUpload): String {

        return transaction {

            // 1. Get max imgID
            val maxId = ImgTable
                .slice(ImgTable.imgID)
                .selectAll()
                .orderBy(ImgTable.imgID, SortOrder.DESC)
                .limit(1)
                .map { it[ImgTable.imgID] }
                .firstOrNull()

            // 2. Generate next imgID
            val nextNumber = maxId
                ?.substringAfter("-")
                ?.toIntOrNull()
                ?.plus(1)
                ?: 1

            val imgID = "img-%03d".format(nextNumber)

            // 3. Build filenames
            val extension = File(data.originalFileName).extension
            val storedFileName = "$imgID.$extension"

            // Filesystem path (used to write file)
            val diskFile = File(UPLOAD_DIR, storedFileName)

            // Relative/public path (stored in DB)
            val dbPath = "$PUBLIC_IMAGE_PATH/$storedFileName"

            // 4. Save file to disk
            diskFile.writeBytes(data.fileBytes)

            // 5. Insert row
            ImgTable.insert {
                it[ImgTable.imgID] = imgID
                it[imgFileName] = storedFileName
                it[imgMimeType] = data.mimeType
                it[imgSize] = data.fileBytes.size
                it[imgPath] = dbPath
            }

            imgID
        }
    }

        fun getImgPathById(imgID: String): String? = transaction {
        ImgTable.select { ImgTable.imgID eq imgID }
            .map { it[ImgTable.imgPath] }
            .singleOrNull()
    }
}