const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.join(__dirname, 'crowdfunding.db');
const db = new sqlite3.Database(dbPath);

// Helper function to run SQL queries
function runQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
}

// Helper function to get data
function getQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

// Helper function to get all data
function allQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

// Sample campaign data with diverse and innovative ideas
const sampleCampaigns = [
  // Active campaigns (15)
  {
    title: "Nebula: Smart Home Planetarium Projector",
    description: "Transform any room into a breathtaking night sky with our AI-powered home planetarium. Projects 10,000+ stars, constellations, and deep-space objects with stunning accuracy. Features voice control, educational content, and soothing space sounds for relaxation.",
    goal_amount: 85000,
    current_funds: 42500,
    deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] + ' 23:59:59',
    status: 'active',
    image_url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
    video_url: 'https://www.youtube.com/watch?v=6R8X5D2Plm8',
    related_videos: JSON.stringify([
      'https://www.youtube.com/watch?v=OasbYWF4_S8',
      'https://www.youtube.com/watch?v=1X6M8sU7qeI'
    ])
  },
  {
    title: "AquaGrow: Self-Sustaining Smart Garden",
    description: "Grow fresh herbs and vegetables year-round with our hydroponic smart garden. Uses 90% less water than traditional gardening, with automated LED lighting and nutrient delivery. Perfect for urban dwellers and cooking enthusiasts.",
    goal_amount: 65000,
    current_funds: 52000,
    deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] + ' 23:59:59',
    status: 'active',
    image_url: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
    video_url: 'https://www.youtube.com/watch?v=8aGjD8hR9Q4',
    related_videos: JSON.stringify([
      'https://www.youtube.com/watch?v=W9Xp4O5J2B4',
      'https://www.youtube.com/watch?v=KJ4Ggs4FmvU'
    ])
  },
  {
    title: "Echo: AI Language Learning Earbuds",
    description: "Real-time translation and language learning earbuds with 40+ language support. Features include pronunciation correction, cultural context tips, and offline mode. Perfect for travelers and language enthusiasts.",
    goal_amount: 150000,
    current_funds: 112500,
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] + ' 23:59:59',
    status: 'active',
    image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
    video_url: 'https://www.youtube.com/watch?v=7X8o6q3bP8s',
    related_videos: JSON.stringify([
      'https://www.youtube.com/watch?v=3I24bSteJpw',
      'https://www.youtube.com/watch?v=G1qF9yT3N9Q'
    ])
  },
  {
    title: "TerraThread: Biodegradable Phone Cases",
    description: "Eco-friendly phone cases made from mushroom mycelium and plant-based materials. Fully compostable, durable, and stylish. For every case sold, we plant 5 trees in deforested areas.",
    goal_amount: 35000,
    current_funds: 28000,
    deadline: new Date(Date.now() + 75 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] + ' 23:59:59',
    status: 'active',
    image_url: 'https://images.unsplash.com/photo-1601784551446-9d2c1575b5ce?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
    video_url: 'https://www.youtube.com/watch?v=1X6M8sU7qeI',
    related_videos: JSON.stringify([
      'https://www.youtube.com/watch?v=OasbYWF4_S8',
      'https://www.youtube.com/watch?v=6R8X5D2Plm8'
    ])
  },
  {
    title: "Luna: Smart Sleep Mask with Biofeedback",
    description: "Advanced sleep mask that tracks sleep cycles, provides gentle wake-up lighting, and plays personalized soundscapes. Uses biometric feedback to optimize your sleep environment throughout the night.",
    goal_amount: 95000,
    current_funds: 76000,
    deadline: new Date(Date.now() + 50 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] + ' 23:59:59',
    status: 'active',
    image_url: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
    video_url: 'https://www.youtube.com/watch?v=3I24bSteJpw',
    related_videos: JSON.stringify([
      'https://www.youtube.com/watch?v=7X8o6q3bP8s',
      'https://www.youtube.com/watch?v=G1qF9yT3N9Q'
    ])
  },
  
  // Successful campaigns (15)
  {
    title: "Solaris: Portable Solar Charger",
    description: "Ultra-lightweight solar charger with 24W output, perfect for outdoor adventures. Charges phones, tablets, and even laptops. Waterproof and dustproof design for all-weather use.",
    goal_amount: 50000,
    current_funds: 125000,
    deadline: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] + ' 23:59:59',
    status: 'successful',
    image_url: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
    video_url: 'https://www.youtube.com/watch?v=W9Xp4O5J2B4',
    related_videos: JSON.stringify([
      'https://www.youtube.com/watch?v=8aGjD8hR9Q4',
      'https://www.youtube.com/watch?v=KJ4Ggs4FmvU'
    ])
  },
  {
    title: "Airy: Smart Air Purifier",
    description: "HEPA 13 air purifier with real-time air quality monitoring. Removes 99.97% of airborne particles, VOCs, and odors. Smartphone app integration and voice control compatible.",
    goal_amount: 75000,
    current_funds: 187500,
    deadline: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] + ' 23:59:59',
    status: 'successful',
    image_url: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
    video_url: 'https://www.youtube.com/watch?v=KJ4Ggs4FmvU',
    related_videos: JSON.stringify([
      'https://www.youtube.com/watch?v=8aGjD8hR9Q4',
      'https://www.youtube.com/watch?v=W9Xp4O5J2B4'
    ])
  },
  {
    title: "AquaPulse: Smart Water Bottle",
    description: "Smart water bottle with hydration tracking, temperature control, and UV-C sterilization. Syncs with your fitness apps and reminds you to stay hydrated throughout the day.",
    goal_amount: 40000,
    image_url: 'https://images.unsplash.com/photo-1602143407151-a01e50ae3a9c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
    video_url: 'https://www.youtube.com/watch?v=OasbYWF4_S8',
    related_videos: JSON.stringify([
      'https://www.youtube.com/watch?v=1X6M8sU7qeI',
      'https://www.youtube.com/watch?v=6R8X5D2Plm8'
    ]),
    current_funds: 100000,
    deadline: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] + ' 23:59:59',
    status: 'successful'
  },
  {
    title: "Zen Garden: Smart Indoor Herb Garden",
    description: "Automated indoor garden with AI-powered care system. Grows fresh herbs, microgreens, and small vegetables year-round. Includes companion app with growing tips and recipes.",
    goal_amount: 60000,
    current_funds: 150000,
    deadline: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] + ' 23:59:59',
    status: 'successful',
    image_url: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'
  },
  {
    title: "Pulse: Smart Jump Rope",
    description: "Smart jump rope with built-in sensors to track your workout metrics. Counts jumps, calories burned, and syncs with fitness apps. Adjustable length and replaceable cables.",
    goal_amount: 30000,
    current_funds: 90000,
    deadline: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] + ' 23:59:59',
    status: 'successful',
    image_url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'
  },
  
  // Additional Active Campaigns (10 more)
  {
    title: "AeroVest: Smart Heated Jacket",
    description: "Ultra-thin heated jacket with app-controlled temperature zones. Waterproof, windproof, and charges via USB-C. Perfect for winter sports and outdoor activities.",
    goal_amount: 75000,
    current_funds: 60000,
    deadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] + ' 23:59:59',
    status: 'active',
    image_url: 'https://images.unsplash.com/photo-1551028719-00167d1e8b4d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'
  },
  {
    title: "MindMeld: Brainwave Headset",
    description: "Wearable EEG headset that helps improve focus, relaxation, and sleep through neurofeedback. Tracks brain activity and provides personalized recommendations.",
    goal_amount: 120000,
    current_funds: 90000,
    deadline: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] + ' 23:59:59',
    status: 'active',
    image_url: 'https://images.unsplash.com/photo-1551288049-bdda5f6a8d3b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'
  },
  {
    title: "EcoPod: Modular Tiny Home",
    description: "Sustainable, modular tiny homes made from recycled materials. Fully customizable layouts with smart home technology and off-grid capabilities.",
    goal_amount: 250000,
    current_funds: 180000,
    deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] + ' 23:59:59',
    status: 'active',
    image_url: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'
  },
  {
    title: "Glow: Smart Bike Helmet",
    description: "Award-winning smart helmet with integrated turn signals, brake lights, and collision detection. Includes built-in speakers and microphone for calls.",
    goal_amount: 80000,
    current_funds: 65000,
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] + ' 23:59:59',
    status: 'active',
    image_url: 'https://images.unsplash.com/photo-1559303643-081cf4d05f2f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'
  },
  {
    title: "AquaDrone: Underwater Explorer",
    description: "Portable underwater drone with 4K camera, live streaming, and AI-powered fish identification. Perfect for divers, snorkelers, and marine researchers.",
    goal_amount: 150000,
    current_funds: 120000,
    deadline: new Date(Date.now() + 50 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] + ' 23:59:59',
    status: 'active',
    image_url: 'https://images.unsplash.com/photo-1579829366248-2042499d5791?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'
  },
  {
    title: "NovaScent: Smart Diffuser",
    description: "App-controlled essential oil diffuser with mood tracking and personalized scent recommendations. Uses ultrasonic technology for quiet operation.",
    goal_amount: 45000,
    current_funds: 35000,
    deadline: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] + ' 23:59:59',
    status: 'active',
    image_url: 'https://images.unsplash.com/photo-1601004890672-14f1f0b84a8d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'
  },
  {
    title: "TerraTrek: Hiking Boots with GPS",
    description: "Smart hiking boots with built-in GPS navigation, pressure sensors, and emergency SOS. Waterproof, durable, and charges via solar power.",
    goal_amount: 180000,
    current_funds: 140000,
    image_url: 'https://images.unsplash.com/photo-1542272604-787f9d0b2a3d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
    deadline: new Date(Date.now() + 70 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] + ' 23:59:59',
    status: 'active'
  },
  {
    title: "Zenith: Smart Meditation Cushion",
    description: "AI-powered meditation cushion that tracks your posture, breathing, and heart rate variability to enhance your meditation practice. Includes guided sessions and progress tracking.",
    goal_amount: 45000,
    current_funds: 35000,
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] + ' 23:59:59',
    status: 'active'
  },
  {
    title: "Nova: Compact Home Espresso Machine",
    description: "Professional-grade espresso machine for home use with smart temperature control, built-in grinder, and app connectivity. Makes cafe-quality coffee with the touch of a button.",
    goal_amount: 150000,
    current_funds: 120000,
    deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] + ' 23:59:59',
    status: 'active'
  },
  {
    title: "BioGrow: Smart Plant Sensor",
    description: "Monitor your plant's health with this smart sensor that tracks soil moisture, light levels, and nutrient content. Sends alerts to your phone when your plants need attention.",
    goal_amount: 35000,
    current_funds: 28000,
    deadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] + ' 23:59:59',
    status: 'active'
  },
  {
    title: "AquaGlow: Smart Shower System",
    description: "Water-saving smart shower system with LED lighting, voice control, and water usage tracking. Customize temperature and flow for the perfect shower experience.",
    goal_amount: 90000,
    current_funds: 70000,
    deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] + ' 23:59:59',
    status: 'active'
  },
  {
    title: "SkyView: Home Telescope",
    description: "Smart telescope for amateur astronomers with automated star tracking and smartphone integration. Perfect for stargazing and astrophotography.",
    goal_amount: 120000,
    current_funds: 95000,
    deadline: new Date(Date.now() + 55 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] + ' 23:59:59',
    status: 'active'
  },
  {
    title: "EcoBike: Folding Electric Bike",
    description: "Ultra-portable folding e-bike with a 50-mile range, app connectivity, and regenerative braking. Perfect for urban commuters and city dwellers.",
    goal_amount: 200000,
    current_funds: 160000,
    deadline: new Date(Date.now() + 65 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] + ' 23:59:59',
    status: 'active'
  },
  {
    title: "SoundScape: 3D Audio Headphones",
    description: "Premium wireless headphones with 3D audio technology for an immersive listening experience. Features active noise cancellation and 40-hour battery life.",
    goal_amount: 150000,
    current_funds: 120000,
    deadline: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] + ' 23:59:59',
    status: 'active'
  },
  {
    title: "SolarSack: Portable Solar Backpack",
    description: "Backpack with built-in solar panels to charge your devices on the go. Waterproof, anti-theft design with USB charging ports and laptop compartment.",
    goal_amount: 60000,
    current_funds: 45000,
    deadline: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] + ' 23:59:59',
    status: 'active'
  },

  // Additional Successful Campaigns (10 more)
  {
    title: "AirHaven: Smart Air Purifier",
    description: "HEPA 14 air purifier with real-time air quality monitoring and smart home integration. Removes 99.99% of airborne particles and VOCs.",
    goal_amount: 100000,
    current_funds: 250000,
    deadline: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] + ' 23:59:59',
    status: 'successful'
  },
  {
    title: "HydroFlux: Smart Water Bottle",
    description: "Self-cleaning water bottle with UV-C sterilization, temperature control, and hydration tracking. Keeps drinks cold for 24 hours or hot for 12 hours.",
    goal_amount: 50000,
    current_funds: 150000,
    deadline: new Date(Date.now() - 75 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] + ' 23:59:59',
    status: 'successful'
  },
  {
    title: "ZenSpace: Meditation Pod",
    description: "Soundproof meditation pod for home or office use. Features guided meditation programs, mood lighting, and noise-canceling technology.",
    goal_amount: 200000,
    current_funds: 500000,
    deadline: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] + ' 23:59:59',
    status: 'successful'
  },
  {
    title: "PowerStep: Energy-Generating Shoes",
    description: "Shoes that convert kinetic energy into electricity to charge your devices. Features a sleek design and all-day comfort.",
    goal_amount: 150000,
    current_funds: 400000,
    image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
    deadline: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] + ' 23:59:59',
    status: 'successful'
  },
  {
    title: "AquaPod: Floating Speaker",
    description: "Waterproof floating speaker with 360-degree sound. Perfect for pool parties, beach days, and outdoor adventures.",
    goal_amount: 50000,
    current_funds: 150000,
    deadline: new Date(Date.now() - 80 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] + ' 23:59:59',
    status: 'successful'
  },
  {
    title: "Solaris: Portable Solar Panel",
    description: "Ultra-lightweight, foldable solar panel for camping and emergencies. Charges phones, tablets, and small electronics in direct sunlight.",
    goal_amount: 75000,
    current_funds: 225000,
    deadline: new Date(Date.now() - 110 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] + ' 23:59:59',
    status: 'successful'
  },
  {
    title: "ZenGarden: Smart Garden Kit",
    description: "All-in-one indoor gardening kit with automated watering, LED grow lights, and companion app. Grow fresh herbs and vegetables year-round.",
    goal_amount: 100000,
    current_funds: 300000,
    deadline: new Date(Date.now() - 95 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] + ' 23:59:59',
    status: 'successful'
  },
  {
    title: "AeroDrone: Foldable Drone",
    description: "Compact, foldable drone with 4K camera, obstacle avoidance, and 30-minute flight time. Perfect for travel and aerial photography.",
    goal_amount: 200000,
    current_funds: 600000,
    deadline: new Date(Date.now() - 130 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] + ' 23:59:59',
    status: 'successful'
  },
  {
    title: "EcoStraw: Reusable Straw Set",
    description: "Set of 5 stainless steel straws with cleaning brush and carrying case. Durable, BPA-free, and eco-friendly.",
    goal_amount: 10000,
    current_funds: 50000,
    deadline: new Date(Date.now() - 70 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] + ' 23:59:59',
    status: 'successful'
  },
  {
    title: "SmartMirror: Interactive Mirror",
    description: "Full-length smart mirror with built-in display, fitness tracking, and virtual try-on for clothes and accessories.",
    goal_amount: 150000,
    current_funds: 450000,
    deadline: new Date(Date.now() - 140 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] + ' 23:59:59',
    status: 'successful'
  }
];

async function addSampleData() {
  console.log('🚀 Starting to add sample campaign data...');

  try {
    // Enable foreign keys
    await runQuery('PRAGMA foreign_keys = ON');

    // Get all entrepreneur users
    const entrepreneurs = await allQuery("SELECT id FROM users WHERE role = 'entrepreneur'");
    if (entrepreneurs.length === 0) {
      throw new Error('No entrepreneur users found. Please create some entrepreneur accounts first.');
    }

    // Get all investor users
    const investors = await allQuery("SELECT id, wallet_balance FROM users WHERE role = 'investor'");
    if (investors.length === 0) {
      throw new Error('No investor users found. Please create some investor accounts first.');
    }

    console.log(`👥 Found ${entrepreneurs.length} entrepreneurs and ${investors.length} investors`);

    // Add campaigns
    console.log('📝 Adding sample campaigns...');
    const campaignIds = [];
    
    // First, distribute campaigns evenly among all entrepreneurs
    const campaignsPerEntrepreneur = Math.ceil(sampleCampaigns.length / entrepreneurs.length);
    
    console.log(`📊 Distributing ${sampleCampaigns.length} campaigns among ${entrepreneurs.length} entrepreneurs (~${campaignsPerEntrepreneur} each)`);
    
    for (let i = 0; i < sampleCampaigns.length; i++) {
      const campaign = sampleCampaigns[i];
      // Use integer division to distribute campaigns evenly
      const creator = entrepreneurs[Math.floor(i / campaignsPerEntrepreneur) % entrepreneurs.length];
      
      // Determine campaign status based on funding and deadline
      const deadline = new Date(campaign.deadline);
      const isExpired = deadline < new Date();
      const isFunded = campaign.current_funds >= campaign.goal_amount;
      
      // Set status based on funding and deadline
      let status = 'active';
      if (isExpired) {
        status = isFunded ? 'successful' : 'failed';
      }
      
      // Ensure campaigns with zero funding are never marked as successful
      if (campaign.current_funds <= 0) {
        status = isExpired ? 'failed' : 'active';
      }
      
      const result = await runQuery(
        `INSERT INTO campaigns 
         (title, description, goal_amount, current_funds, deadline, creator_id, status, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
        [
          campaign.title,
          campaign.description,
          campaign.goal_amount,
          campaign.current_funds,
          campaign.deadline,
          creator.id,
          status  // Use the calculated status
        ]
      );
      
      const campaignId = result.lastID;
      campaignIds.push(campaignId);
      console.log(`✅ Added campaign: ${campaign.title} (ID: ${campaignId})`);
    }

    // Add pledges
    console.log('💰 Adding sample pledges...');
    const pledgeAmounts = [500, 1000, 1500, 2000, 2500, 3000, 3500, 4000, 4500, 5000];
    
    for (const campaignId of campaignIds) {
      // Get random number of backers (1-5) per campaign
      const numBackers = Math.floor(Math.random() * 5) + 1;
      
      for (let i = 0; i < numBackers; i++) {
        const investor = investors[Math.floor(Math.random() * investors.length)];
        const amount = pledgeAmounts[Math.floor(Math.random() * pledgeAmounts.length)];
        
        // Only proceed if investor has enough balance
        if (investor.wallet_balance >= amount) {
          // Add pledge
          await runQuery(
            `INSERT INTO pledges (user_id, campaign_id, amount, status, timestamp)
             VALUES (?, ?, ?, 'committed', datetime('now'))`,
            [investor.id, campaignId, amount]
          );
          
          // Update campaign current funds
          await runQuery(
            'UPDATE campaigns SET current_funds = current_funds + ? WHERE id = ?',
            [amount, campaignId]
          );
          
          // Update user wallet balance
          const newBalance = investor.wallet_balance - amount;
          await runQuery(
            'UPDATE users SET wallet_balance = ? WHERE id = ?',
            [newBalance, investor.id]
          );
          
          // Add wallet transaction
          await runQuery(
            `INSERT INTO wallet_transactions 
             (user_id, transaction_type, amount, balance_before, balance_after, 
              reference_type, reference_id, description, timestamp)
             VALUES (?, 'debit', ?, ?, ?, 'pledge', ?, 'Pledge for campaign #' || ?, datetime('now'))`,
            [investor.id, amount, investor.wallet_balance, newBalance, campaignId, campaignId]
          );
          
          // Update investor's wallet balance for next transaction
          investor.wallet_balance = newBalance;
          
          console.log(`   💰 User ${investor.id} pledged $${amount} to campaign ${campaignId}`);
        }
      }
    }

    // Update campaign statuses based on funding
    console.log('🔄 Updating campaign statuses...');
    const campaigns = await allQuery('SELECT id, goal_amount, current_funds, deadline FROM campaigns');
    const now = new Date();
    
    for (const campaign of campaigns) {
      const deadline = new Date(campaign.deadline);
      let status = campaign.status;
      
      if (now > deadline) {
        status = campaign.current_funds >= campaign.goal_amount * 0.8 ? 'successful' : 'failed';
        await runQuery(
          'UPDATE campaigns SET status = ?, updated_at = datetime(\'now\') WHERE id = ?',
          [status, campaign.id]
        );
        console.log(`   🔄 Updated campaign ${campaign.id} status to ${status}`);
      }
    }

    console.log('🎉 Successfully added sample campaign and transaction data!');
    console.log('   You can now check the analytics dashboard to see the updated data.');

  } catch (error) {
    console.error('❌ Error adding sample data:', error);
  } finally {
    // Close the database connection
    db.close();
  }
}

// Run the script
addSampleData();
