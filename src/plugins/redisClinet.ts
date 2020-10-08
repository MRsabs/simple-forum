// @ts-nocheck

import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import fp from 'fastify-plugin';
import redis from 'redis';

const dbURL = 'redis://127.0.0.1:6379';
const redisClient = redis.createClient({ url: dbURL });

declare module 'fastify' {
	interface FastifyInstance {
		redisClient: redis.RedisClient;
	}
}

export default fp(
	async function (fastify: FastifyInstance, opts: FastifyPluginOptions) {
		opts.dependencies = 'AppStatus';
		fastify.decorate('redisClient', redisClient);
		fastify.redisClient.on('connect', () => redisConnnected(fastify));
		fastify.redisClient.on('error', (err) => fastify.log.error(`Redis connection has occured ${err}`));
		fastify.redisClient.on('end', () => redisDisconnected(fastify));
	},
	{ name: 'redisClient' }
);

function redisConnnected(fastify: FastifyInstance) {
	fastify.AppStatus.setRedisStatus = true;
	fastify.log.info(`Redis connection is open to ${dbURL}`);
}

function redisDisconnected(fastify: FastifyInstance) {
	fastify.AppStatus.setRedisStatus = false;
	fastify.log.warn(`Redis connection is disconnected`);
}
