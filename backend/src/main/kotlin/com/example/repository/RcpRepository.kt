package com.example.repository

import com.example.db.RcpTable
import com.example.dto.RcpResponse
import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.transactions.transaction
import java.util.UUID
import org.jetbrains.exposed.sql.SqlExpressionBuilder.eq

class RcpRepository {

  fun addRecipe(
    recipeName: String,
    accID: String,
    recipeIngredients: String,
    recipeSteps: String,
    recipeImg: String,
    recipeGenre: String,
    recipeDesc: String,
    recipeAmount: String
  ) {
    transaction {
    RcpTable.insert {
        it[RcpTable.recipeID] = "rcp-"+ UUID.randomUUID().toString().take(6)
        it[RcpTable.accID] = accID
        it[RcpTable.recipeName] = recipeName
        it[RcpTable.recipeIngredients] = recipeIngredients
        it[RcpTable.recipeSteps] = recipeSteps
        it[RcpTable.recipeImg] = recipeImg
        it[RcpTable.recipeGenre] = recipeGenre
        it[RcpTable.recipeDesc] = recipeDesc
        it[RcpTable.recipeAmount] = recipeAmount
      }
    }
  }

  fun editRecipe(
    recipeName: String,
    recipeID: String,
    accID: String,
    recipeIngredients: String,
    recipeSteps: String,
    recipeImg: String,
    recipeGenre: String,
    recipeDesc: String,
    recipeAmount: String
  ) {
    transaction {
        RcpTable.update({RcpTable.recipeID eq recipeID}) {
            it[RcpTable.accID] = accID
            it[RcpTable.recipeName] = recipeName
            it[RcpTable.recipeIngredients] = recipeIngredients
            it[RcpTable.recipeSteps] = recipeSteps
            it[RcpTable.recipeImg] = recipeImg
            it[RcpTable.recipeGenre] = recipeGenre
            it[RcpTable.recipeDesc] = recipeDesc
            it[RcpTable.recipeAmount] = recipeAmount
        }
    }
  }

    fun deleteRecipe(
    recipeID: String,
    ) {
    transaction {
        RcpTable.deleteWhere {RcpTable.recipeID eq recipeID} > 0
    }
  }

    fun getRecipesByIngredients(
      recipeIngredients: List<String>
    ): List<RcpResponse> {
    if (recipeIngredients.isEmpty()) return emptyList()

    return transaction {
        RcpTable
        .selectAll()
        .mapNotNull { row ->
            val dbIngredients = row[RcpTable.recipeIngredients]
                .lowercase()
                .split(",")
                .map { it.trim() }

                val matchesAll = recipeIngredients.all { ingredient ->
                dbIngredients.contains(ingredient.lowercase().trim())
                }

                if (matchesAll) {
                    RcpResponse(
                        rcpID = row[RcpTable.recipeID] ?: "",
                        accID = row[RcpTable.accID],
                        name = row[RcpTable.recipeName],
                        ingredients = dbIngredients,
                        steps = row[RcpTable.recipeSteps]
                            .split("||")
                            .map { it.trim() },
                        img = row[RcpTable.recipeImg] ?: "",
                        genre = row[RcpTable.recipeGenre] ?: "",
                        description = row[RcpTable.recipeDesc],
                        amount = row[RcpTable.recipeAmount]
                            .split(",")
                            .map { it.trim() }
                      )
                  } else {
                      null
                  }
              }
      }
  }

  fun getRecipeByID(
      recipeID: String,
  ): RcpResponse? {
    return transaction {
        RcpTable
            .select { 
                (RcpTable.recipeID eq recipeID) 
            }
            .mapNotNull { row ->
            RcpResponse(
                rcpID = row[RcpTable.recipeID] ?: "",
                accID = row[RcpTable.accID],
                name = row[RcpTable.recipeName],
                ingredients = row[RcpTable.recipeIngredients]
                    .split(",")
                    .map { it.trim() },
                steps = row[RcpTable.recipeSteps]
                    .split("||")
                    .map { it.trim() },
                img = row[RcpTable.recipeImg] ?: "",
                genre = row[RcpTable.recipeGenre] ?: "",
                description = row[RcpTable.recipeDesc],
                amount = row[RcpTable.recipeAmount].split(",")
                    .map { it.trim() }
                )
            }   
        .firstOrNull()
    }
  }
}