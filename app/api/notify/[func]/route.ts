import { NextRequest, NextResponse } from 'next/server';
import { AccessToken, VideoGrant } from 'livekit-server-sdk';
import { generateRoomId, randomString } from '@/lib/utils';
import { ApiRes } from '@/lib/ApiRes';
import { KvDB } from '@/lib/KvDB';
import { sendMsg } from '@/lib/notifyutils';


// //300秒内可发送5次通知
const rateLimitDelay = 300;
const rateLimitMaxRequests = 5;


export async function GET(request: NextRequest, { params }: { params: { func: string } }) {
    if (params.func !== 'info') {
        return NextResponse.json(ApiRes.error('unsupported operation'));
    }
    const id = request.nextUrl.searchParams.get('id');
    if (!id) {
        return NextResponse.json(ApiRes.error('require id is empty'));
    }
    const data = (({ plate, phone }) => ({ plate, phone }))(await getInfo(id));
    if (!data.plate) {
        return NextResponse.json(ApiRes.error('invalid request'));
    }
    return NextResponse.json(ApiRes.success(data));
}

export async function POST(request: NextRequest, { params }: { params: { func: string } }) {
    const reqBody: any = await request.json();
    const id = reqBody.id;
    console.log(reqBody);
    console.log(id);
    if (!id) {
        return NextResponse.json(ApiRes.error('require id is empty'));
    }

    let canSend = await rateLimit(id);
    if (!canSend) {
        return NextResponse.json(ApiRes.error('我正在赶来的路上,请稍等片刻~~~'));
    }

    const info = await getInfo(id);
    if (!info) {
        return NextResponse.json(ApiRes.error('require id is empty'));
    }

    const { notifyId, notifyToken } = info;

    let data;
    let sendContent: string = '';
    try {
        switch (params.func) {
            case 'call':
                const roomName = generateRoomId();
                const token = await createParticipantToken(randomString(6), roomName);
                data = token;
                let s = await createParticipantToken(id, roomName);
                sendContent = `${request.headers.get('origin')}/custom?token=${s}`;
                break;
            case 'send':
                sendContent = '您好，有人需要您挪车，请及时处理。';
                break;
            default:
                return NextResponse.json(ApiRes.error('invalid request'));
        }
        const result = await sendMsg(notifyId, notifyToken, sendContent);
        if (!result) {
            return NextResponse.json(ApiRes.error('通知发送失败，请通过其他方式联系'));
        }
        return NextResponse.json(ApiRes.success(data));
    } catch (e) {
        const errMsg = e instanceof Error ? e.message : 'UNKNOWN_ERROR';
        return NextResponse.json(ApiRes.error(errMsg));
    }

}

function createParticipantToken(id: string, roomName: string) {
    const at = new AccessToken(undefined, undefined, {
        ttl: '1m',
        name: randomString(6),
        identity: id,
    });
    const grant: VideoGrant = {
        room: roomName,
        roomJoin: true,
        canPublish: true,
        canPublishData: true,
        canSubscribe: true,
    };
    at.addGrant(grant);
    return at.toJwt();
}

async function rateLimit(id: string) {
    const key = `rate_limit_${id.toLowerCase()}`;
    let current = parseInt(await KvDB.get(key) || '0');
    console.log(`current: ${current}`);
    if (current >= rateLimitMaxRequests) {
        return false;
    }
    await KvDB.put(key, ++current, { expirationTtl: rateLimitDelay });
    console.log(`current++: ${current}`);
    return true;
}

//
async function getInfo(id: string) {
    const infoKey = `car_info_${id}`;
    const info = await KvDB.get(infoKey);
    if (info) {
        return JSON.parse(info);
    }
    return null;
}

//
