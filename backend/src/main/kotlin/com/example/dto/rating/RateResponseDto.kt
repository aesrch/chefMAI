package com.example.dto.rating

import kotlinx.serialization.Serializable
import java.time.Instant

@Serializable
data class RateResponseDto(
    val rateID: String,
    val accID: String,
    val rateStar: Int?,
    val rateText: String?,
)

@Serializable
data class AverageRatingDto(
    val rcpID: String,
    val averageStar: Double,
    val totalRatings: Int
)
