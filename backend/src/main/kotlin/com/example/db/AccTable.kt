package com.example.db

import org.jetbrains.exposed.sql.Table

object AccTable : Table("accTable") {
    val accID = varchar("accID", 20)
    val accName = varchar("accName", 100)
    val accUserName = varchar("accUserName", 100)
    val accPass = varchar("accPass", 100)
    val accPresentation = varchar("accPresentation", 100).nullable()
    val accLink = varchar("accLink", 100).nullable()
    val imgID = varchar("imgID", 20).nullable()

    override val primaryKey = PrimaryKey(accID)
}