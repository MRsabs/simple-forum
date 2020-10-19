import buildFastify from '@app';
import { testables } from '@routes/post/addPost';
import tap from 'tap';

const fastify = buildFastify();

tap.tearDown(async () => {
  fastify.redisClient.end(true);
});

tap.test('post already exist', async (t) => {
  await fastify.ready();
  await fastify.mongoClient.close();
  const { NewPostHandler } = testables;
  const handler = new NewPostHandler({ title: 'title', content: 'content' }, '', fastify.log);
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

tap.test('post can not save', async (t) => {
  await fastify.ready();
  await fastify.mongoClient.close();
  const { NewPostHandler } = testables;
  const handler = new NewPostHandler({ title: 'title', content: 'content' }, '', fastify.log);
  try {
    await handler.isPostSaved();
    t.fail('mongoose should not save');
    t.end();
  } catch (error) {
    t.deepEqual(handler.errorReply.status, 500);
    t.deepEqual(handler.errorReply.msg, 'Something went wrong');
    t.end();
  }
});

tap.end();
