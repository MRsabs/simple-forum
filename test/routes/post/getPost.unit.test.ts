import buildFastify from '@app';
import { testables } from '@routes/post/getPost';
import t from 'tap';

const { GetPostHandler } = testables;

const fastify = buildFastify();
fastify.ready().then(() => {
  fastify.mongoClient.close().then(() => {
    t.test('is post exist', (t) => {
      const d = new GetPostHandler(fastify, { slug: 'test' }).isPostExist();
      d.then(() => t.fail('should fail'));
      d.catch(() => t.pass('ok'));
      d.finally(() => t.end());
    });
    t.test('is post ready', (t) => {
      const d = new GetPostHandler(fastify, { slug: 'test' }).isPostReady();
      d.then(() => t.fail('should fail'));
      d.catch(() => t.pass('ok'));
      d.finally(() => t.end());
    });
  });
});
