// app/middleware.ts
import { NextRequest, NextResponse } from 'next/server';

const secret = process.env.SECRET_KEY;
const password = process.env.CONSOLE_PASSWORD;

export async function middleware(request: NextRequest) {
    const auth = request.cookies.get('auth');
    const timestamp = request.cookies.get('timestamp');

    // 如果 cookie 不存在或者无效
    if (!auth || !timestamp) {
        // 重定向到登录页
        return NextResponse.redirect(new URL('/console/login', request.url));
    }
    const signData = JSON.stringify({ password, timestamp: timestamp.value });
    // @ts-ignore
    const s = await hmac512(secret, signData);
    if (s !== auth.value) {
        return NextResponse.redirect(new URL('/console/login', request.url));
    }

    // 如果 cookie 存在且有效，继续处理请求
    return NextResponse.next();
}

async function hmac512(secretKey: string, message: string) {
    // 将字符串密钥转换为 ArrayBuffer
    const enc = new TextEncoder();
    const keyData = enc.encode(secretKey);

    // 导入密钥，用于生成 HMAC
    const cryptoKey = await crypto.subtle.importKey(
        'raw', // 密钥的原始格式
        keyData, // 密钥的二进制数据
        { name: 'HMAC', hash: { name: 'SHA-512' } }, // 使用 HMAC 和 SHA-512
        false, // 不允许导出密钥
        ['sign'], // 密钥的用途
    );

    // 将消息转换为 ArrayBuffer
    const messageData = enc.encode(message);

    // 使用 HMAC-SHA-512 签名消息
    const signature = await crypto.subtle.sign('HMAC', cryptoKey, messageData);

    // 将签名转换为十六进制字符串
    return Array.from(new Uint8Array(signature))
        .map((byte) => byte.toString(16).padStart(2, '0'))
        .join('');
}


// 配置 matcher 以控制哪些路径会使用该中间件
export const config = {
    matcher: ['/console', '/api/admin/((?!login).*)'],
};
