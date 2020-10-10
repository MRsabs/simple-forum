import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import fp from 'fastify-plugin';
import fastifySession from 'fastify-session';
import connectRedis from 'connect-redis';

//@ts-expect-error
const RedisStore = connectRedis(fastifySession);

export default fp(async function (fastify: FastifyInstance, opts: FastifyPluginOptions) {
  opts.dependencies = 'redisClient';
  fastify.register(fastifySession, {
    secret: 'a secret with minimum length of 32 characters',
    store: new RedisStore({
      host: 'localhost',
      port: 6379,
      client: fastify.redisClient,
      ttl: 600,
    }),
    cookieName: 'sid',
    cookie: {
      secure: false,
      httpOnly: false,
      // domain: "localhost",
      // path: "/",
    },
  });
});
