// backend/update-admin-role.js
const mongoose = require('mongoose');
require('dotenv').config();

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  phone: String,
  address: String,
  role: String,
  isActive: Boolean,
  totalOrders: Number,
  totalSpent: Number,
  createdAt: Date,
});

const User = mongoose.model('User', userSchema);

async function updateAdminRole() {
  try {
    console.log('🔄 Connexion à MongoDB Atlas...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connecté à MongoDB Atlas');
    
    // Met à jour le rôle de l'admin
    const result = await User.updateOne(
      { email: 'admin@fastfood.com' },
      { $set: { role: 'admin' } }
    );
    
    if (result.modifiedCount > 0) {
      console.log('✅ Rôle de l\'administrateur mis à jour : user → admin');
    } else if (result.matchedCount > 0) {
      console.log('⚠️ L\'utilisateur existe mais le rôle est déjà admin');
    } else {
      console.log('❌ Utilisateur admin non trouvé');
    }
    
    // Vérifie la mise à jour
    const admin = await User.findOne({ email: 'admin@fastfood.com' });
    if (admin) {
      console.log('📧 Email:', admin.email);
      console.log('👤 Rôle actuel:', admin.role);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

updateAdminRole();