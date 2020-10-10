// @ts-nocheck
import buildFastify from '../../src/app';
import { test } from 'tap';

test('GET `/` route', async (t) => {
  t.tearDown(() => {
    fastify.redisClient.end(true);
    fastify.mongoClient.close();
    fastify.server.close();
  });
  const fastify = buildFastify({});
  await fastify.ready();

  const response = await fastify.inject({
    url: '/',
    method: 'GET',
  });
  t.deepEqual(response.statusCode, 200);
  t.deepEqual(JSON.parse(response.body), { msg: 'hello' });
});
