'use client';

import { formatChatMessageLinks, LiveKitRoom, VideoConference } from '@livekit/components-react';
import {
    ExternalE2EEKeyProvider,
    LogLevel,
    Room,
    RoomConnectOptions,
    RoomOptions,
    type VideoCodec,
    VideoPresets,
} from 'livekit-client';
import { DebugMode } from '@/lib/Debug';
import React, { useMemo } from 'react';
import { decodePassphrase } from '@/lib/utils';
import { SettingsMenu } from '@/lib/SettingsMenu';
import { useRouter } from 'next/navigation';

export function VideoConferenceClientImpl(props: {
    liveKitUrl: string;
    token: string;
    codec: VideoCodec | undefined;
}) {
    const worker =
        typeof window !== 'undefined' &&
        new Worker(new URL('livekit-client/e2ee-worker', import.meta.url));
    const keyProvider = new ExternalE2EEKeyProvider();

    const e2eePassphrase =
        typeof window !== 'undefined' ? decodePassphrase(window.location.hash.substring(1)) : undefined;
    const e2eeEnabled = !!(e2eePassphrase && worker);
    const roomOptions = useMemo((): RoomOptions => {
        // @ts-ignore
        return {
            publishDefaults: {
                videoSimulcastLayers: [VideoPresets.h540, VideoPresets.h216],
                red: !e2eeEnabled,
                videoCodec: props.codec,
            },
            adaptiveStream: { pixelDensity: 'screen' },
            dynacast: true,
            e2ee: e2eeEnabled
                ? {
                    keyProvider,
                    worker,
                }
                : undefined,
        };
    }, []);

    const router = useRouter();
    const handleOnLeave = React.useCallback(() => {
        router.back();
    }, []);
    const handleError = React.useCallback((error: Error) => {
        alert('连接失败');
    }, []);

    const room = useMemo(() => new Room(roomOptions), []);
    if (e2eeEnabled) {
        keyProvider.setKey(e2eePassphrase);
        room.setE2EEEnabled(true);
    }
    const connectOptions = useMemo((): RoomConnectOptions => {
        return {
            autoSubscribe: true,
        };
    }, []);

    return (
        <LiveKitRoom
            room={room}
            token={props.token}
            connectOptions={connectOptions}
            serverUrl={props.liveKitUrl}
            audio={true}
            video={false}
            onDisconnected={handleOnLeave}
            onError={handleError}
        >
            <VideoConference
                chatMessageFormatter={formatChatMessageLinks}
                SettingsComponent={
                    process.env.NEXT_PUBLIC_SHOW_SETTINGS_MENU === 'true' ? SettingsMenu : undefined
                }
            />
            <DebugMode logLevel={process.env.NODE_ENV === 'production' ? LogLevel.warn : LogLevel.debug} />
        </LiveKitRoom>
    );
}
