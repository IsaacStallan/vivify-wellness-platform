import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const GameContext = createContext();

export function useGame() {
    const context = useContext(GameContext);
    if (!context) {
        throw new Error('useGame must be used within GameProvider');
    }
    return context;
}

export function GameProvider({ children }) {
    const [user, setUser] = useState(null);
    const [mountainData, setMountainData] = useState(null);
    const [currentMountain, setCurrentMountain] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Load user data on mount
    useEffect(() => {
        loadUserData();
    }, []);

    async function loadUserData() {
        try {
            setLoading(true);
            const userId = localStorage.getItem('userId');

            if (!userId) {
                setLoading(false);
                return;
            }

            const [profileData, progressData] = await Promise.all([
                api.getUserProfile(),
                api.getMountainProgress()
            ]);

            setUser(profileData);
            setMountainData(progressData.mountainData);
            setCurrentMountain(progressData.currentMountain);
            setError(null);
        } catch (err) {
            console.error('Error loading user data:', err);

            // If user not found, clear localStorage to allow fresh login/signup
            if (err.message && err.message.includes('User not found')) {
                console.log('⚠️ User not found - clearing localStorage');
                localStorage.removeItem('userId');
                localStorage.removeItem('token');
                setUser(null);
                setMountainData(null);
                setCurrentMountain(null);
            }

            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    async function login(email, password) {
        try {
            setLoading(true);
            const data = await api.login(email, password);
            await loadUserData();
            return data;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }

    async function register(userData) {
        try {
            setLoading(true);
            const data = await api.register(userData);
            await loadUserData();
            return data;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }

    function logout() {
        api.logout();
        setUser(null);
        setMountainData(null);
        setCurrentMountain(null);
    }

    async function logHabits(habits, habitDetails) {
        try {
            const result = await api.logHabits(habits, habitDetails);
            await loadUserData(); // Refresh data
            return result;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    }

    async function startMountain(mountainId) {
        try {
            const result = await api.startMountain(mountainId);
            await loadUserData(); // Refresh data
            return result;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    }

    const value = {
        user,
        mountainData,
        currentMountain,
        loading,
        error,
        login,
        register,
        logout,
        logHabits,
        startMountain,
        refreshData: loadUserData
    };

    return (
        <GameContext.Provider value={value}>
            {children}
        </GameContext.Provider>
    );
}
