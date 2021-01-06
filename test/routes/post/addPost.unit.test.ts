import buildFastify from '@app';
import { testables } from '@routes/post/addPost';
import t from 'tap';

const { NewPostHandler } = testables;

const fastify = buildFastify();
fastify.ready().then(() => {
  fastify.mongoClient.close().then(() => {
    t.test('post already exist', (t) => {
      const handler = new NewPostHandler(fastify, { title: 'title', content: 'content' }, 'userid');
      handler
        .isPostExist()
        .then(() => {
          t.fail('mongoose did not fail');
        })
        .catch(() => {
          t.deepEqual(handler.errorReply.status, 500);
          t.deepEqual(handler.errorReply.msg, 'Something went wrong');
        })
        .finally(() => t.end());
    });
  });
  t.test('post can not save', (t) => {
    const handler = new NewPostHandler(fastify, { title: 'title', content: 'content' }, 'userid');
    handler
      .isPostSaved()
      .then(() => {
        t.fail('mongoose should not save');
      })
      .catch(() => {
        t.deepEqual(handler.errorReply.status, 500);
        t.deepEqual(handler.errorReply.msg, 'Something went wrong');
      })
      .finally(() => t.end());
  });
});
