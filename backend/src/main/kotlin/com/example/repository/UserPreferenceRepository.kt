package com.example.repository

import com.example.db.UserPreferenceTable
import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.SqlExpressionBuilder.eq
import org.jetbrains.exposed.sql.transactions.transaction
import java.util.UUID

class UserPreferenceRepository {

    data class PreferenceRecord(
        val prefId: String,
        val accId: String,
        val rcpId: String?,
        val genre: String?,
        val interaction: String,
        val ratingValue: Int?
    )

    /**
     * Record a user interaction.
     */
    fun trackInteraction(
        accId: String,
        rcpId: String?,
        genre: String?,
        interaction: String,
        ratingValue: Int? = null
    ) {
        transaction {
            UserPreferenceTable.insert {
                it[prefId] = "pref-" + UUID.randomUUID().toString().take(8)
                it[UserPreferenceTable.accId] = accId
                it[UserPreferenceTable.rcpId] = rcpId
                it[UserPreferenceTable.genre] = genre
                it[UserPreferenceTable.interaction] = interaction
                it[UserPreferenceTable.ratingValue] = ratingValue
            }
        }
    }

    /**
     * Get all interactions for a user.
     */
    fun getInteractionsByUser(accId: String): List<PreferenceRecord> {
        return transaction {
            UserPreferenceTable
                .select { UserPreferenceTable.accId eq accId }
                .map { row ->
                    PreferenceRecord(
                        prefId = row[UserPreferenceTable.prefId],
                        accId = row[UserPreferenceTable.accId],
                        rcpId = row[UserPreferenceTable.rcpId],
                        genre = row[UserPreferenceTable.genre],
                        interaction = row[UserPreferenceTable.interaction],
                        ratingValue = row[UserPreferenceTable.ratingValue]
                    )
                }
        }
    }

    /**
     * Count interactions of a specific type for a user.
     */
    fun countInteractionsByType(accId: String, interaction: String): Long {
        return transaction {
            UserPreferenceTable
                .select {
                    (UserPreferenceTable.accId eq accId) and
                            (UserPreferenceTable.interaction eq interaction)
                }
                .count()
        }
    }

    /**
     * Get genre interaction counts for a user.
     * Returns a map of genre -> positive interaction count.
     */
    fun getGenreAffinities(accId: String): Map<String, Int> {
        return transaction {
            val positiveInteractions = listOf("like", "cook", "save", "rate")
            UserPreferenceTable
                .select {
                    (UserPreferenceTable.accId eq accId) and
                            (UserPreferenceTable.interaction inList positiveInteractions)
                }
                .mapNotNull { row ->
                    row[UserPreferenceTable.genre]
                }
                .groupingBy { it.lowercase() }
                .eachCount()
        }
    }

    /**
     * Get recipe interaction counts for a user.
     * Returns recipe IDs the user has positively interacted with.
     */
    fun getPositiveRecipeIds(accId: String): Set<String> {
        return transaction {
            val positiveInteractions = listOf("like", "cook", "save", "rate")
            UserPreferenceTable
                .select {
                    (UserPreferenceTable.accId eq accId) and
                            (UserPreferenceTable.interaction inList positiveInteractions)
                }
                .mapNotNull { row ->
                    row[UserPreferenceTable.rcpId]
                }
                .toSet()
        }
    }

    /**
     * Get total interaction count for a user.
     */
    fun getTotalInteractions(accId: String): Long {
        return transaction {
            UserPreferenceTable
                .select { UserPreferenceTable.accId eq accId }
                .count()
        }
    }

    fun deleteByAccId(accId: String) {
        transaction {
            UserPreferenceTable.deleteWhere { UserPreferenceTable.accId eq accId }
        }
    }
}
