package com.example.dto.preference

import kotlinx.serialization.Serializable

@Serializable
data class TrackInteractionRequest(
    val rcpId: String? = null,
    val genre: String? = null,
    val interaction: String,    // view, cook, like, dislike, save, rate
    val ratingValue: Int? = null
)

@Serializable
data class UserPreferenceScores(
    val accId: String,
    val genreAffinities: Map<String, Double>,
    val totalInteractions: Int,
    val topGenres: List<String>
)
