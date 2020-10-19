import buildFastify from '@app';
import tap from 'tap';
const fastify = buildFastify();
tap.tearDown(async () => {
  await fastify.mongoClient.model('User').findOneAndDelete({ username: 'posttest' });
  fastify.redisClient.end(true);
  fastify.mongoClient.close();
});

let cookie = '';

tap.test('register and login a temp user', async (t) => {
  await fastify.ready();
  const register = await fastify
    .inject()
    .post('/auth/register')
    .body({ email: 'posttest@test.com', username: 'posttest', password: 'pass123', repeatPassword: 'pass123' })
    .end();
  t.deepEqual(register.statusCode, 200, register.body);
  t.deepEqual(JSON.parse(register.body), { msg: 'ok' }, register.body);
  const login = await fastify
    .inject()
    .post('/auth/login')
    .body({ email: 'posttest@test.com', password: 'pass123' })
    .end();
  t.deepEqual(login.statusCode, 200, login.body);
  // @ts-ignore
  cookie = login.cookies[0].value;
  t.deepEqual(JSON.parse(login.body), { msg: 'ok' }, login.body);
  t.end();
});

tap.test('add a post', async (t) => {
  await fastify.ready();

  t.test('adding invalid post', async (t) => {
    const addPost = await fastify.inject().post('/post').cookies({ sid: cookie }).body({}).end();
    t.deepEqual(addPost.statusCode, 400, addPost.body);
    t.deepEqual(JSON.parse(addPost.body), { msg: 'Invalid' }, addPost.body);
    t.end();
  });

  t.test('adding a post', async (t) => {
    const addPost = await fastify
      .inject()
      .post('/post')
      .cookies({ sid: cookie })
      .body({ title: 'post test title', content: 'post test content' })
      .end();
    t.deepEqual(addPost.statusCode, 200, addPost.body);
    t.deepEqual(JSON.parse(addPost.body), { msg: 'ok' }, addPost.body);
    t.end();
  });

  t.test('post already exist', async (t) => {
    const addPost = await fastify
      .inject()
      .post('/post')
      .cookies({ sid: cookie })
      .body({ title: 'post test title', content: 'post test content' })
      .end();
    t.deepEqual(addPost.statusCode, 409, addPost.body);
    t.deepEqual(JSON.parse(addPost.body), { msg: 'Post already exists' }, addPost.body);
    t.end();
  });

  t.end();
});

tap.test('add a post', async (t) => {
  await fastify.ready();
  const getPost = await fastify.inject().get('/post/post-test-title').end();
  t.deepEqual(getPost.statusCode, 200, getPost.body);
  const postId = JSON.parse(getPost.body).id;

  t.test('add comment', async (t) => {
    const addComment = await fastify
      .inject()
      .post('/post/thread/comment')
      .cookies({ sid: cookie })
      .body({ id: postId, content: 'a comment' })
      .end();
    t.deepEqual(addComment.statusCode, 200, addComment.body);
    t.end();
  });

  t.test('add reply', async (t) => {
    const addReply = await fastify
      .inject()
      .post('/post/thread/reply')
      .cookies({ sid: cookie })
      .body({ id: postId, line: '0', content: 'a reply' })
      .end();
    t.deepEqual(addReply.statusCode, 200, addReply.body);
    t.end();
  });
  t.end();
});

tap.end();
