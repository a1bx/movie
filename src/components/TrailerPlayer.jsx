import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './TrailerPlayer.css';

const TrailerPlayer = ({ trailerKey, onClose, movieTitle }) => {
    const [isPlaying, setIsPlaying] = useState(true);
    const [isMuted, setIsMuted] = useState(false);
    const [volume, setVolume] = useState(100);
    const [progress, setProgress] = useState(0);
    const [currentTime, setCurrentTime] = useState('0:00');
    const [duration, setDuration] = useState('0:00');

    const playerRef = useRef(null);
    const containerRef = useRef(null);
    const progressRef = useRef(null);

    useEffect(() => {
        // Prevent scrolling when trailer is open
        document.body.style.overflow = 'hidden';

        // Load YT API if not present
        if (!window.YT) {
            const tag = document.createElement('script');
            tag.src = 'https://www.youtube.com/iframe_api';
            const firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        }

        let player;
        let interval;

        const initPlayer = () => {
            player = new window.YT.Player('yt-player-frame', {
                videoId: trailerKey,
                playerVars: {
                    autoplay: 1,
                    controls: 0,
                    modestbranding: 1,
                    rel: 0,
                    showinfo: 0,
                    iv_load_policy: 3,
                    enablejsapi: 1
                },
                events: {
                    onReady: (event) => {
                        playerRef.current = event.target;
                        setDuration(formatTime(event.target.getDuration()));
                        interval = setInterval(updateProgress, 500);
                    },
                    onStateChange: (event) => {
                        if (event.data === window.YT.PlayerState.PLAYING) setIsPlaying(true);
                        if (event.data === window.YT.PlayerState.PAUSED) setIsPlaying(false);
                        if (event.data === window.YT.PlayerState.ENDED) setIsPlaying(false);
                    }
                }
            });
        };

        if (window.YT && window.YT.Player) {
            initPlayer();
        } else {
            window.onYouTubeIframeAPIReady = initPlayer;
        }

        const updateProgress = () => {
            if (player && player.getCurrentTime) {
                const current = player.getCurrentTime();
                const total = player.getDuration();
                setProgress((current / total) * 100);
                setCurrentTime(formatTime(current));
            }
        };

        return () => {
            document.body.style.overflow = 'auto';
            if (interval) clearInterval(interval);
            if (player && player.destroy) player.destroy();
            window.onYouTubeIframeAPIReady = null;
        };
    }, [trailerKey]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const togglePlay = () => {
        if (!playerRef.current) return;
        if (isPlaying) {
            playerRef.current.pauseVideo();
        } else {
            playerRef.current.playVideo();
        }
        setIsPlaying(!isPlaying);
    };

    const toggleMute = () => {
        if (!playerRef.current) return;
        if (isMuted) {
            playerRef.current.unMute();
        } else {
            playerRef.current.mute();
        }
        setIsMuted(!isMuted);
    };

    const handleVolumeChange = (e) => {
        const val = parseInt(e.target.value);
        setVolume(val);
        if (playerRef.current) {
            playerRef.current.setVolume(val);
            if (val === 0) setIsMuted(true);
            else if (isMuted) {
                playerRef.current.unMute();
                setIsMuted(false);
            }
        }
    };

    const handleSeek = (e) => {
        if (!playerRef.current) return;
        const rect = progressRef.current.getBoundingClientRect();
        const pos = (e.clientX - rect.left) / rect.width;
        const seekTo = playerRef.current.getDuration() * pos;
        playerRef.current.seekTo(seekTo);
    };

    const toggleFullscreen = () => {
        if (containerRef.current.requestFullscreen) {
            containerRef.current.requestFullscreen();
        } else if (containerRef.current.webkitRequestFullscreen) {
            containerRef.current.webkitRequestFullscreen();
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="trailer-modal"
        >
            <motion.div
                initial={{ scale: 0.9, y: 30 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 30 }}
                className="trailer-container"
                ref={containerRef}
            >
                <div className="trailer-header">
                    <h3>{movieTitle} - Trailer</h3>
                    <button className="close-btn" onClick={onClose}><X size={24} /></button>
                </div>

                <div className="video-wrapper">
                    <div id="yt-player-frame"></div>

                    <div className="custom-controls">
                        <div className="progress-container" ref={progressRef} onClick={handleSeek}>
                            <div className="progress-bar">
                                <div className="progress-fill" style={{ width: `${progress}%` }}></div>
                            </div>
                        </div>

                        <div className="controls-bar">
                            <div className="left-controls">
                                <button onClick={togglePlay}>
                                    {isPlaying ? <Pause size={20} fill="white" /> : <Play size={20} fill="white" />}
                                </button>
                                <div className="time-display">
                                    <span>{currentTime}</span> / <span>{duration}</span>
                                </div>
                            </div>

                            <div className="right-controls">
                                <div className="volume-group">
                                    <button onClick={toggleMute}>
                                        {isMuted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
                                    </button>
                                    <input
                                        type="range"
                                        min="0"
                                        max="100"
                                        value={volume}
                                        onChange={handleVolumeChange}
                                        className="volume-slider"
                                    />
                                </div>
                                <button onClick={toggleFullscreen}><Maximize size={20} /></button>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default TrailerPlayer;
