package com.example.db

import org.jetbrains.exposed.sql.Table

object SubstitutionTable : Table("ingredient_substitutions") {
    val subId = varchar("sub_id", 20)
    val originalName = varchar("original_name", 100)
    val substituteName = varchar("substitute_name", 100)
    val ratio = varchar("ratio", 50).nullable()
    val notes = text("notes").nullable()
    val category = varchar("category", 50).nullable()
    val confidence = double("confidence").default(0.8)

    override val primaryKey = PrimaryKey(subId)
}
