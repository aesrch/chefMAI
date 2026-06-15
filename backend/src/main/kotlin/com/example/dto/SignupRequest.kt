package com.example.dto

import kotlinx.serialization.Serializable

@Serializable
data class SignupRequest(
    val accName: String,
    val accUserName: String,
    val accPass: String,
    val accPresentation: String?,
    val accLink: String?,
    val imgID: String?
)
