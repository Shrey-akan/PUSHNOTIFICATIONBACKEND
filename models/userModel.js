// userModel.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
    unique: true,
  },
  id: {
    type: String,
    required: false,
    unique: true,
  },
  phoneNumber: {
    type: String,
    required: false,
  },
});

const User = mongoose.model('User', userSchema);

module.exports = User;
