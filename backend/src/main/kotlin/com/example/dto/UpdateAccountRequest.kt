package com.example.dto

import kotlinx.serialization.Serializable

@Serializable
data class UpdateAccountRequest(
    val imgID: String? = null,
    val accUserName: String? = null,
    val accPresentation: String? = null
)
