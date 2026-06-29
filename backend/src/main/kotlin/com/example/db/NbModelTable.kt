package com.example.db

import org.jetbrains.exposed.sql.Table

object NbModelTable : Table("nb_model_params") {
    val paramId = varchar("param_id", 20)
    val featureName = varchar("feature_name", 100)
    val classLabel = varchar("class_label", 20)
    val probability = double("probability")
    val totalSamples = integer("total_samples").default(0)

    override val primaryKey = PrimaryKey(paramId)
}
