// models/User.js
const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
  username: { 
    type: String, 
    required: true, 
    unique: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true 
  },
  password: { 
    type: String, 
    required: true 
  },
  profileInfo: {
    avatar: String,
    coverImage: String,
    bio: String,
    location: String,
    socialLinks: {
      facebook: String,
      twitter: String,
      instagram: String
    }
  },
  role: { 
    type: String, 
    default: 'user' 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('User', userSchema);
