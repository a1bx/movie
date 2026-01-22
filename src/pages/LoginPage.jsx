import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, Check } from 'lucide-react';
import { useAuth, AVATARS } from '../context/AuthContext';
import './LoginPage.css';

const LoginPage = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [step, setStep] = useState(1); // Step 1: Info, Step 2: Avatar
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0].url);

    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const from = location.state?.from?.pathname || "/";

    const handleNextStep = (e) => {
        e.preventDefault();
        if (isLogin) {
            handleFinalSubmit();
        } else {
            setStep(2);
        }
    };

    const handleFinalSubmit = () => {
        login({
            email,
            name: name || 'Cinema Fan',
            id: Date.now(),
            avatar: selectedAvatar
        });
        navigate(from, { replace: true });
    };

    return (
        <div className="auth-page">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="auth-card"
            >
                <AnimatePresence mode="wait">
                    {step === 1 ? (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                        >
                            <div className="auth-header">
                                <div className="auth-logo">MOVIE<span>ARCADE</span></div>
                                <h2>{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
                                <p>{isLogin ? 'Sign in to access your watchlist' : 'Join our cinematic community'}</p>
                            </div>

                            <form onSubmit={handleNextStep} className="auth-form">
                                {!isLogin && (
                                    <div className="input-group">
                                        <User size={18} />
                                        <input
                                            type="text"
                                            placeholder="Full Name"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            required
                                        />
                                    </div>
                                )}
                                <div className="input-group">
                                    <Mail size={18} />
                                    <input
                                        type="email"
                                        placeholder="Email Address"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="input-group">
                                    <Lock size={18} />
                                    <input
                                        type="password"
                                        placeholder="Password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                </div>

                                <button type="submit" className="auth-submit">
                                    {isLogin ? 'Sign In' : 'Next Step'} <ArrowRight size={18} />
                                </button>
                            </form>

                            <div className="auth-footer">
                                <button onClick={() => setIsLogin(!isLogin)}>
                                    {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
                                </button>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="avatar-selection"
                        >
                            <div className="auth-header">
                                <h2>Choose Your Hero</h2>
                                <p>Select a character for your profile</p>
                            </div>

                            <div className="avatar-grid">
                                {AVATARS.map((avatar) => (
                                    <div
                                        key={avatar.id}
                                        className={`avatar-item ${selectedAvatar === avatar.url ? 'active' : ''}`}
                                        onClick={() => setSelectedAvatar(avatar.url)}
                                    >
                                        <img src={avatar.url} alt={avatar.name} />
                                        <div className="avatar-check"><Check size={12} /></div>
                                        <span>{avatar.name}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="auth-buttons">
                                <button className="btn-back" onClick={() => setStep(1)}>Back</button>
                                <button className="auth-submit" onClick={handleFinalSubmit}>
                                    Complete Signup <Check size={18} />
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            <div className="auth-background">
                <div className="bg-gradient"></div>
            </div>
        </div>
    );
};

export default LoginPage;
