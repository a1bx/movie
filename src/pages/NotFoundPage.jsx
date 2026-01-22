import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      textAlign: 'center',
      backgroundColor: '#0b0b0b',
      color: '#fff',
      padding: '20px'
    }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <AlertTriangle size={80} color="#ff4c2b" style={{ marginBottom: '1.5rem' }} />
        <h1 style={{ fontSize: '6rem', fontWeight: '800', margin: '0', lineHeight: '1' }}>404</h1>
        <p style={{ fontSize: '1.5rem', color: 'rgba(255,255,255,0.6)', marginBottom: '2rem' }}>
          This cinematic journey has led to a dead end.
        </p>
        <button
          onClick={() => navigate('/')}
          style={{
            background: '#ff4c2b',
            color: 'white',
            border: 'none',
            padding: '1rem 2rem',
            borderRadius: '30px',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.8rem',
            margin: '0 auto',
            transition: 'transform 0.2s ease',
            boxShadow: '0 10px 20px rgba(255, 76, 43, 0.3)'
          }}
          onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
          onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
        >
          <Home size={20} /> Back to Arcade
        </button>
      </motion.div>
    </div>
  );
};

export default NotFoundPage;
