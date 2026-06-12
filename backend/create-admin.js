// backend/create-admin.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Schéma utilisateur simplifié
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

async function createAdmin() {
  try {
    console.log('🔄 Connexion à MongoDB Atlas...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connecté à MongoDB Atlas');
    
    // Vérifie si l'admin existe déjà
    const existingAdmin = await User.findOne({ email: 'admin@fastfood.com' });
    
    if (existingAdmin) {
      console.log('✅ L\'administrateur existe déjà');
      console.log('📧 Email:', existingAdmin.email);
      console.log('👤 Rôle:', existingAdmin.role);
      process.exit(0);
    }
    
    // Hash du mot de passe "admin123"
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const admin = await User.create({
      name: 'Administrateur',
      email: 'admin@fastfood.com',
      password: hashedPassword,
      phone: '+79000000000',
      address: 'Moscou, Centre',
      role: 'admin',
      isActive: true,
      totalOrders: 0,
      totalSpent: 0,
      createdAt: new Date(),
    });
    
    console.log('\n✅ Administrateur créé avec succès !');
    console.log('📧 Email: admin@fastfood.com');
    console.log('🔑 Mot de passe: admin123');
    console.log('👤 Rôle:', admin.role);
    console.log('🆔 ID:', admin._id);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    if (error.message.includes('ECONNREFUSED')) {
      console.log('💡 Vérifie que MongoDB Atlas est accessible et que ton IP est autorisée');
    }
    process.exit(1);
  }
}

createAdmin();