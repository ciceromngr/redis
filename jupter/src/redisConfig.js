const Redis = require('ioredis')
const { promisify } = require('util')
const redis = new Redis()

async function getRedis(value) {
    const asyncRedisGet = promisify(redis.get).bind(redis)
    return asyncRedisGet(value)
}

async function setRedis(key, value) {
    const asyncRedisSet = promisify(redis.set).bind(redis)
    return asyncRedisSet(key, value)
}

module.exports = {
    getRedis,
    setRedis
}
