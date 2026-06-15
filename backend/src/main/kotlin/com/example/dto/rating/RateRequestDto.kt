package com.example.dto.rating

import kotlinx.serialization.Serializable

@Serializable
data class RateRequestDto(
    val rateStar: Int,
    val rateText: String? = null
)
