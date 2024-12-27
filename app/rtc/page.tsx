import { videoCodecs } from 'livekit-client';
import { VideoConferenceClientImpl } from './VideoConferenceClientImpl';
import { isVideoCodec } from '@/lib/types';

const servUrl = process.env.LIVEKIT_URL;

export default function CustomRoomConnection(props: {
    searchParams: {
        token?: string;
        codec?: string;
    };
}) {
    const { token, codec } = props.searchParams;
    if (typeof token !== 'string') {
        return <h2>Missing LiveKit token</h2>;
    }
    if (codec !== undefined && !isVideoCodec(codec)) {
        return <h2>Invalid codec, if defined it has to be [{videoCodecs.join(', ')}].</h2>;
    }
    if (!servUrl) {
        return <h2>Missing LiveKit URL</h2>;
    }

    return (
        <main data-lk-theme="default" style={{ height: '100%' }}>
            <VideoConferenceClientImpl liveKitUrl={servUrl} token={token} codec={codec} />
        </main>
    );
}
