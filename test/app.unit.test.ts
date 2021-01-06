import buildFastify from '@app';
import t from 'tap';

t.test('in development', (t) => {
  t.tearDown(() => {
    fastify.mongoClient.close();
  });
  process.env.NODE_ENV = 'development';
  const fastify = buildFastify();
  fastify.ready().then(() => t.end());
});

t.test('in test', (t) => {
  t.tearDown(() => {
    fastify.mongoClient.close();
  });
  process.env.NODE_ENV = 'test';
  const fastify = buildFastify();
  fastify.ready().then(() => t.end());
});

t.test('in production', (t) => {
  t.tearDown(() => {
    fastify.mongoClient.close();
  });
  process.env.NODE_ENV = 'production';
  const fastify = buildFastify();
  fastify.ready().then(() => t.end());
});

t.test('unknown', (t) => {
  t.tearDown(() => {
    fastify.mongoClient.close();
  });
  process.env.NODE_ENV = undefined;
  const fastify = buildFastify();
  fastify.ready().then(() => t.end());
});
