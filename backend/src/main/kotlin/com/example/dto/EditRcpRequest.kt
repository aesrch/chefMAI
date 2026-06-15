package com.example.dto
import kotlinx.serialization.Serializable

@Serializable
data class EditRcpRequest(
	val accID: String,
    val rcpID: String,
	val name: String,
  	val ingredients: List<String>,
	val steps: List<String>,
	val img: String,
	val genre: String,
	val description: String,
	val amount: List<String>
)