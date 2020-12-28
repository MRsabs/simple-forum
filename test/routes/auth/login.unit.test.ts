import tap from 'tap';
import { LoginHandler } from '@src/routes/auth/login';
import buildFastify from '@app';

const fastify = buildFastify();

tap.tearDown(async () => {
  await fastify.mongoClient.close();
  fastify.redisClient.end(true);
});

tap.test('isInputValid ', async (t) => {
  const defultBody = {
    email: 'loginunittest@test.com',
    password: 'pass123',
  };
  await fastify.ready();
  function isInputValid(opt?: { key: 'email' | 'password'; value: string }) {
    const body = defultBody;
    if (!opt) {
      return new LoginHandler(body, fastify.log).isInputValid();
    } else {
      const { key, value } = opt;
      body[key] = value;
      return new LoginHandler(body, fastify.log).isInputValid();
    }
  }
  t.deepEqual(isInputValid(), true, 'valid input');
  t.deepEqual(isInputValid({ key: 'email', value: 'InvalidEmail.com' }), false, 'Invalid email');
  t.deepEqual(isInputValid({ key: 'password', value: '' }), false, 'invalid password');
  t.end();
});

tap.test('isUserExist', async (t) => {
  const defultBody = {
    email: 'loginunittest@test.com',
    username: 'loginunittest',
    password: 'pass123',
    repeatPassword: 'pass123',
  };
  await fastify.ready();
  await fastify.AppStatus.isAppReady();
  function loginHandler(opt?: { key: 'email' | 'password'; value: string }) {
    const body = defultBody;
    if (!opt) {
      return new LoginHandler(body, fastify.log);
    } else {
      const { key, value } = opt;
      body[key] = value;
      return new LoginHandler(body, fastify.log);
    }
  }

  t.test('tesing for user that does not exist', async (t) => {
    try {
      const Exist = loginHandler();
      const exists = await Exist.isUserExist();
      if (exists) {
        t.pass('ok user does exist');
        t.end();
      } else {
        t.pass('failed user does not exist');
      }
    } catch (error) {
      console.error(error);
      t.fail('Promise failed');
      t.end();
    }
  });

  // tesing for user that does exist
  t.test('tesing for user that does exist', async (t) => {
    try {
      const response = await fastify.inject().post('/auth/register').body(defultBody).end();
      if (response.statusCode !== 200) {
        t.fail('user did not register');
        t.end();
      }
      const Exist = loginHandler();
      const exists = await Exist.isUserExist();
      if (!exists) {
        t.fail('failed user does exist');
        t.end();
      } else {
        t.pass('ok user does not exist');
      }
    } catch (error) {
      console.error(error);
      t.fail('Promise failed');
      t.end();
    }
  });

  t.test('delete temp user', async (t) => {
    try {
      const u = await fastify.mongoClient.model('User').findOneAndDelete({ username: 'loginunittest' });
      if (!u) {
        t.fail('temp user not Found');
      } else {
        t.pass('user did get deleted');
      }
    } catch (error) {
      t.fail(error);
    }
  });

  // testing for mongose unable to find
  t.test('testing for mongose unable to find', async (t) => {
    try {
      await fastify.mongoClient.close();
      const Exist = loginHandler();
      await Exist.isUserExist();
      t.fail('Mongoose able to do a query');
      t.end();
    } catch (error) {
      t.pass('ok Mongoose unable to do a query ');
      t.end();
    }
  });

  t.test('testing for bcrypt unable to compare passwords', async (t) => {
    try {
      // @ts-ignore
      const Exist = loginHandler({ key: 'password', value: undefined });
      await Exist.isUserPasswordValid();
      t.fail('bcrypt able to compare passwords');
      t.end();
    } catch (error) {
      t.pass('ok bcrypt unable to compare passwords ');
      t.end();
    }
  });

  t.end();
});

tap.end();
