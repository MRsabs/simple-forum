import buildFastify from '@app';
import tap from 'tap';
const fastify = buildFastify();

tap.tearDown(async () => {
  fastify.redisClient.end(true);
});

tap.test('invalid user input', async (t) => {
  await fastify.ready();
  const response = await fastify
    .inject()
    .post('/auth/register')
    .body({ email: 'testtest.com', username: 'authtestts', password: 'pass123', repeatPassword: 'pass123' })
    .end();
  t.deepEqual(response.statusCode, 400);
  t.deepEqual(JSON.parse(response.body), { msg: 'Invalid' });
  t.end();
});

tap.test('register a new user', async (t) => {
  await fastify.ready();
  const response = await fastify
    .inject()
    .post('/auth/register')
    .body({ email: 'authtestts@test.com', username: 'authtestts', password: 'pass123', repeatPassword: 'pass123' })
    .end();
  t.deepEqual(response.statusCode, 200);
  t.deepEqual(JSON.parse(response.body), { msg: 'ok' });
  t.end();
});

tap.test('User alreday exists', async (t) => {
  await fastify.ready();
  const response = await fastify
    .inject()
    .post('/auth/register')
    .body({ email: 'authtestts@test.com', username: 'authtestts', password: 'pass123', repeatPassword: 'pass123' })
    .end();
  t.deepEqual(response.statusCode, 409);
  t.deepEqual(JSON.parse(response.body), { msg: 'User already exists' });
  await fastify.mongoClient.models['User'].findOneAndDelete({ username: 'authtestts' });
  t.end();
});

tap.test('mongoose unable to save', async (t) => {
  await fastify.ready();
  await fastify.mongoClient.close();
  const response = await fastify
    .inject()
    .post('/auth/register')
    .body({ email: 'authtestts@test.com', username: 'authtestts', password: 'pass123', repeatPassword: 'pass123' })
    .end();
  t.deepEqual(response.statusCode, 500);
  t.deepEqual(JSON.parse(response.body), { msg: 'Something went wrong' });
  t.end();
});

tap.end();
