import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Check, ArrowLeft, LogOut } from 'lucide-react';
import { useAuth, AVATARS } from '../context/AuthContext';
import './SettingsPage.css';

const SettingsPage = () => {
    const { user, updateUser, logout } = useAuth();
    const navigate = useNavigate();

    const [name, setName] = useState(user?.name || '');
    const [selectedAvatar, setSelectedAvatar] = useState(user?.avatar || AVATARS[0].url);
    const [isSaved, setIsSaved] = useState(false);

    const handleSave = (e) => {
        e.preventDefault();
        updateUser({ name, avatar: selectedAvatar });
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 3000);
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    if (!user) {
        navigate('/login');
        return null;
    }

    return (
        <div className="settings-page">
            <div className="settings-container">
                <header className="settings-header">
                    <button onClick={() => navigate(-1)} className="btn-back-circle">
                        <ArrowLeft size={24} />
                    </button>
                    <h1>Profile Settings</h1>
                </header>

                <form onSubmit={handleSave} className="settings-form">
                    <section className="settings-section">
                        <h3>Identity</h3>
                        <div className="input-group-vertical">
                            <label>Display Name</label>
                            <div className="input-wrapper">
                                <User size={18} />
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Enter your name"
                                />
                            </div>
                        </div>
                        <div className="input-group-vertical">
                            <label>Email Address</label>
                            <div className="input-wrapper disabled">
                                <Mail size={18} />
                                <input type="email" value={user.email} disabled />
                            </div>
                        </div>
                    </section>

                    <section className="settings-section">
                        <h3>Choose Your Avatar</h3>
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
                    </section>

                    <div className="settings-actions">
                        <button type="submit" className={`btn-save ${isSaved ? 'success' : ''}`}>
                            {isSaved ? <><Check size={20} /> Changes Saved</> : 'Save Changes'}
                        </button>
                        <button type="button" onClick={handleLogout} className="btn-logout">
                            <LogOut size={20} /> Sign Out
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SettingsPage;
