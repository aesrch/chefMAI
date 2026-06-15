package com.example.session

import kotlinx.serialization.Serializable

@Serializable
data class UserSession(
    val accID: String,
    val username: String
)
