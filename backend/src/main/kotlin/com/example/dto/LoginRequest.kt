package com.example.dto
import kotlinx.serialization.Serializable

@Serializable
data class LoginRequest(
    val accUserName: String,
    val accPass: String
)