package com.example.dto
import kotlinx.serialization.Serializable

@Serializable
data class Filter(
  val genre: String
)