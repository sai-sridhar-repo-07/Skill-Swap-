const { createClient } = require('redis');
const { logger } = require('../utils/logger');

let redisClient = null;

const connectRedis = async () => {
  let client = null;
  try {
    client = createClient({
      url: process.env.REDIS_URL,
      socket: { reconnectStrategy: false }, // never auto-reconnect
    });
    // Swallow all errors so a dead Redis never crashes the process
    client.on('error', () => {});

    const connectPromise = client.connect();
    connectPromise.catch(() => {}); // prevent unhandledRejection if timeout fires first

    await Promise.race([
      connectPromise,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Redis connect timeout')), 3000)
      ),
    ]);

    logger.info('Redis Connected');
    redisClient = client;
    return redisClient;
  } catch (error) {
    logger.warn(`Redis unavailable (continuing without cache): ${error.message}`);
    // Force-close so the abandoned TCP socket doesn't linger
    if (client) { try { client.disconnect(); } catch {} }
    redisClient = null;
    return null;
  }
};

const getRedis = () => redisClient;

const cacheGet = async (key) => {
  if (!redisClient) return null;
  try {
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : null;
  } catch { return null; }
};

const cacheSet = async (key, value, ttlSeconds = 300) => {
  if (!redisClient) return;
  try {
    await redisClient.setEx(key, ttlSeconds, JSON.stringify(value));
  } catch {}
};

const cacheDel = async (key) => {
  if (!redisClient) return;
  try { await redisClient.del(key); } catch {}
};

module.exports = { connectRedis, getRedis, cacheGet, cacheSet, cacheDel };
