import buildFastify from '../../../src/app';
import t from 'tap';

const fastify = buildFastify();
fastify.ready().then(() => {
  t.plan(1);
  t.tearDown(() => {
    fastify.mongoClient.close();
    fastify.server.close();
  });
  fastify
    .inject()
    .get('/user/session-info')
    .end()
    .then((response) => {
      t.deepEqual(response.statusCode, 404);
    })
    .catch((err) => {
      t.fail(err);
    });
});
