const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
  phone: String,
  address: String,
  cuisine: String,
  description: String,
  image: String,
  rating: {
    type: Number,
    default: 0,
  },
  deliveryTime: String,
  deliveryFee: {
    type: Number,
    default: 199,
  },
  minOrder: {
    type: Number,
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Restaurant', restaurantSchema);