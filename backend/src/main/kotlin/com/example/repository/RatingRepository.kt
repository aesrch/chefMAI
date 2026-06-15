package com.example.repository

import com.example.db.RatingTable
import com.example.dto.rating.RateResponseDto
import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.transactions.transaction

class RatingRepository {

    /**
     * Creates a new rating for a recipe, generating a rat-XXX ID automatically.
     */
    fun createRating(
        rcpID: String,
        accID: String,
        rateStar: Int,
        rateText: String?
    ) {
        transaction {
            // Get max numeric part of rateID safely
            val maxIdNumber = RatingTable
                .slice(RatingTable.rateID.max())
                .selectAll()
                .mapNotNull { row ->
                    row[RatingTable.rateID.max()]?.substringAfter("rat-")?.toIntOrNull()
                }
                .maxOrNull() ?: 0

            val newRateID = "rat-" + String.format("%03d", maxIdNumber + 1)

            // Insert new rating
            RatingTable.insert {
                it[RatingTable.rateID] = newRateID
                it[RatingTable.rcpID] = rcpID
                it[RatingTable.accID] = accID
                it[RatingTable.rateStar] = rateStar
                it[RatingTable.rateText] = rateText
            }
        }
    }


    /**
     * Returns a list of ratings for a specific recipe.
     */
    fun getRatingsByRecipe(rcpID: String): List<RateResponseDto> {
        return transaction {
            RatingTable
                .select { RatingTable.rcpID eq rcpID }
                //.orderBy(RatingTable.rateTime, SortOrder.DESC)
                .map {
                    RateResponseDto(
                        rateID = it[RatingTable.rateID],
                        accID = it[RatingTable.accID],
                        rateStar = it[RatingTable.rateStar],
                        rateText = it[RatingTable.rateText],
                    )
                }
        }
    }

    /**
     * Returns the average rating and total count for a recipe.
     */
    fun getAverageRating(rcpID: String): Pair<Double, Int> {
        return transaction {
            val avgExpr = RatingTable.rateStar.avg()
            val countExpr = RatingTable.rateID.count()

            RatingTable
                .slice(avgExpr, countExpr)
                .select { RatingTable.rcpID eq rcpID }
                .firstOrNull()
                ?.let {
                    Pair(
                        it[avgExpr]?.toDouble() ?: 0.0,
                        it[countExpr].toInt()
                    )
                } ?: Pair(0.0, 0)
        }
    }
}
