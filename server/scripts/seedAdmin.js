require('dotenv').config();
const mongoose = require('mongoose');
const { connectDB } = require('../config/db');
const User = require('../models/User');

const seedAdmin = async () => {
  try {
    await connectDB();

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@skillswap.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123456';
    const adminName = process.env.ADMIN_NAME || 'SkillSwap Admin';

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminEmail.toLowerCase() });

    if (existingAdmin) {
      console.log(`Admin user already exists with email: ${adminEmail}`);
      if (existingAdmin.role !== 'admin') {
        existingAdmin.role = 'admin';
        await existingAdmin.save();
        console.log(`Updated existing user role to 'admin'`);
      }
    } else {
      const admin = await User.create({
        name: adminName,
        email: adminEmail.toLowerCase(),
        password: adminPassword,
        role: 'admin',
        bio: 'SkillSwap Platform Administrator & Community Coordinator',
        location: 'Global Operations',
        interests: ['Community Management', 'Platform Moderation', 'Education Technology'],
        profilePicture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      });
      console.log(`Successfully created administrator account: ${admin.email}`);
    }

    console.log('Seed completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin account:', error.message);
    process.exit(1);
  }
};

seedAdmin();
