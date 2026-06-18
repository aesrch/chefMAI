package com.example.repository

import com.example.db.RecommendationLogTable
import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.SqlExpressionBuilder.eq
import org.jetbrains.exposed.sql.transactions.transaction
import java.util.UUID

class RecommendationLogRepository {

    data class LogRecord(
        val logId: String,
        val accId: String,
        val rcpId: String,
        val ingredientMatch: Double,
        val nbSuitability: Double,
        val preferenceScore: Double,
        val finalScore: Double,
        val userFeedback: String
    )

    /**
     * Log a recommendation.
     */
    fun logRecommendation(
        accId: String,
        rcpId: String,
        ingredientMatch: Double,
        nbSuitability: Double,
        preferenceScore: Double,
        finalScore: Double
    ): String {
        val logId = "log-" + UUID.randomUUID().toString().take(8)
        transaction {
            RecommendationLogTable.insert {
                it[RecommendationLogTable.logId] = logId
                it[RecommendationLogTable.accId] = accId
                it[RecommendationLogTable.rcpId] = rcpId
                it[RecommendationLogTable.ingredientMatch] = ingredientMatch
                it[RecommendationLogTable.nbSuitability] = nbSuitability
                it[RecommendationLogTable.preferenceScore] = preferenceScore
                it[RecommendationLogTable.finalScore] = finalScore
            }
        }
        return logId
    }

    /**
     * Update feedback for a recommendation log.
     */
    fun updateFeedback(logId: String, feedback: String) {
        transaction {
            RecommendationLogTable.update({ RecommendationLogTable.logId eq logId }) {
                it[userFeedback] = feedback
            }
        }
    }

    /**
     * Get all logs (for metrics computation).
     */
    fun getAllLogs(): List<LogRecord> {
        return transaction {
            RecommendationLogTable.selectAll().map { row ->
                LogRecord(
                    logId = row[RecommendationLogTable.logId],
                    accId = row[RecommendationLogTable.accId],
                    rcpId = row[RecommendationLogTable.rcpId],
                    ingredientMatch = row[RecommendationLogTable.ingredientMatch],
                    nbSuitability = row[RecommendationLogTable.nbSuitability],
                    preferenceScore = row[RecommendationLogTable.preferenceScore],
                    finalScore = row[RecommendationLogTable.finalScore],
                    userFeedback = row[RecommendationLogTable.userFeedback]
                )
            }
        }
    }

    /**
     * Get logs for a specific user.
     */
    fun getLogsByUser(accId: String): List<LogRecord> {
        return transaction {
            RecommendationLogTable
                .select { RecommendationLogTable.accId eq accId }
                .map { row ->
                    LogRecord(
                        logId = row[RecommendationLogTable.logId],
                        accId = row[RecommendationLogTable.accId],
                        rcpId = row[RecommendationLogTable.rcpId],
                        ingredientMatch = row[RecommendationLogTable.ingredientMatch],
                        nbSuitability = row[RecommendationLogTable.nbSuitability],
                        preferenceScore = row[RecommendationLogTable.preferenceScore],
                        finalScore = row[RecommendationLogTable.finalScore],
                        userFeedback = row[RecommendationLogTable.userFeedback]
                    )
                }
        }
    }

    /**
     * Count logs by feedback type.
     */
    fun countByFeedback(): Map<String, Long> {
        return transaction {
            RecommendationLogTable
                .slice(RecommendationLogTable.userFeedback, RecommendationLogTable.logId.count())
                .selectAll()
                .groupBy(RecommendationLogTable.userFeedback)
                .associate { row ->
                    row[RecommendationLogTable.userFeedback] to row[RecommendationLogTable.logId.count()]
                }
        }
    }

    /**
     * Get top-K recommendations for a user, ordered by final score descending.
     */
    fun getTopKByUser(accId: String, k: Int): List<LogRecord> {
        return transaction {
            RecommendationLogTable
                .select { RecommendationLogTable.accId eq accId }
                .orderBy(RecommendationLogTable.finalScore, SortOrder.DESC)
                .limit(k)
                .map { row ->
                    LogRecord(
                        logId = row[RecommendationLogTable.logId],
                        accId = row[RecommendationLogTable.accId],
                        rcpId = row[RecommendationLogTable.rcpId],
                        ingredientMatch = row[RecommendationLogTable.ingredientMatch],
                        nbSuitability = row[RecommendationLogTable.nbSuitability],
                        preferenceScore = row[RecommendationLogTable.preferenceScore],
                        finalScore = row[RecommendationLogTable.finalScore],
                        userFeedback = row[RecommendationLogTable.userFeedback]
                    )
                }
        }
    }

    fun deleteByAccId(accId: String) {
        transaction {
            RecommendationLogTable.deleteWhere { RecommendationLogTable.accId eq accId }
        }
    }
}
