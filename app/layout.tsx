import '../styles/globals.css';
import '@livekit/components-styles';
import '@livekit/components-styles/prefabs';
import type { Metadata, Viewport } from 'next';


import React from 'react';
import { FeedbackProvider } from '@/context/FeedbackContext';
import Feedback from '@/components/Feedback';


export const metadata: Metadata = {
    title: {
        default: 'move car',
        template: '%s',
    },
    description:
        'LiveKit is an open source WebRTC project that gives you everything needed to build scalable and real-time audio and/or video experiences in your applications.',
};

export const viewport: Viewport = {
    themeColor: '#ffffff',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
        <body>
        <FeedbackProvider>
            {children}
            <Feedback />
        </FeedbackProvider>
        </body>
        </html>
    );
}
