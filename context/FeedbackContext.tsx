'use client';

import React, { createContext, ReactNode, useContext, useState } from 'react';

interface FeedbackContextType {
    showToast: (message: string, duration?: number) => void;
    showLoading: (duration?: number) => void;
    hideLoading: () => void;
    loading: boolean;
    toastMessage: string;
}

const FeedbackContext = createContext<FeedbackContextType | undefined>(
    undefined,
);

export const FeedbackProvider: React.FC<{ children: ReactNode }> = ({
                                                                        children,
                                                                    }) => {
    const [loading, setLoading] = useState(false);
    const [toastMessage, setToastMessage] = useState('');

    const showToast = (message: string, duration = 2000) => {
        setToastMessage(message);
        setTimeout(() => {
            setToastMessage('');
        }, duration);
    };

    const showLoading = (duration = 5000) => {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
        }, duration);
    };

    const hideLoading = () => {
        setLoading(false);
    };

    return (
        <FeedbackContext.Provider
            value={{ showToast, showLoading, hideLoading, loading, toastMessage }}
        >
            {children}
        </FeedbackContext.Provider>
    );
};

export const useFeedback = (): FeedbackContextType => {
    const context = useContext(FeedbackContext);
    if (!context) {
        throw new Error('useFeedback must be used within a FeedbackProvider');
    }
    return context;
};
