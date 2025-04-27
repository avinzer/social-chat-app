const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: ['advertisement', 'quote'],
      default: 'advertisement'
    },
    title: {
      type: String,
      required: function() { return this.type === 'advertisement'; }
    },
    content: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: function() { return this.type === 'advertisement'; }
    },
    phoneNumber: {
      type: String,
      required: function() { return this.type === 'advertisement'; }
    },
    images: [{
      type: String
    }],
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Post", PostSchema);
