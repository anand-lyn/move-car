import { getCloudflareContext } from '@opennextjs/cloudflare';

export const KvDB = {
    async get(key: string) {
        const carsKv = (await getCloudflareContext()).env.CARS_KV;
        return await carsKv.get(key);
    },

    async del(key: string) {
        const carsKv = (await getCloudflareContext()).env.CARS_KV;
        await carsKv.delete(key);
    },

    async put(key: string, value: any, options = {}) {
        const carsKv = (await getCloudflareContext()).env.CARS_KV;
        await carsKv.put(key, value, options);
    },


    async list(prefix: string, limit: number = 50) {
        const carsKv = (await getCloudflareContext()).env.CARS_KV;
        return await Promise.all((await carsKv.list({ limit, prefix })).keys.map(async key => {
            return await this.get(key.name);
        }));
    },
};
