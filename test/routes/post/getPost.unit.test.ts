import buildFastify from '@app';
import { testables } from '@routes/post/getPost';
import tap from 'tap';

const fastify = buildFastify();

tap.tearDown(async () => {
  fastify.redisClient.end(true);
});

tap.test('Mongoose can not find post', async (t) => {
  await fastify.ready();
  await fastify.mongoClient.close();
  const { GetPostHandler } = testables;
  const handler = new GetPostHandler({ slug: 'test' }, fastify.log);
  try {
    await handler.isPostExist();
    t.fail('post should not exist');
    t.end();
  } catch (error) {
    t.deepEqual(handler.errorReply.status, 500);
    t.deepEqual(handler.errorReply.msg, 'Something went wrong');
    t.end();
  }
});

tap.test('Mongoose can not populate', async (t) => {
  await fastify.ready();
  const { GetPostHandler } = testables;
  const handler = new GetPostHandler({ slug: 'test' }, fastify.log);
  try {
    await handler.isPostReady();
    t.fail('post should not exist');
    t.end();
  } catch (error) {
    t.deepEqual(handler.errorReply.status, 500);
    t.deepEqual(handler.errorReply.msg, 'Something went wrong');
    t.end();
  }
});

tap.end();
