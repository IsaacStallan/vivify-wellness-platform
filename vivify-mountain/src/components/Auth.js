import React, { useState } from 'react';
import { useGame } from '../contexts/GameContext';
import './Auth.css';

function Auth() {
    const { login, register, error } = useGame();
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        username: '',
        school: '',
        yearLevel: 'Year 10',
        parentEmail: ''
    });
    const [localError, setLocalError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setLocalError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLocalError('');
        setLoading(true);

        try {
            if (isLogin) {
                await login(formData.email, formData.password);
            } else {
                // Validation for registration
                if (!formData.username || !formData.email || !formData.password || !formData.school) {
                    setLocalError('Please fill in all required fields');
                    setLoading(false);
                    return;
                }
                if (formData.password.length < 6) {
                    setLocalError('Password must be at least 6 characters');
                    setLoading(false);
                    return;
                }
                await register(formData);
            }
        } catch (err) {
            setLocalError(err.message || 'Authentication failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <h1>🏔️ Vivify</h1>
                    <p className="auth-tagline">Transform Habits into Summits</p>
                </div>

                <div className="auth-tabs">
                    <button
                        className={`auth-tab ${isLogin ? 'active' : ''}`}
                        onClick={() => setIsLogin(true)}
                    >
                        Login
                    </button>
                    <button
                        className={`auth-tab ${!isLogin ? 'active' : ''}`}
                        onClick={() => setIsLogin(false)}
                    >
                        Register
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    {!isLogin && (
                        <>
                            <div className="form-group">
                                <label>Username *</label>
                                <input
                                    type="text"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    placeholder="Choose a username"
                                    required={!isLogin}
                                />
                            </div>

                            <div className="form-group">
                                <label>School *</label>
                                <input
                                    type="text"
                                    name="school"
                                    value={formData.school}
                                    onChange={handleChange}
                                    placeholder="Your school name"
                                    required={!isLogin}
                                />
                            </div>

                            <div className="form-group">
                                <label>Year Level *</label>
                                <select
                                    name="yearLevel"
                                    value={formData.yearLevel}
                                    onChange={handleChange}
                                    required={!isLogin}
                                >
                                    <option value="Year 7">Year 7</option>
                                    <option value="Year 8">Year 8</option>
                                    <option value="Year 9">Year 9</option>
                                    <option value="Year 10">Year 10</option>
                                    <option value="Year 11">Year 11</option>
                                    <option value="Year 12">Year 12</option>
                                    <option value="Uni">University</option>
                                </select>
                            </div>
                        </>
                    )}

                    <div className="form-group">
                        <label>Email *</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="your.email@example.com"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Password *</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    {!isLogin && (
                        <div className="form-group">
                            <label>Parent Email (optional)</label>
                            <input
                                type="email"
                                name="parentEmail"
                                value={formData.parentEmail}
                                onChange={handleChange}
                                placeholder="parent@example.com"
                            />
                            <small>For students under 18, parent monitoring is available</small>
                        </div>
                    )}

                    {(localError || error) && (
                        <div className="error-message">
                            {localError || error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="btn-primary"
                        disabled={loading}
                    >
                        {loading ? 'Loading...' : (isLogin ? 'Login' : 'Register')}
                    </button>
                </form>

                <div className="auth-footer">
                    <p className="disclaimer">
                        Vivify is a performance training tool, not a mental health therapy service.
                    </p>
                    <div className="support-links">
                        <span>Need Support?</span>
                        <a href="https://www.lifeline.org.au" target="_blank" rel="noopener noreferrer">
                            Lifeline (13 11 14)
                        </a>
                        <a href="https://kidshelpline.com.au" target="_blank" rel="noopener noreferrer">
                            Kids Helpline (1800 55 1800)
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Auth;
