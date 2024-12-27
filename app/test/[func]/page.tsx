'use client';

import { PreJoin } from '@livekit/components-react';
import React from 'react';

export default function Page({ params }: {
    params: { func: string };
}) {
    return (<div style={{ display: 'grid', placeItems: 'center', height: '100%' }}>
        <PreJoin
        />
    </div>);
}