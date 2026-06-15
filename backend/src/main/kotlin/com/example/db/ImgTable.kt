package com.example.db

import org.jetbrains.exposed.sql.Table
import org.jetbrains.exposed.dao.id.IntIdTable
//import org.jetbrains.exposed.sql.javatime.timestamp

object ImgTable : Table("imgtable")
 {
    val imgID = varchar("imgID", 20).uniqueIndex()
    val imgFileName = varchar("imgFileName", 255)
    val imgPath = varchar("imgPath", 500)
    val imgMimeType = varchar("imgMime_type", 100)
    val imgSize = integer("imgSize")
    //val imgUploadDate = timestamp("imgUploadDate")

}

