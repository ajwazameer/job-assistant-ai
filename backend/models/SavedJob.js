const mongoose = require('mongoose');

const savedJobSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  company: {
    type: String,
    default: '',
  },
  location: {
    type: String,
    default: '',
  },
  url: {
    type: String,
    required: true,
  },
  source: {
    type: String,
    required: true,
  },
  savedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('SavedJob', savedJobSchema);
