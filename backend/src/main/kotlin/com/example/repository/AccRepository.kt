package com.example.repository

import com.example.db.AccTable
import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.transactions.transaction
import java.util.UUID

class AccRepository {

    fun createAccount(
        accName: String,
        accUserName: String,
        hashedPass: String,
        accPresentation: String?,
        accLink: String?,
        imgID: String?
    ) {
        transaction {
            AccTable.insert {
                it[accID] = "acc-" + UUID.randomUUID().toString().take(6)
                it[AccTable.accName] = accName
                it[AccTable.accUserName] = accUserName
                it[AccTable.accPass] = hashedPass
                it[AccTable.accPresentation] = accPresentation
                it[AccTable.accLink] = accLink
                it[AccTable.imgID] = imgID
            }
        }
    }

    fun findByUsername(username: String): ResultRow? {
        return transaction {
            AccTable
                .select { AccTable.accUserName eq username }
                .singleOrNull()
        }
    }

    fun updateAccount(
        accID: String,
        imgID: String?,
        accUserName: String?,
        accPresentation: String?
    ) {
        transaction {
            AccTable.update({ AccTable.accID eq accID }) { row ->
                imgID?.let { row[AccTable.imgID] = it }
                accUserName?.let { row[AccTable.accUserName] = it }
                accPresentation?.let { row[AccTable.accPresentation] = it }
            }
        }
    }

}
