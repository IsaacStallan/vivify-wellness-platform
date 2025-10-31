// In-memory database for development (no MongoDB required)
const users = new Map();

class InMemoryDB {
    constructor() {
        // Create default test user
        this.createDefaultUser();
    }

    createDefaultUser() {
        const testUser = {
            _id: 'test-user-123',
            username: 'testuser',
            email: 'test@vivify.com',
            mountainGameData: {
                oxygen: 100,
                currentMountain: 'training',
                altitude: 0,
                totalElevation: 0,
                summitsBadges: [],
                customHabits: [],
                trainingComplete: false,
                consecutiveDaysAbove70: 0
            },
            save: async function() {
                users.set(this._id, this);
                return this;
            }
        };
        users.set('test-user-123', testUser);
        console.log('✅ In-memory DB initialized with test user');
    }

    async findUserById(id) {
        const user = users.get(id);
        if (user) {
            user.save = async function() {
                users.set(this._id, this);
                return this;
            };
        }
        return user || null;
    }

    async findUserByUsername(username) {
        for (const user of users.values()) {
            if (user.username === username) {
                user.save = async function() {
                    users.set(this._id, this);
                    return this;
                };
                return user;
            }
        }
        return null;
    }

    async findOne(query) {
        if (query.username) {
            return this.findUserByUsername(query.username);
        }
        return null;
    }

    async create(userData) {
        const id = 'user-' + Date.now();
        const user = {
            _id: id,
            ...userData,
            save: async function() {
                users.set(this._id, this);
                return this;
            }
        };
        users.set(id, user);
        return user;
    }
}

const User = new InMemoryDB();
User.findById = User.findUserById.bind(User);

module.exports = User;
