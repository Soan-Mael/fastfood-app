// backend/src/controllers/restaurantController.js
const Restaurant = require('../models/Restaurant');

// Get all restaurants
const getAllRestaurants = async (req, res) => {
  try {
    const restaurants = await Restaurant.find({}).sort('-createdAt');
    res.json(restaurants);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get restaurant by ID
const getRestaurantById = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant non trouvé' });
    }
    res.json(restaurant);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update restaurant status
const updateRestaurantStatus = async (req, res) => {
  try {
    const { isActive } = req.body;
    const restaurant = await Restaurant.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true }
    );
    res.json(restaurant);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create restaurant
const createRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.create(req.body);
    res.status(201).json(restaurant);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete restaurant
const deleteRestaurant = async (req, res) => {
  try {
    await Restaurant.findByIdAndDelete(req.params.id);
    res.json({ message: 'Restaurant supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllRestaurants,
  getRestaurantById,
  updateRestaurantStatus,
  createRestaurant,
  deleteRestaurant,
};