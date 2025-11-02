// Seven Summits Configuration
const MOUNTAINS = {
    training: {
        id: 'training',
        name: 'Training Grounds',
        country: 'Base',
        elevation: 100,
        duration: 0, // Unlimited until 70% oxygen for 3 days
        basecamps: 0,
        oxygenDrainRate: 0, // No drain in training
        description: 'Build your oxygen reserves to 70% for 3 consecutive days to unlock Mt. Fuji',
        unlockRequirement: null,
        rewards: {
            badge: 'training_complete',
            gear: ['basic_boots']
        }
    },
    fuji: {
        id: 'fuji',
        name: 'Mt. Fuji',
        country: 'Japan',
        elevation: 3776,
        duration: 14,
        basecamps: 1,
        oxygenDrainRate: 5,
        basecampLocations: [
            { name: 'Fujinomiya Camp', altitude: 2000, day: 7 }
        ],
        description: 'Your first summit! The sacred mountain of Japan.',
        unlockRequirement: {
            oxygenAbove70: 3,
            trainingComplete: true
        },
        rewards: {
            badge: 'fuji_summit',
            gear: ['fuji_flag', 'rising_sun_bandana']
        },
        metersPerHabit: 270 // 3776m / 14 days
    },
    kilimanjaro: {
        id: 'kilimanjaro',
        name: 'Mt. Kilimanjaro',
        country: 'Tanzania',
        elevation: 5895,
        duration: 21,
        basecamps: 2,
        oxygenDrainRate: 7,
        basecampLocations: [
            { name: 'Shira Camp', altitude: 2000, day: 7 },
            { name: 'Barranco Camp', altitude: 4000, day: 14 }
        ],
        description: 'The roof of Africa awaits your determination.',
        unlockRequirement: {
            previousSummit: 'fuji'
        },
        rewards: {
            badge: 'kilimanjaro_summit',
            gear: ['african_staff', 'savanna_hat']
        },
        metersPerHabit: 281 // 5895m / 21 days
    },
    elbrus: {
        id: 'elbrus',
        name: 'Mt. Elbrus',
        country: 'Russia',
        elevation: 5642,
        duration: 28,
        basecamps: 2,
        oxygenDrainRate: 8,
        basecampLocations: [
            { name: 'Barrel Huts', altitude: 2000, day: 10 },
            { name: 'Pastukhov Rocks', altitude: 4000, day: 20 }
        ],
        description: 'Europe\'s highest peak in the Caucasus Mountains.',
        unlockRequirement: {
            previousSummit: 'kilimanjaro'
        },
        rewards: {
            badge: 'elbrus_summit',
            gear: ['ushanka_hat', 'ice_axe']
        },
        metersPerHabit: 201 // 5642m / 28 days
    },
    denali: {
        id: 'denali',
        name: 'Denali',
        country: 'Alaska, USA',
        elevation: 6190,
        duration: 35,
        basecamps: 3,
        oxygenDrainRate: 10,
        basecampLocations: [
            { name: 'Kahiltna Base', altitude: 1500, day: 8 },
            { name: 'Camp 3', altitude: 3500, day: 18 },
            { name: 'High Camp', altitude: 5200, day: 28 }
        ],
        description: 'North America\'s tallest mountain challenges your resolve.',
        unlockRequirement: {
            previousSummit: 'elbrus'
        },
        rewards: {
            badge: 'denali_summit',
            gear: ['alaska_parka', 'crampons']
        },
        metersPerHabit: 177 // 6190m / 35 days
    },
    aconcagua: {
        id: 'aconcagua',
        name: 'Aconcagua',
        country: 'Argentina',
        elevation: 6961,
        duration: 42,
        basecamps: 3,
        oxygenDrainRate: 12,
        basecampLocations: [
            { name: 'Confluencia', altitude: 2000, day: 10 },
            { name: 'Plaza de Mulas', altitude: 4000, day: 21 },
            { name: 'Camp 2', altitude: 5500, day: 32 }
        ],
        description: 'South America\'s giant tests your endurance.',
        unlockRequirement: {
            previousSummit: 'denali'
        },
        rewards: {
            badge: 'aconcagua_summit',
            gear: ['andes_poncho', 'summit_goggles']
        },
        metersPerHabit: 166 // 6961m / 42 days
    },
    vinson: {
        id: 'vinson',
        name: 'Mt. Vinson',
        country: 'Antarctica',
        elevation: 4892,
        duration: 30,
        basecamps: 2,
        oxygenDrainRate: 15,
        basecampLocations: [
            { name: 'Low Camp', altitude: 2000, day: 10 },
            { name: 'High Camp', altitude: 3500, day: 20 }
        ],
        description: 'Antarctica\'s frozen peak demands unwavering discipline.',
        unlockRequirement: {
            previousSummit: 'aconcagua'
        },
        rewards: {
            badge: 'vinson_summit',
            gear: ['antarctica_suit', 'thermal_mask']
        },
        metersPerHabit: 163 // 4892m / 30 days
    },
    everest: {
        id: 'everest',
        name: 'Mt. Everest',
        country: 'Nepal',
        elevation: 8849,
        duration: 60,
        basecamps: 4,
        oxygenDrainRate: 20,
        basecampLocations: [
            { name: 'Base Camp', altitude: 2000, day: 12 },
            { name: 'Camp 2', altitude: 4000, day: 24 },
            { name: 'Camp 3', altitude: 6000, day: 40 },
            { name: 'South Col', altitude: 7500, day: 52 }
        ],
        description: 'The ultimate challenge. The roof of the world awaits.',
        unlockRequirement: {
            previousSummit: 'vinson',
            allSummitsBadges: ['fuji', 'kilimanjaro', 'elbrus', 'denali', 'aconcagua', 'vinson']
        },
        rewards: {
            badge: 'everest_summit',
            gear: ['prayer_flags', 'oxygen_tank', 'seven_summits_medal']
        },
        metersPerHabit: 147 // 8849m / 60 days (requires ~2-3 habits/day)
    }
};

// Helper function to get mountain by ID
function getMountain(mountainId) {
    return MOUNTAINS[mountainId] || null;
}

// Helper function to get next mountain
function getNextMountain(currentMountainId) {
    const order = ['training', 'fuji', 'kilimanjaro', 'elbrus', 'denali', 'aconcagua', 'vinson', 'everest'];
    const currentIndex = order.indexOf(currentMountainId);
    if (currentIndex >= 0 && currentIndex < order.length - 1) {
        return MOUNTAINS[order[currentIndex + 1]];
    }
    return null;
}

// Helper function to check if mountain is unlocked
function canUnlockMountain(mountainId, userMountainData) {
    const mountain = MOUNTAINS[mountainId];
    if (!mountain || !mountain.unlockRequirement) {
        return true; // No requirements means always unlocked (training)
    }

    const req = mountain.unlockRequirement;

    // Check oxygen requirement for Fuji
    if (req.oxygenAbove70 && userMountainData.consecutiveDaysAbove70 < req.oxygenAbove70) {
        return false;
    }

    // Check training complete requirement
    if (req.trainingComplete && !userMountainData.trainingComplete) {
        return false;
    }

    // Check previous summit requirement
    if (req.previousSummit && !userMountainData.summitsBadges.includes(req.previousSummit)) {
        return false;
    }

    // Check all summits requirement (for Everest)
    if (req.allSummitsBadges) {
        const hasAll = req.allSummitsBadges.every(badge =>
            userMountainData.summitsBadges.includes(badge)
        );
        if (!hasAll) {
            return false;
        }
    }

    return true;
}

// Calculate altitude gain for habit completion
function calculateAltitudeGain(mountainId, habitsCompleted) {
    const mountain = MOUNTAINS[mountainId];
    if (!mountain || mountainId === 'training') {
        return 0;
    }

    return Math.round(mountain.metersPerHabit * habitsCompleted);
}

// Calculate oxygen change based on habits
function calculateOxygenChange(habitsCompleted, mountainId) {
    const mountain = MOUNTAINS[mountainId];

    // Oxygen gained from habits
    const oxygenGained = habitsCompleted.hydration ? 15 : 0 +
                        habitsCompleted.sleep ? 20 : 0 +
                        habitsCompleted.movement ? 15 : 0 +
                        habitsCompleted.focus ? 20 : 0 +
                        (habitsCompleted.custom1 ? 10 : 0) +
                        (habitsCompleted.custom2 ? 10 : 0) +
                        (habitsCompleted.custom3 ? 10 : 0);

    return oxygenGained;
}

// Calculate daily oxygen drain
function calculateOxygenDrain(mountainId) {
    const mountain = MOUNTAINS[mountainId];
    return mountain ? mountain.oxygenDrainRate : 0;
}

module.exports = {
    MOUNTAINS,
    getMountain,
    getNextMountain,
    canUnlockMountain,
    calculateAltitudeGain,
    calculateOxygenChange,
    calculateOxygenDrain
};
