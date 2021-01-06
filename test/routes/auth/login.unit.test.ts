import t from 'tap';
import { testable } from '@src/routes/auth/login';
import buildFastify from '@app';

const { LoginHandler } = testable;
const defultRegisterBody = {
  email: 'loginunittest@test.com',
  username: 'loginunittest',
  password: 'pass123',
  repeatPassword: 'pass123',
};
const defultLoginBody = {
  email: 'loginunittest@test.com',
  password: 'pass123',
};
const fastify = buildFastify();
fastify.ready().then(() => {
  function loginHandler(opt?: { key: 'email' | 'password'; value: string }) {
    const body = { ...defultLoginBody };
    if (!opt) {
      return new LoginHandler(fastify, body);
    } else {
      const { key, value } = opt;
      body[key] = value;
      return new LoginHandler(fastify, body);
    }
  }

  t.test('isInputValid ', (t) => {
    function isInputValid(opt?: { key: 'email' | 'password'; value: string }) {
      const body = { ...defultLoginBody };
      if (!opt) {
        return new LoginHandler(fastify, body).isInputValid();
      } else {
        const { key, value } = opt;
        body[key] = value;
        return new LoginHandler(fastify, body).isInputValid();
      }
    }
    t.deepEqual(isInputValid(), true);
    t.deepEqual(isInputValid({ key: 'email', value: 'InvalidEmail.com' }), false);
    t.deepEqual(isInputValid({ key: 'password', value: '' }), false);
    t.end();
  });

  t.test('tesing for user that does not exist', (t) => {
    const Exist = loginHandler();
    Exist.isUserExist()
      .then((exist) => {
        if (exist) {
          t.fail('user does exist');
        }
      })
      .catch(() => {
        t.pass();
      })
      .finally(() => t.end());
  });

  // group
  t.test('register temp user', (t) => {
    fastify
      .inject()
      .post('auth/register')
      .body(defultRegisterBody)
      .end()
      .then((response) => {
        t.deepEqual(response.statusCode, 200);
      })
      .catch((err) => {
        t.fail(err);
      })
      .finally(() => t.end());
  });

  t.test('tesing for user that does exist', (t) => {
    const Exist = loginHandler();
    Exist.isUserExist()
      .then((exists) => {
        if (exists) {
          t.pass();
        } else {
          t.fail('user does not exist');
        }
      })
      .catch((err) => {
        t.fail(err);
      })
      .finally(() => t.end());
  });

  t.test('delete temp user', (t) => {
    fastify.mongoClient
      .model('User')
      .findOneAndDelete({ username: 'loginunittest' })
      .then((user) => {
        if (!user) {
          t.fail('temp user not Found');
        }
      })
      .catch(() => {
        t.pass();
      })
      .finally(() => t.end());
  });

  t.test('testing for mongose unable to find', async (t) => {
    await fastify.mongoClient.close();
    const Exist = loginHandler();
    Exist.isUserExist()
      .then(() => {
        t.fail('mongoose should fail ');
      })
      .finally(() => t.end());
  });

  t.test('testing for bcrypt unable to compare passwords', (t) => {
    // @ts-ignore
    const Exist = loginHandler({ key: 'password', value: null });
    Exist.isUserPasswordValid()
      .catch(() => {
        t.pass();
      })
      .finally(() => t.end());
  });
});
