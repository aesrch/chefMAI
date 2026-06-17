package com.example.repository

import com.example.db.NbModelTable
import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.transactions.transaction
import java.util.UUID

class NbModelRepository {

    data class NbParam(
        val paramId: String,
        val featureName: String,
        val classLabel: String,
        val probability: Double,
        val totalSamples: Int
    )

    /**
     * Get all model parameters.
     */
    fun getAllParams(): List<NbParam> {
        return transaction {
            NbModelTable.selectAll().map { row ->
                NbParam(
                    paramId = row[NbModelTable.paramId],
                    featureName = row[NbModelTable.featureName],
                    classLabel = row[NbModelTable.classLabel],
                    probability = row[NbModelTable.probability],
                    totalSamples = row[NbModelTable.totalSamples]
                )
            }
        }
    }

    /**
     * Get probability for a specific feature + class combination.
     */
    fun getParam(featureName: String, classLabel: String): NbParam? {
        return transaction {
            NbModelTable
                .select {
                    (NbModelTable.featureName eq featureName) and
                            (NbModelTable.classLabel eq classLabel)
                }
                .map { row ->
                    NbParam(
                        paramId = row[NbModelTable.paramId],
                        featureName = row[NbModelTable.featureName],
                        classLabel = row[NbModelTable.classLabel],
                        probability = row[NbModelTable.probability],
                        totalSamples = row[NbModelTable.totalSamples]
                    )
                }
                .firstOrNull()
        }
    }

    /**
     * Upsert a model parameter (insert or update).
     */
    fun upsertParam(featureName: String, classLabel: String, probability: Double, totalSamples: Int) {
        transaction {
            val existing = NbModelTable
                .select {
                    (NbModelTable.featureName eq featureName) and
                            (NbModelTable.classLabel eq classLabel)
                }
                .firstOrNull()

            if (existing != null) {
                NbModelTable.update({
                    (NbModelTable.featureName eq featureName) and
                            (NbModelTable.classLabel eq classLabel)
                }) {
                    it[NbModelTable.probability] = probability
                    it[NbModelTable.totalSamples] = totalSamples
                }
            } else {
                NbModelTable.insert {
                    it[paramId] = "nb-" + UUID.randomUUID().toString().take(6)
                    it[NbModelTable.featureName] = featureName
                    it[NbModelTable.classLabel] = classLabel
                    it[NbModelTable.probability] = probability
                    it[NbModelTable.totalSamples] = totalSamples
                }
            }
        }
    }

    /**
     * Clear all model parameters (for retraining).
     */
    fun clearAll() {
        transaction {
            NbModelTable.deleteAll()
        }
    }
}
