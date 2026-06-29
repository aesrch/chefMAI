package com.example.db

import org.jetbrains.exposed.sql.Table

object UserPreferenceTable : Table("user_preferences") {
    val prefId = varchar("pref_id", 20)
    val accId = varchar("acc_id", 20)
    val rcpId = varchar("rcp_id", 20).nullable()
    val genre = varchar("genre", 100).nullable()
    val interaction = varchar("interaction", 20)
    val ratingValue = integer("rating_value").nullable()

    override val primaryKey = PrimaryKey(prefId)
}
