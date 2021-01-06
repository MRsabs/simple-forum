import buildFastify from '../../../src/app';
import t from 'tap';

const defultBody = {
  email: 'getuserunit@test.com',
  username: 'getuserunit',
  password: 'pass123',
  repeatPassword: 'pass123',
};
const fastify = buildFastify();
fastify.ready().then(() => {
  t.tearDown(() => {
    fastify.mongoClient.close();
  });

  t.test('register temp user', (t) => {
    fastify
      .inject()
      .post('/auth/register')
      .body(defultBody)
      .end()
      .then((response) => t.deepEqual(response.statusCode, 200))
      .catch((err) => {
        throw err;
      })
      .finally(() => t.end());
  });

  t.test('GET temp user', (t) => {
    fastify
      .inject({
        url: `user/${defultBody.username}`,
        method: 'GET',
      })
      .then((response) => t.deepEqual(response.statusCode, 200))
      .catch((err) => {
        throw err;
      })
      .finally(() => t.end());
  });

  t.test('delete temp user', (t) => {
    fastify.mongoClient
      .model('User')
      .findOneAndDelete({ email: defultBody.email })
      .then((user) => {
        if (!user) {
          throw new Error('mongodb did not find the user');
        }
      })
      .catch((err) => {
        throw err;
      })
      .finally(() => t.end());
  });
});
