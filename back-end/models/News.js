const mongoose = require('mongoose');

const NewsSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  summary: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['political', 'sports', 'gaming']
  },
  source: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  image: {
    type: String
  }
}, { timestamps: true });

module.exports = mongoose.model('News', NewsSchema);
