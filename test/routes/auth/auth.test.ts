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
  t.test('delete temp user', async (t) => {
    try {
      const u = await fastify.mongoClient.model('User').findOneAndDelete({ username: 'authtestts' });
      if (!u) {
        t.fail('temp user not Found');
      } else {
        t.pass('user did get deleted');
      }
    } catch (error) {
      t.fail(error);
    }
  });
  t.end();
});

tap.test('login', async (t) => {
  t.test('register', async (t) => {
    const register = await fastify
      .inject()
      .post('/auth/register')
      .body({ email: 'authtestts@test.com', username: 'authtestts', password: 'pass123', repeatPassword: 'pass123' })
      .end();
    t.deepEqual(register.statusCode, 200);
    t.deepEqual(JSON.parse(register.body), { msg: 'ok' });
  });

  t.test('login with bad input', async (t) => {
    const login = await fastify.inject().post('/auth/login').body({ email: 'authtestts@test.com' }).end();
    t.deepEqual(login.statusCode, 400);
    t.deepEqual(JSON.parse(login.body), { msg: 'Invalid' });
  });

  t.test('login with bad password', async (t) => {
    const login = await fastify
      .inject()
      .post('/auth/login')
      .body({ email: 'authtestts@test.com', password: 'pass1234' })
      .end();
    t.deepEqual(login.statusCode, 401);
    t.deepEqual(JSON.parse(login.body), { msg: 'Email or Password is incorrect' });
  });

  t.test('login ok', async (t) => {
    const login = await fastify
      .inject()
      .post('/auth/login')
      .body({ email: 'authtestts@test.com', password: 'pass123' })
      .end();
    t.deepEqual(login.statusCode, 200);
    // t.deepEqual(JSON.parse(login.body), { msg: 'ok' });
  });

  t.test('login with a user that does not exist', async (t) => {
    const login = await fastify
      .inject()
      .post('/auth/login')
      .body({ email: 'doesnotexist@test.com', password: 'pass123' })
      .end();
    t.deepEqual(login.statusCode, 401);
    t.deepEqual(JSON.parse(login.body), { msg: 'Email or Password is incorrect' });
  });

  t.test('delete temp user', async (t) => {
    try {
      const u = await fastify.mongoClient.model('User').findOneAndDelete({ username: 'authtestts' });
      if (!u) {
        t.fail('temp user not Found');
      } else {
        t.pass('user did get deleted');
      }
    } catch (error) {
      t.fail(error);
    }
  });
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
