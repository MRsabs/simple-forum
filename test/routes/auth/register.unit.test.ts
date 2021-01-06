import tap from 'tap';
import { RegisterHandler } from '@src/routes/auth/register';
import buildFastify from '@app';

tap.test('Getting Ready', async (t) => {
  t.tearDown(async () => {
    fastify.mongoClient.close();
  });
  const fastify = buildFastify();
  await fastify.ready();

  t.test('isInputValid ', (t) => {
    const defultBody = {
      email: 'registerunittest@test.com',
      username: 'registerunittest',
      password: 'pass123',
      repeatPassword: 'pass123',
    };
    function isInputValid(opt?: { key: 'email' | 'username' | 'password' | 'repeatPassword'; value: string }) {
      const body = defultBody;
      if (!opt) {
        return new RegisterHandler(fastify, body).isInputValid();
      } else {
        const { key, value } = opt;
        body[key] = value;
        return new RegisterHandler(fastify, body).isInputValid();
      }
    }
    t.resolves(async () => await isInputValid(), 'valid input');
    t.rejects(async () => await isInputValid({ key: 'email', value: 'InvalidEmail.com' }), 'Invalid email');
    t.rejects(async () => await isInputValid({ key: 'password', value: '' })), 'invalid password';
    t.rejects(async () => await isInputValid({ key: 'username', value: '' }), 'invalid username');
    t.rejects(async () => await isInputValid({ key: 'repeatPassword', value: '' }), 'invalid repeatPassword');
    t.end();
  });

  t.test('isUserSaved & isUserExist', async (t) => {
    const defultBody = {
      email: 'registerunittest@test.com',
      username: 'registerunittest',
      password: 'pass123',
      repeatPassword: 'pass123',
    };
    function isUserSaved() {
      const handler = new RegisterHandler(fastify, defultBody);
      return handler;
    }

    await t.test('should save new user', async (t) => {
      try {
        const Saved = isUserSaved();
        const ext = await Saved.isUserExist();
        if (ext) {
          t.fail('failed user does exist');
        } else {
          await Saved.isUserSaved();
        }
      } catch (err) {
        t.fail(err);
      } finally {
        t.end();
      }
    });

    await t.test('should not save new user', async (t) => {
      try {
        const Saved = isUserSaved();
        const ext = await Saved.isUserExist();
        if (!ext) {
          t.fail('failed user does not exist');
        }
      } catch (err) {
        t.fail(err);
      } finally {
        t.end();
      }
    });

    await t.test('isUserSaved should fail', (t) => {
      // @ts-ignore
      const d = new RegisterHandler(fastify, { ...defultBody, password: null });
      d.isUserSaved()
        .then(() => {
          t.fail('isUserSaved resolved');
        })
        .catch(() => {
          t.pass();
        })
        .finally(() => t.end());
    });

    await t.test('delete temp user', (t) => {
      fastify.mongoClient
        .model('User')
        .findOneAndDelete({ username: 'registerunittest' })
        .then((exists) => {
          if (!exists) {
            t.fail('failed to delete user does not exist');
          }
        })
        .catch((err) => {
          t.fail(err);
        })
        .finally(() => t.end());
    });

    t.end();
  });
});
