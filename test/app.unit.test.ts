import buildFastify from '@app';
import tap from 'tap';

tap.test('testing all envs', async (t) => {
  t.test('in development', async (t) => {
    t.tearDown(() => {
      fastify.redisClient.end(true);
      fastify.mongoClient.close();
    });
    process.env.NODE_ENV = 'development';
    const fastify = buildFastify();
    await fastify.ready();
    t.end();
  });

  t.test('in test', async (t) => {
    t.tearDown(() => {
      fastify.redisClient.end(true);
      fastify.mongoClient.close();
    });
    process.env.NODE_ENV = 'test';
    const fastify = buildFastify();
    await fastify.ready();
    t.end();
  });

  t.test('in production', async (t) => {
    t.tearDown(() => {
      fastify.redisClient.end(true);
      fastify.mongoClient.close();
    });
    process.env.NODE_ENV = 'production';
    const fastify = buildFastify();
    await fastify.ready();
    t.end();
  });

  t.test('unknown', async (t) => {
    t.tearDown(() => {
      fastify.redisClient.end(true);
      fastify.mongoClient.close();
    });
    process.env.NODE_ENV = undefined;
    const fastify = buildFastify();
    await fastify.ready();
    t.end();
  });
  t.end();
});
