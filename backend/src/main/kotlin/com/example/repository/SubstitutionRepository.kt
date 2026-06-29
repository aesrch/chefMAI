package com.example.repository

import com.example.db.SubstitutionTable
import com.example.dto.substitution.SubstitutionDto
import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.transactions.transaction

class SubstitutionRepository {

    /**
     * Find all substitutions for a given ingredient name.
     * Uses case-insensitive partial matching.
     */
    fun findSubstitutions(ingredientName: String): List<SubstitutionDto> {
        val normalized = ingredientName.lowercase().trim()
        return transaction {
            SubstitutionTable
                .selectAll()
                .mapNotNull { row ->
                    val original = row[SubstitutionTable.originalName].lowercase()
                    // Match if the search term contains the original name or vice versa
                    val matches = original.contains(normalized) ||
                            normalized.contains(original) ||
                            normalized.split(" ").any { word -> original.contains(word) && word.length > 2 }

                    if (matches) {
                        SubstitutionDto(
                            subId = row[SubstitutionTable.subId],
                            originalName = row[SubstitutionTable.originalName],
                            substituteName = row[SubstitutionTable.substituteName],
                            ratio = row[SubstitutionTable.ratio],
                            notes = row[SubstitutionTable.notes],
                            category = row[SubstitutionTable.category],
                            confidence = row[SubstitutionTable.confidence]
                        )
                    } else null
                }
                .sortedByDescending { it.confidence }
        }
    }

    /**
     * Get all substitutions in the database.
     */
    fun getAll(): List<SubstitutionDto> {
        return transaction {
            SubstitutionTable
                .selectAll()
                .map { row ->
                    SubstitutionDto(
                        subId = row[SubstitutionTable.subId],
                        originalName = row[SubstitutionTable.originalName],
                        substituteName = row[SubstitutionTable.substituteName],
                        ratio = row[SubstitutionTable.ratio],
                        notes = row[SubstitutionTable.notes],
                        category = row[SubstitutionTable.category],
                        confidence = row[SubstitutionTable.confidence]
                    )
                }
                .sortedBy { it.originalName }
        }
    }

    /**
     * Find substitutions filtered by what the user actually has available.
     * Returns only substitutions whose substitute ingredients are in the user's pantry.
     */
    fun findAvailableSubstitutions(
        missingIngredient: String,
        userIngredients: List<String>
    ): List<SubstitutionDto> {
        val allSubs = findSubstitutions(missingIngredient)
        val userNormalized = userIngredients.map { it.lowercase().trim() }

        return allSubs.filter { sub ->
            // Check if user has any of the substitute ingredients
            val subParts = sub.substituteName.lowercase().split("+", ",", " and ")
                .map { it.trim() }
            subParts.any { part ->
                userNormalized.any { userIng ->
                    part.contains(userIng) || userIng.contains(part.split(" ").first())
                }
            } || sub.substituteName.lowercase().let { subName ->
                // Standalone substitutes (no combination needed)
                userNormalized.any { userIng ->
                    subName.contains(userIng) || userIng.contains(subName.split(" ").first())
                }
            }
        }
    }
}
