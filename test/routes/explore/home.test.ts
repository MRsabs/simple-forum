import buildFastify from '@app';
import t from 'tap';

const fastify = buildFastify();
fastify.ready().then(() => {
  t.test('GET posts', (t) => {
    fastify
      .inject()
      .get('/explore')
      .query({ load: 0 })
      .end()
      .then((res) => {
        t.deepEqual(res.statusCode, 200);
      })
      .finally(() => t.end());
  });

  t.test('mongoose unable to find', (t) => {
    fastify.mongoClient.close().then(() => {
      fastify
        .inject()
        .get('/explore')
        .query({ load: 0 })
        .end()
        .then((res) => {
          t.deepEqual(res.statusCode, 500);
        })
        .finally(() => t.end());
    });
  });
});
