package com.example.db

import org.jetbrains.exposed.sql.Table

object RatingTable : Table("rateTable") {

    val rateID = varchar("rateID", 20).uniqueIndex()
    val rcpID = varchar("rcpID", 20)
    val accID = varchar("accID", 20)
    val rateStar = integer("rateStar")
    val rateText = text("rateText").nullable()
    //val rateTime = timestamp("rateTime")

    override val primaryKey = PrimaryKey(rateID)
}
