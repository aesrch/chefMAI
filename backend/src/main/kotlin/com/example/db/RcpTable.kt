package com.example.db

import org.jetbrains.exposed.sql.Table

object RcpTable : Table("rcpTable") {
    val recipeID = varchar("rcpID", 20).nullable()
    val accID = varchar("accID", 20)
    val recipeName = text("rcpDetails")
    val recipeIngredients = text("rcpIngred")
    val recipeSteps = text("rcpSteps")
    val recipeImg = varchar("imgID", 20).nullable()
    val recipeGenre = varchar("rcpGenre", 100).nullable()
    val recipeDesc = text("rcpDesc")
    val recipeAmount = text("rcpAmount")
    
    override val primaryKey = PrimaryKey(recipeID)
}