package com.example.repository

import com.example.db.RcpTable
import com.example.dto.RcpResponse
import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.transactions.transaction
import java.util.UUID

class FilterRepository {

  fun getRecipesByGenre(filterName: String): List<RcpResponse> {
  if (filterName.isEmpty()) return emptyList()

  return transaction {
  RcpTable
  .selectAll()
  .mapNotNull { row ->
    val dbGenre = row[RcpTable.recipeGenre]!!
      .lowercase()
      .trim()
    val matches = filterName == dbGenre.lowercase().trim()
      if (matches) {
        RcpResponse(
            rcpID = row[RcpTable.recipeID] ?: "",
            accID = row[RcpTable.accID],
            name = row[RcpTable.recipeName],
            ingredients = row[RcpTable.recipeIngredients].split(",").map {it.trim()},
            steps = row[RcpTable.recipeSteps]
              .split("\n")
              .map {it.trim()},
            img = row[RcpTable.recipeImg] ?: "",
            genre = row[RcpTable.recipeGenre] ?: "",
            description = row[RcpTable.recipeDesc],
            amount = row[RcpTable.recipeAmount].split(",").map {it.trim()}
            )
          } else {
            null
        }
      }
    }
  }
}