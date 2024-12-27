'use client';
// components/Feedback.tsx
import React from 'react';
import { useFeedback } from '@/context/FeedbackContext';
import styles from '../styles/Feedback.module.css';

const Feedback: React.FC = () => {
    const { loading, toastMessage } = useFeedback();

    return (
        <>
            {loading && (
                <div className={styles.modal}>
                    <div className={styles.loading}></div>
                </div>
            )}
            {toastMessage && (
                <div className={`${styles.toast} ${styles.show}`}>{toastMessage}</div>
            )}
        </>
    );
};

export default Feedback;
