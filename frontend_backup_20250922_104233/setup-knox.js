// setup-knox.js - Run this once to set up Knox Grammar School
require('dotenv').config();
const mongoose = require('mongoose');
const { User, School } = require('./models/User');
const bcrypt = require('bcryptjs');

async function setupKnox() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');
        
        // Create Knox Grammar School
        const knox = new School({
            name: "Knox Grammar School",
            schoolCode: "KNOX2024", 
            address: "Wahroonga, NSW 2076",
            state: "NSW",
            subscriptionTier: "premium"
        });
        
        await knox.save();
        console.log('Knox Grammar School added successfully!');
        
        // Create an admin user for Knox
        const adminPassword = await bcrypt.hash('KnoxAdmin2024!', 10);
        const adminUser = new User({
            username: 'knoxadmin',
            email: 'admin@knox.nsw.edu.au',
            password: adminPassword,
            role: 'admin',
            schoolId: knox._id
        });
        
        await adminUser.save();
        console.log('Knox admin user created!');
        console.log('Login with:');
        console.log('Email: admin@knox.nsw.edu.au');
        console.log('Password: KnoxAdmin2024!');
        
        process.exit(0);
    } catch (error) {
        if (error.code === 11000) {
            console.log('Knox Grammar already exists in database');
        } else {
            console.error('Setup error:', error);
        }
        process.exit(1);
    }
}

setupKnox();