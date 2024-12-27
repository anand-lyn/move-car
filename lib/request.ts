import { ApiRes } from '@/lib/ApiRes';

export async function postRequest(url: string, body?: Record<string, any>) {
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
        throw new Error('Unexpected response ' + response.status);
    }
    const json = await response.json<ApiRes>();
    if (json.code !== 200) {
        console.log(json);
        throw new Error(json.msg);
    }
    return json.data;
}

export async function getRequest(url: string) {
    const response = await fetch(url, {
        method: 'GET',
    });
    if (!response.ok) {
        throw new Error('Unexpected response ' + response.status);
    }
    const json = await response.json<ApiRes>();
    if (json.code !== 200) {
        console.log(json);
        throw new Error(json.msg);
    }
    return json.data;
}

export async function delRequest(url: string) {
    const response = await fetch(url, {
        method: 'DELETE',
    });
    if (!response.ok) {
        throw new Error('Unexpected response ' + response.status);
    }
    const json = await response.json<ApiRes>();
    if (json.code !== 200) {
        console.log(json);
        throw new Error(json.msg);
    }
    return json.data;
}
