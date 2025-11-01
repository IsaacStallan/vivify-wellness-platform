// In-memory database for development (no MongoDB required)
const bcrypt = require('bcryptjs');
const users = new Map();

// User class that mimics MongoDB User model
class UserDocument {
    constructor(data) {
        Object.assign(this, data);
    }

    async save() {
        users.set(this._id, this);
        return this;
    }

    async comparePassword(candidatePassword) {
        if (!this.password) return false;
        return await bcrypt.compare(candidatePassword, this.password);
    }

    async updateLoginInfo() {
        this.lastLogin = new Date();
        this.loginCount = (this.loginCount || 0) + 1;
        await this.save();
    }

    markModified(field) {
        // In MongoDB this marks a field as modified, for in-memory we don't need to do anything
        // since we're working with the object directly
    }
}

class InMemoryDB {
    constructor() {
        // Create default test user
        this.createDefaultUser();
    }

    async createDefaultUser() {
        const hashedPassword = await bcrypt.hash('testpassword', 10);
        const testUser = new UserDocument({
            _id: 'test-user-123',
            username: 'testuser',
            email: 'test@vivify.com',
            password: hashedPassword,
            school: 'Test School',
            yearLevel: 'Year 10',
            role: 'student',
            mountainGameData: {
                oxygen: 100,
                currentMountain: 'training',
                altitude: 0,
                totalElevation: 0,
                summitsBadges: [],
                customHabits: [],
                trainingComplete: false,
                consecutiveDaysAbove70: 0
            }
        });
        users.set('test-user-123', testUser);
        console.log('✅ In-memory DB initialized with test user (username: testuser, password: testpassword)');
    }

    async findUserById(id) {
        const user = users.get(id);
        return user || null;
    }

    async findUserByUsername(username) {
        for (const user of users.values()) {
            if (user.username === username) {
                return user;
            }
        }
        return null;
    }

    async findUserByEmail(email) {
        for (const user of users.values()) {
            if (user.email === email) {
                return user;
            }
        }
        return null;
    }

    async findOne(query) {
        // Handle $or queries like { $or: [{ email }, { username }] }
        if (query.$or) {
            for (const condition of query.$or) {
                if (condition.email) {
                    const user = await this.findUserByEmail(condition.email);
                    if (user) return user;
                }
                if (condition.username) {
                    const user = await this.findUserByUsername(condition.username);
                    if (user) return user;
                }
                if (condition._id) {
                    const user = await this.findUserById(condition._id);
                    if (user) return user;
                }
            }
            return null;
        }

        // Handle simple queries
        if (query.email) {
            return this.findUserByEmail(query.email);
        }
        if (query.username) {
            return this.findUserByUsername(query.username);
        }
        if (query._id) {
            return this.findUserById(query._id);
        }

        return null;
    }

    async create(userData) {
        const id = 'user-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);

        // Hash password if provided
        if (userData.password) {
            userData.password = await bcrypt.hash(userData.password, 10);
        }

        const user = new UserDocument({
            _id: id,
            ...userData,
            createdAt: new Date(),
            loginCount: 0
        });

        users.set(id, user);
        return user;
    }

    async find(query) {
        // Return array of users matching query
        const results = [];
        for (const user of users.values()) {
            // Simple query matching for common patterns
            if (query['mountainGameData.lastHabitLog'] && query['mountainGameData.lastHabitLog'].$gte) {
                if (user.mountainGameData?.lastHabitLog >= query['mountainGameData.lastHabitLog'].$gte) {
                    results.push(user);
                }
            } else if (query['mountainGameData.totalElevation'] && query['mountainGameData.totalElevation'].$gt !== undefined) {
                if ((user.mountainGameData?.totalElevation || 0) > query['mountainGameData.totalElevation'].$gt) {
                    results.push(user);
                }
            } else if (query['mountainGameData.currentMountain']) {
                if (user.mountainGameData?.currentMountain === query['mountainGameData.currentMountain']) {
                    results.push(user);
                }
            } else if (Object.keys(query).length === 0) {
                // Empty query returns all
                results.push(user);
            }
        }

        // Return array with MongoDB-like methods
        return {
            users: results,
            select: function(fields) {
                // Simple select implementation (just return this for now)
                return this;
            },
            sort: function(sortObj) {
                // Simple sort implementation
                const field = Object.keys(sortObj)[0];
                const order = sortObj[field];
                this.users.sort((a, b) => {
                    const aVal = this.getNestedValue(a, field) || 0;
                    const bVal = this.getNestedValue(b, field) || 0;
                    return order === 1 ? aVal - bVal : bVal - aVal;
                });
                return this;
            },
            limit: function(num) {
                this.users = this.users.slice(0, num);
                return this.users;
            },
            getNestedValue: function(obj, path) {
                return path.split('.').reduce((current, prop) => current?.[prop], obj);
            }
        };
    }

    // Constructor for creating new user instances (mimics mongoose model)
    constructor_fn(userData) {
        return new UserDocument(userData);
    }
}

const db = new InMemoryDB();

// Export as a function that can be called with `new User(...)` or used with static methods
function User(userData) {
    return new UserDocument(userData);
}

// Add static methods
User.findById = db.findUserById.bind(db);
User.findOne = db.findOne.bind(db);
User.find = db.find.bind(db);
User.create = db.create.bind(db);

module.exports = User;
