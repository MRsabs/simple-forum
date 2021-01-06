import buildFastify from '@app';
import t from 'tap';

const fastify = buildFastify();
fastify.ready().then(() => {
  t.test('invalid user input', (t) => {
    fastify
      .inject()
      .post('/auth/register')
      .body({ email: 'testtest.com', username: 'authtestts', password: 'pass123', repeatPassword: 'pass123' })
      .end()
      .then((response) => {
        t.deepEqual(response.statusCode, 400);
        t.deepEqual(JSON.parse(response.body), { msg: 'Invalid' });
      })
      .catch((err) => {
        t.fail(err);
      })
      .finally(() => t.end());
  });
  t.test('register a new user', (t) => {
    fastify
      .inject()
      .post('/auth/register')
      .body({ email: 'authtestts@test.com', username: 'authtestts', password: 'pass123', repeatPassword: 'pass123' })
      .end()
      .then((response) => {
        t.deepEqual(response.statusCode, 200);
        t.deepEqual(JSON.parse(response.body), { msg: 'ok' });
      })
      .catch((err) => {
        t.fail(err);
      })
      .finally(() => t.end());
  });

  t.test('User alreday exists', (t) => {
    fastify
      .inject()
      .post('/auth/register')
      .body({ email: 'authtestts@test.com', username: 'authtestts', password: 'pass123', repeatPassword: 'pass123' })
      .end()
      .then((response) => {
        t.deepEqual(response.statusCode, 409);
        t.deepEqual(JSON.parse(response.body), { msg: 'User already exists' });
      })
      .catch((err) => {
        t.fail(err);
      })
      .finally(() => t.end());
  });

  t.test('delete temp user', (t) => {
    fastify.mongoClient
      .model('User')
      .findOneAndDelete({ username: 'authtestts' })
      .then((user) => {
        if (!user) {
          throw new Error('user not found');
        }
      })
      .catch((err) => {
        t.fail(err);
      })
      .finally(() => t.end());
  });

  // login
  t.test('register', (t) => {
    fastify
      .inject()
      .post('/auth/register')
      .body({ email: 'authtestts@test.com', username: 'authtestts', password: 'pass123', repeatPassword: 'pass123' })
      .end()
      .then((response) => {
        t.deepEqual(response.statusCode, 200);
        t.deepEqual(JSON.parse(response.body), { msg: 'ok' });
      })
      .catch((err) => {
        t.fail(err);
      })
      .finally(() => t.end());
  });

  t.test('login with bad input', (t) => {
    fastify
      .inject()
      .post('/auth/login')
      .body({ email: 'authtestts@test.com' })
      .end()
      .then((response) => {
        t.deepEqual(response.statusCode, 400);
        t.deepEqual(JSON.parse(response.body), { msg: 'Invalid' });
      })
      .catch((err) => {
        t.fail(err);
      })
      .finally(() => t.end());
  });

  t.test('login with bad password', (t) => {
    fastify
      .inject()
      .post('/auth/login')
      .body({ email: 'authtestts@test.com', password: 'pass1234' })
      .end()
      .then((response) => {
        t.deepEqual(response.statusCode, 401);
        t.deepEqual(JSON.parse(response.body), { msg: 'Email or Password is incorrect' });
      })
      .catch((err) => {
        t.fail(err);
      })
      .finally(() => t.end());
  });

  t.test('login ok', (t) => {
    fastify
      .inject()
      .post('/auth/login')
      .body({ email: 'authtestts@test.com', password: 'pass123' })
      .end()
      .then((response) => {
        t.deepEqual(response.statusCode, 200);
      })
      .catch((err) => {
        t.fail(err);
      })
      .finally(() => t.end());
  });

  t.test('login with a user that does not exist', (t) => {
    fastify
      .inject()
      .post('/auth/login')
      .body({ email: 'doesnotexist@test.com', password: 'pass123' })
      .end()
      .then((response) => {
        t.deepEqual(response.statusCode, 401);
        t.deepEqual(JSON.parse(response.body), { msg: 'Email or Password is incorrect' });
      })
      .catch((err) => {
        t.fail(err);
      })
      .finally(() => t.end());
  });

  t.test('delete temp user', (t) => {
    fastify.mongoClient
      .model('User')
      .findOneAndDelete({ username: 'authtestts' })
      .then((user) => {
        if (!user) {
          throw new Error('temp user not Found');
        }
      })
      .catch((err) => {
        t.fail(err);
      })
      .finally(() => t.end());
  });

  // end-login

  t.test('mongoose unable to save', (t) => {
    fastify.mongoClient.close().then(() => {
      fastify
        .inject()
        .post('/auth/register')
        .body({ email: 'authtestts@test.com', username: 'authtestts', password: 'pass123', repeatPassword: 'pass123' })
        .end()
        .then((response) => {
          t.deepEqual(response.statusCode, 500);
          t.deepEqual(JSON.parse(response.body), { msg: 'Something went wrong' });
        })
        .catch((err) => {
          t.fail(err);
        })
        .finally(() => t.end());
    });
  });
});
