const Redis = require('ioredis')

class Cache {
    constructor() {
        this.redis = new Redis({
            host: process.env.REDIS_HOST || 'localhost',
            port: process.env.REDIS_PORT || 6379
        })
    }

    async get(key) {
        const value = await this.redis.get(key)
        return value ? JSON.parse(value) : null
    }

    set(key, value) {
        return this.redis.set(key, value)
    }

    del(key) {
        return this.redis.del(key)
    }
}

module.exports = new Cache()
