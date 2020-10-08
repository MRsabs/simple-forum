import mongoose from 'mongoose';
import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import fp from 'fastify-plugin';

const dbURL = 'mongodb://localhost:27017/test';
const mongoClient = mongoose.createConnection(dbURL, { useNewUrlParser: true, useUnifiedTopology: true });

declare module 'fastify' {
	interface FastifyInstance {
		mongoClient: mongoose.Connection;
	}
}

export default fp(
	async function (fastify: FastifyInstance, opts: FastifyPluginOptions) {
		opts.dependencies = 'AppStatus';
		fastify.decorate('mongoClient', mongoClient);
		fastify.mongoClient.on('connected', () => mongoConnnected(fastify));
		fastify.mongoClient.on('error', (err) => fastify.log.error(`Mongoose connection has occured ${err} error`));
		fastify.mongoClient.on('disconnected', () => mongoDisconnected(fastify));
	},
	{ name: 'mongoClient' }
);

function mongoConnnected(fastify: FastifyInstance) {
	fastify.AppStatus.setMongoStatus = true;
	fastify.log.info(`Mongoose connection is open to ${dbURL}`);
}

function mongoDisconnected(fastify: FastifyInstance) {
	fastify.AppStatus.setMongoStatus = false;
	fastify.log.warn(`Mongoose connection is disconnected`);
}
