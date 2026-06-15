package com.example

import java.io.File

private val UPLOAD_DIR = File("uploads/images")

public fun ensureUploadDir() {
    if (!UPLOAD_DIR.exists()) {
        UPLOAD_DIR.mkdirs()
    }
}
