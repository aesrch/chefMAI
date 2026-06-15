package com.example.dto
import kotlinx.serialization.Serializable

@Serializable
data class DeleteRcpRequest(
	val rcpID: String,
)