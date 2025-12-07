'use client';

import { motion } from 'framer-motion';

export const Card = ({ children, className = '', hover = true, onClick = null }) => {
    return (
        <motion.div
            whileHover={hover ? { y: -4, boxShadow: '0 10px 30px rgba(0,0,0,0.2)' } : {}}
            transition={{ duration: 0.2 }}
            onClick={onClick}
            className={`card-theme rounded-lg shadow-md overflow-hidden ${onClick ? 'cursor-pointer' : ''} ${className}`}
            style={{
                backgroundColor: 'rgb(var(--card-bg))',
                borderColor: 'rgb(var(--card-border))',
                borderWidth: '1px'
            }}
        >
            {children}
        </motion.div>
    );
};
