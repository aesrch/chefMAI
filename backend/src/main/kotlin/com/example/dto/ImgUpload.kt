package com.example.dto


data class ImgUpload(
    val originalFileName: String,
    val fileBytes: ByteArray,
    val mimeType: String
)
