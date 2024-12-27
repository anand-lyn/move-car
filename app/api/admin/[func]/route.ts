import { NextRequest, NextResponse } from 'next/server';
import { notifyTypes } from '@/lib/notifyutils';
import { ApiRes } from '@/lib/ApiRes';
import { KvDB } from '@/lib/KvDB';
import crypto2, { randomUUID } from 'node:crypto';
import { cookies } from 'next/headers';

const secret = process.env.SECRET_KEY;
const pwd = process.env.CONSOLE_PASSWORD;

export async function POST(request: NextRequest, { params }: { params: { func: string } }) {
    const reqBody: any = await request.json();
    if (params.func === 'login') {
        const { username, password } = reqBody;
        if (username || password !== pwd) {
            return NextResponse.json(ApiRes.error('username or password not correct!'));
        }

        const signData = {
            password,
            timestamp: Date.now().toString(),
        };

        // @ts-ignore
        const s = hmac512(secret, JSON.stringify(signData));
        cookies().set('auth', s, {
            secure: process.env.NODE_ENV === 'production',
            httpOnly: true,
            path: '/',
            maxAge: 60 * 60 * 24,
        });
        cookies().set('timestamp', signData.timestamp.toString(), {
            secure: process.env.NODE_ENV === 'production',
            httpOnly: true,
            path: '/',
            maxAge: 60 * 60 * 24,
        });
        return NextResponse.json(ApiRes.success('success'));
    }

    let { id, plate, phone, notifyId, notifyToken } = reqBody;
    if (!plate || !notifyId || !notifyToken) {
        return NextResponse.json(ApiRes.error('invalid request'));
    }

    switch (params.func) {
        case 'addCar':
            id = randomUUID().replace(/-/g, '').toLowerCase();
            break;
        case 'updateCar':
            if (!id) {
                return NextResponse.json(ApiRes.error('invalid request'));
            }
            break;
    }
    await updateInfo(id, { id, plate, phone, notifyId, notifyToken });
    return NextResponse.json(ApiRes.success('ok'));

}


export async function GET(request: NextRequest, { params }: { params: { func: string } }) {

    switch (params.func) {
        case 'cars':
            const carsList = await listCars();
            return NextResponse.json(ApiRes.success(carsList));
        case 'notifyTypes':
            return NextResponse.json(ApiRes.success(notifyTypes()));
    }

    return NextResponse.json(ApiRes.error('unknown request'));

}

export async function DELETE(request: NextRequest, { params }: { params: { func: string } }) {

    const id = request.nextUrl.searchParams.get('id');
    if (!id || params.func !== 'cars') {
        return NextResponse.json(ApiRes.error('unsupported operation'));
    }
    await deleteCarInfo(id);
    return NextResponse.json(ApiRes.success('删除成功'));

}

function hmac512(key: string, s: string) {
    const hmac = crypto2.createHmac('sha512', key);
    // 更新要计算的消息
    hmac.update(s);
    // 返回计算结果（十六进制字符串）
    return hmac.digest('hex');
}

async function listCars() {
    return (await KvDB.list('car_info_')).filter(c => !!c).map(c => JSON.parse(<string>c));
}

async function deleteCarInfo(id: string) {
    const infoKey = `car_info_${id}`;
    await KvDB.del(infoKey);
}

async function updateInfo(id: string, info: any) {
    const infoKey = `car_info_${id}`;
    await KvDB.put(infoKey, JSON.stringify(info));
}