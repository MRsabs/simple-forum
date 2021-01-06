import buildFastify from '../../../src/app';
import t from 'tap';

const fastify = buildFastify();
fastify.ready().then(() => {
  t.test('session-info', (t) => {
    fastify
      .inject()
      .get('/user/session-info')
      .end()
      .then((response) => {
        t.deepEqual(response.statusCode, 404);
      })
      .catch((err) => {
        t.fail(err);
      })
      .finally(() => t.end());
  });

  t.test('mongoose fail to get user', (t) => {
    fastify.mongoClient.close().then(() => {
      fastify
        .inject({
          url: `/user/session-info`,
          method: 'GET',
        })
        .then((res) => {
          t.deepEqual(res.statusCode, 500);
        })
        .catch((err) => {
          t.fail(err);
        })
        .finally(() => t.end());
    });
  });
});
