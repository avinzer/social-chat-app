const mongoose = require("mongoose")

const UserSchema = mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true,
    },
    phoneNumber: {
        type: String,
        required: true
    },
    country: {
        type: String,
        required: true
    },
    profileImage: {
        type: String, // URL/path to image
        required: false
    },
    // For authentication
    isOnline: {
        type: Boolean,
        default: false
    }
})

module.exports = mongoose.model("User", UserSchema)