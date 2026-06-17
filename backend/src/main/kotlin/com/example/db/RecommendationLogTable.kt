package com.example.db

import org.jetbrains.exposed.sql.Table

object RecommendationLogTable : Table("recommendation_logs") {
    val logId = varchar("log_id", 20)
    val accId = varchar("acc_id", 20)
    val rcpId = varchar("rcp_id", 20)
    val ingredientMatch = double("ingredient_match")
    val nbSuitability = double("nb_suitability")
    val preferenceScore = double("preference_score")
    val finalScore = double("final_score")
    val userFeedback = varchar("user_feedback", 20).default("ignored")

    override val primaryKey = PrimaryKey(logId)
}
