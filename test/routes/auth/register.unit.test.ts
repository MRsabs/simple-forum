import tap from 'tap';
import { RegisterHandler } from '@src/routes/auth/register';
import buildFastify from '@app';

const fastify = buildFastify();

tap.tearDown(async () => {
  await fastify.mongoClient.close();
  fastify.redisClient.end(true);
});

tap.test('isInputValid ', async (t) => {
  const defultBody = {
    email: 'registerunittest@test.com',
    username: 'registerunittest',
    password: 'pass123',
    repeatPassword: 'pass123',
  };
  await fastify.ready();
  function isInputValid(opt?: { key: 'email' | 'username' | 'password' | 'repeatPassword'; value: string }) {
    const body = defultBody;
    if (!opt) {
      return new RegisterHandler(body, fastify.log).isInputValid();
    } else {
      const { key, value } = opt;
      body[key] = value;
      return new RegisterHandler(body, fastify.log).isInputValid();
    }
  }
  t.resolves(async () => await isInputValid(), 'valid input');
  t.rejects(async () => await isInputValid({ key: 'email', value: 'InvalidEmail.com' }), 'Invalid email');
  t.rejects(async () => await isInputValid({ key: 'password', value: '' })), 'invalid password';
  t.rejects(async () => await isInputValid({ key: 'username', value: '' }), 'invalid username');
  t.rejects(async () => await isInputValid({ key: 'repeatPassword', value: '' }), 'invalid repeatPassword');
  t.end();
});

tap.test('isUserSaved & isUserExist', async (t) => {
  const defultBody = {
    email: 'registerunittest@test.com',
    username: 'registerunittest',
    password: 'pass123',
    repeatPassword: 'pass123',
  };
  await fastify.ready();
  function isUserSaved() {
    // @ts-ignore
    const handler = new RegisterHandler(defultBody, fastify.log);
    return handler;
  }
  try {
    const Saved = isUserSaved();
    const exists = await Saved.isUserExist();
    if (exists) {
      t.fail('failed user does exist');
      t.end();
    }
    await Saved.isUserSaved();
  } catch (error) {
    console.error(error);
    t.fail('Promise failed');
    t.end();
  }
  try {
    const unSaved = isUserSaved();
    const exists = await unSaved.isUserExist();
    if (!exists) {
      t.fail('failed user does not exist');
      t.end();
    }
    await unSaved.isUserSaved();
    t.fail('user did get saved');
  } catch (error) {
    t.pass(error);
  }

  await fastify.mongoClient.model('User').findOneAndDelete({ username: 'registerunittest' });
  t.end();
});

tap.end();
