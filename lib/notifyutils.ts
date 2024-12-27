const notifyTypeMap = [
    { 'id': '1', 'name': 'WxPusher', 'functionName': wxpusher, 'tips': '\r\nAT_xxxxxx|UID_xxxxxx' },
    {
        'id': '2',
        'name': 'Bark',
        'functionName': bark,
        'tips': '\r\ntoken|soundName\r\n\r\n注：token为xxxxxx代表的值，直接输入该值即可，请勿输入完整链接（https://api.day.app/xxxxxx），soundName为铃声名称（默认使用：multiwayinvitation），如需自定义铃声需要把铃声文件先上传到BarkApp',
    },
    {
        'id': '3',
        'name': '飞书机器人',
        'functionName': feishu,
        'tips': '\r\ntoken\r\n\r\n注：token为xxxxxx代表的值，直接输入该值即可，请勿输入完整链接（https://open.feishu.cn/open-apis/bot/v2/hook/xxxxxx）',
    },
    {
        'id': '4',
        'name': '企业微信机器人',
        'functionName': weixin,
        'tips': '\r\ntoken\r\n\r\n注：token为xxxxxx代表的值，直接输入该值即可，请勿输入完整链接（https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=xxxxxx）',
    },
    {
        'id': '5',
        'name': '钉钉机器人',
        'functionName': dingtalk,
        'tips': '\r\ntoken\r\n\r\n注：token为xxxxxx代表的值，直接输入该值即可，请勿输入完整链接（https://oapi.dingtalk.com/robot/send?access_token=xxxxxx）',
    },
];


async function wxpusher(token: string, message: string) {
    const tokens = token.split('|');
    const reqUrl = 'https://wxpusher.zjiecode.com/api/send/message';
    const jsonBody = {
        appToken: `${tokens[0]}`,
        uids: [`${tokens[1]}`],
        content: `${message}`,
        contentType: 1,
    };
    const response = await postRequest(reqUrl, jsonBody);
    const json: any = await response.json();
    const { code } = json;
    if (code !== 1000) {
        console.error(json);
        return false;
    }
    return true;
}

async function bark(token: string, message: string) {
    const tokens = token.split('|');
    const reqUrl = 'https://api.day.app/push';

    const jsonBody: {
        title: string,
        body: string | undefined,
        device_key: string,
        sound: string,
        group: string,
        call: string,
        url: string | undefined
    } = {
        title: '挪车通知',
        body: undefined,
        device_key: tokens[0] || '',
        sound: tokens[1] || 'multiwayinvitation',
        group: '挪车通知',
        call: '1',
        url: undefined,
    };
    if (message.startsWith('http')) {
        jsonBody.url = message;
    } else {
        jsonBody.body = message;
    }

    const response = await postRequest(reqUrl, jsonBody);
    const json: any = await response.json();
    const { code } = json;
    if (code !== 200) {
        console.error(json);
        return false;
    }
    return true;
}

async function feishu(token: string, message: string) {
    const reqUrl = `https://open.feishu.cn/open-apis/bot/v2/hook/${token}`;
    const jsonBody = {
        'msg_type': 'text',
        'content': {
            'text': message,
        },
    };
    const response = await postRequest(reqUrl, jsonBody);
    const json: any = await response.json();
    const { code } = json;
    if (code !== 0) {
        console.error(json);
        return false;
    }
    return true;
}

async function weixin(token: string, message: string) {
    const reqUrl = `https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=${token}`;
    const jsonBody = {
        'msgtype': 'text',
        'text': {
            'content': message,
        },
    };
    const response = await postRequest(reqUrl, jsonBody);
    const json: any = await response.json();
    const { code } = json;
    if (code !== 0) {
        console.error(json);
        return false;
    }
    return true;
}

async function dingtalk(token: string, message: string) {
    const reqUrl = `https://oapi.dingtalk.com/robot/send?access_token=${token}`;
    const jsonBody = {
        'msgtype': 'text',
        'text': {
            'content': message,
        },
    };
    const response = await postRequest(reqUrl, jsonBody);
    const json: any = await response.json();
    const { code } = json;
    if (code !== 0) {
        console.error(json);
        return false;
    }
    return true;
}

async function postRequest(reqUrl: string, jsonBody: object, headers: object = {}) {
    const response = await fetch(reqUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...headers,
        },
        body: JSON.stringify(jsonBody),
    });

    if (!response.ok) {
        throw new Error('Unexpected response ' + response.status);
    }
    return response;
}

export async function sendMsg(notifyId: string, notifyToken: string, message: string) {
    const provider = notifyTypeMap.find(e => e.id === notifyId);
    let result = false;
    if (provider) {
        result = await provider.functionName(notifyToken, message);
    }
    return result;
}

export function notifyTypes() {
    return notifyTypeMap.map(c => {
        return {
            id: c.id,
            name: c.name,
            tips: c.tips,
        };
    });
}