import buildFastify from '../../src/app';
import t from 'tap';

const fastify = buildFastify();
fastify.ready().then(() => {
  t.plan(2);
  t.tearDown(() => {
    fastify.mongoClient.close();
  });

  fastify
    .inject()
    .get('/')
    .end()
    .then((response) => {
      t.deepEqual(response.statusCode, 200);
      t.deepEqual(JSON.parse(response.body), { msg: 'hello' });
    })
    .catch((err) => {
      t.fail(err);
    });
});
