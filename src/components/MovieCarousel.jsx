import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import MovieCard from './MovieCard';
import './MovieCarousel.css';

const MovieCarousel = ({ title, movies }) => {
    const carouselRef = useRef(null);

    useEffect(() => {
        const carousel = carouselRef.current;
        if (!carousel) return;

        let isDown = false;
        let startX;
        let scrollLeft;

        const handleMouseDown = (e) => {
            isDown = true;
            carousel.classList.add('active');
            startX = e.pageX - carousel.offsetLeft;
            scrollLeft = carousel.scrollLeft;
        };

        const handleMouseLeave = () => {
            isDown = false;
            carousel.classList.remove('active');
        };

        const handleMouseUp = () => {
            isDown = false;
            carousel.classList.remove('active');
        };

        const handleMouseMove = (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - carousel.offsetLeft;
            const walk = (x - startX) * 2;
            carousel.scrollLeft = scrollLeft - walk;
        };

        carousel.addEventListener('mousedown', handleMouseDown);
        carousel.addEventListener('mouseleave', handleMouseLeave);
        carousel.addEventListener('mouseup', handleMouseUp);
        carousel.addEventListener('mousemove', handleMouseMove);

        return () => {
            carousel.removeEventListener('mousedown', handleMouseDown);
            carousel.removeEventListener('mouseleave', handleMouseLeave);
            carousel.removeEventListener('mouseup', handleMouseUp);
            carousel.removeEventListener('mousemove', handleMouseMove);
        };
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="carousel-container"
        >
            <h2 className="carousel-title">{title}</h2>
            <div className="carousel-row" ref={carouselRef}>
                {movies.map((movie, index) => (
                    <motion.div
                        key={movie.id}
                        className="carousel-item"
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.05, duration: 0.4 }}
                    >
                        <MovieCard movie={movie} />
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
};

export default MovieCarousel;
