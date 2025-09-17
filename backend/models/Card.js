// models/Card.js - New model for the card battle system
const mongoose = require('mongoose');

const CardSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  // Card Identity
  name: { type: String, required: true }, // e.g., "Legendary Morning Warrior"
  baseHabit: { type: String, required: true }, // Original habit: 'fitness', 'study', 'nutrition', 'sleep'
  description: { type: String }, // Flavor text for the card
  
  // Card Stats
  type: { 
    type: String, 
    enum: ['Endurance', 'Focus', 'Calm', 'Discipline'], 
    required: true 
  },
  power: { type: Number, required: true, min: 1, max: 100 },
  cost: { type: Number, required: true, min: 1, max: 3 }, // Energy cost to play
  
  // Rarity System
  rarity: { 
    type: String, 
    enum: ['common', 'uncommon', 'rare', 'epic', 'legendary'], 
    default: 'common' 
  },
  
  // Special Effects
  effect: {
    type: { 
      type: String, 
      enum: ['none', 'freeze', 'heal', 'energy_regen', 'power_boost', 'shield'], 
      default: 'none' 
    },
    value: { type: Number, default: 0 }, // Effect strength
    description: { type: String } // Effect description for UI
  },
  
  // Generation Context
  generatedFrom: {
    activityType: String, // 'habit_completion', 'challenge_complete', 'streak_bonus'
    streakLength: { type: Number, default: 1 },
    verificationMethod: {
      type: String,
      enum: ['none', 'timer', 'photo', 'parent_check', 'accelerometer'],
      default: 'none'
    },
    verified: { type: Boolean, default: false }
  },
  
  // Card State
  isLocked: { type: Boolean, default: false },
  inActiveDeck: { type: Boolean, default: false },
  timesUsed: { type: Number, default: 0 },
  
  // Visual/UI Data
  cardArt: {
    backgroundColor: String,
    iconClass: String, // CSS class for icon
    frameColor: String // Rarity-based frame color
  },
  
  // Metadata
  createdAt: { type: Date, default: Date.now },
  lastUsed: Date,
  
  // Season/Collection Info
  season: { type: String, default: 'Season_1' },
  collectionSet: String // For future expansions
});

// Indexes for performance
CardSchema.index({ userId: 1, rarity: 1 });
CardSchema.index({ userId: 1, type: 1 });
CardSchema.index({ userId: 1, createdAt: -1 });

// Virtual for display power with effects
CardSchema.virtual('displayPower').get(function() {
  let basePower = this.power;
  
  // Add any permanent bonuses here
  if (this.effect.type === 'power_boost') {
    basePower += this.effect.value;
  }
  
  return Math.min(100, basePower);
});

// Virtual for rarity color
CardSchema.virtual('rarityColor').get(function() {
  const colors = {
    common: '#8e8e93',
    uncommon: '#34c759',
    rare: '#007aff',
    epic: '#af52de',
    legendary: '#ff9500'
  };
  return colors[this.rarity] || colors.common;
});

// Method to check if card can be played (cost vs energy)
CardSchema.methods.canPlay = function(availableEnergy) {
  return availableEnergy >= this.cost;
};

// Method to get card effectiveness against another card type
CardSchema.methods.getEffectivenessAgainst = function(opponentType) {
  const advantages = {
    'Endurance': 'Calm',
    'Calm': 'Focus',
    'Focus': 'Discipline', 
    'Discipline': 'Endurance'
  };
  
  if (advantages[this.type] === opponentType) {
    return 1.2; // 20% bonus
  }
  
  return 1.0; // No bonus
};

// Static method to generate card from habit completion
CardSchema.statics.generateFromHabit = async function(userId, habitData) {
  const {
    habitType, // 'fitness', 'study', 'nutrition', 'sleep'
    streakLength = 1,
    verified = false,
    verificationMethod = 'none'
  } = habitData;
  
  // Determine card type based on habit
  const typeMap = {
    'fitness': 'Endurance',
    'study': 'Focus', 
    'nutrition': 'Discipline',
    'sleep': 'Calm',
    'mental': 'Focus',
    'life_skills': 'Discipline'
  };
  
  const cardType = typeMap[habitType] || 'Focus';
  
  // Calculate power based on streak and verification
  let basePower = 10 + (streakLength * 2);
  if (verified) basePower *= 1.5;
  
  // Determine rarity based on streak and verification
  let rarity = 'common';
  if (verified && streakLength >= 30) rarity = 'legendary';
  else if (verified && streakLength >= 21) rarity = 'epic';
  else if (verified && streakLength >= 14) rarity = 'rare';
  else if (verified && streakLength >= 7) rarity = 'uncommon';
  else if (streakLength >= 14) rarity = 'rare';
  else if (streakLength >= 7) rarity = 'uncommon';
  
  // Apply rarity multipliers
  const rarityMultipliers = {
    common: 1.0,
    uncommon: 1.3,
    rare: 1.6, 
    epic: 2.0,
    legendary: 3.0
  };
  
  basePower *= rarityMultipliers[rarity];
  
  // Generate card name
  const cardName = this.generateCardName(habitType, rarity, verified);
  
  // Generate special effect
  const effect = this.generateCardEffect(cardType, rarity);
  
  // Calculate cost (scales with power)
  const cost = Math.min(3, Math.max(1, Math.ceil(basePower / 25)));
  
  const cardData = {
    userId,
    name: cardName,
    baseHabit: habitType,
    type: cardType,
    power: Math.min(100, Math.round(basePower)),
    cost,
    rarity,
    effect,
    generatedFrom: {
      activityType: 'habit_completion',
      streakLength,
      verificationMethod,
      verified
    },
    cardArt: {
      backgroundColor: this.getBackgroundColor(cardType),
      iconClass: this.getIconClass(habitType),
      frameColor: this.getFrameColor(rarity)
    }
  };
  
  return new this(cardData);
};

// Static helper methods
CardSchema.statics.generateCardName = function(habitType, rarity, verified) {
  const nameTemplates = {
    fitness: {
      common: ['Gym Rookie', 'Sweat Starter', 'Move Novice'],
      uncommon: ['Fitness Warrior', 'Iron Seeker', 'Power Builder'],
      rare: ['Strength Master', 'Elite Athlete', 'Iron Champion'],
      epic: ['Fitness Titan', 'Ultimate Warrior', 'Power God'],
      legendary: ['Legendary Beast', 'Apex Athlete', 'Mythic Warrior']
    },
    study: {
      common: ['Study Starter', 'Book Worm', 'Learn Rookie'],
      uncommon: ['Knowledge Seeker', 'Brain Warrior', 'Study Master'],
      rare: ['Wisdom Sage', 'Scholar King', 'Mind Master'],
      epic: ['Knowledge Titan', 'Ultimate Scholar', 'Brain God'],
      legendary: ['Legendary Genius', 'Apex Scholar', 'Mythic Mind']
    },
    nutrition: {
      common: ['Fuel Rookie', 'Nutrition Starter', 'Healthy Eater'],
      uncommon: ['Nutrition Warrior', 'Fuel Master', 'Health Guardian'],
      rare: ['Nutrition Sage', 'Fuel Champion', 'Health Master'],
      epic: ['Nutrition Titan', 'Ultimate Fueler', 'Health God'],
      legendary: ['Legendary Nourisher', 'Apex Healer', 'Mythic Fuel']
    },
    sleep: {
      common: ['Rest Rookie', 'Sleep Starter', 'Dream Cadet'],
      uncommon: ['Sleep Warrior', 'Dream Guardian', 'Rest Master'],
      rare: ['Sleep Sage', 'Dream Champion', 'Rest Lord'],
      epic: ['Sleep Titan', 'Ultimate Dreamer', 'Rest God'],
      legendary: ['Legendary Sleeper', 'Apex Dreamer', 'Mythic Rest']
    }
  };
  
  const templates = nameTemplates[habitType] || nameTemplates.study;
  const names = templates[rarity] || templates.common;
  const baseName = names[Math.floor(Math.random() * names.length)];
  
  return verified ? `Verified ${baseName}` : baseName;
};

CardSchema.statics.generateCardEffect = function(cardType, rarity) {
  if (rarity === 'common') {
    return { type: 'none', value: 0, description: 'No special effect' };
  }
  
  const effectTemplates = {
    'Endurance': [
      { type: 'power_boost', value: 5, description: 'Gain +5 power' },
      { type: 'energy_regen', value: 1, description: 'Restore 1 energy' }
    ],
    'Focus': [
      { type: 'freeze', value: 3, description: 'Reduce opponent power by 3' },
      { type: 'power_boost', value: 4, description: 'Gain +4 power' }
    ],
    'Calm': [
      { type: 'heal', value: 10, description: 'Restore 10 health' },
      { type: 'energy_regen', value: 2, description: 'Restore 2 energy' }
    ],
    'Discipline': [
      { type: 'freeze', value: 5, description: 'Reduce opponent power by 5' },
      { type: 'shield', value: 3, description: 'Reduce incoming damage by 3' }
    ]
  };
  
  const possibleEffects = effectTemplates[cardType] || effectTemplates['Focus'];
  const baseEffect = possibleEffects[Math.floor(Math.random() * possibleEffects.length)];
  
  // Scale effect by rarity
  const rarityMultipliers = {
    uncommon: 1.2,
    rare: 1.5,
    epic: 2.0,
    legendary: 3.0
  };
  
  const multiplier = rarityMultipliers[rarity] || 1.0;
  
  return {
    type: baseEffect.type,
    value: Math.round(baseEffect.value * multiplier),
    description: baseEffect.description.replace(/\d+/, Math.round(baseEffect.value * multiplier))
  };
};

CardSchema.statics.getBackgroundColor = function(cardType) {
  const colors = {
    'Endurance': '#e74c3c',
    'Focus': '#3498db', 
    'Calm': '#27ae60',
    'Discipline': '#9b59b6'
  };
  return colors[cardType] || colors['Focus'];
};

CardSchema.statics.getIconClass = function(habitType) {
  const icons = {
    'fitness': 'fas fa-dumbbell',
    'study': 'fas fa-book',
    'nutrition': 'fas fa-apple-alt',
    'sleep': 'fas fa-bed',
    'mental': 'fas fa-brain',
    'life_skills': 'fas fa-graduation-cap'
  };
  return icons[habitType] || icons['study'];
};

CardSchema.statics.getFrameColor = function(rarity) {
  const colors = {
    common: '#8e8e93',
    uncommon: '#34c759',
    rare: '#007aff',
    epic: '#af52de', 
    legendary: '#ff9500'
  };
  return colors[rarity] || colors.common;
};

module.exports = mongoose.model('Card', CardSchema);