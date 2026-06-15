package com.example.db

import org.jetbrains.exposed.sql.Table

object RateTable : Table("rateTable") {
    val rateID = varchar("rateID", 20).nullable()
    val rcpID = varchar("rcpID", 20)
    val accID = varchar("accID", 20)
    val rateStar = integer("rateStar").nullable()
    val rateText = text("rateText")

    override val primaryKey = PrimaryKey(rateID)
}