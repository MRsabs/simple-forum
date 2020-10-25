// @ts-nocheck
import POST from '@src/db/models/post';
import { FastifyInstance } from 'fastify';

export default async function (fastify: FastifyInstance): Promise<void> {
  fastify.get('/', async function (request, reply) {
    try {
      const posts = await POST.find().limit(2).sort({ createdAt: -1 });
      for (let i = 0; i < posts.length; i++) {
        await posts[i].populate('author').execPopulate();
        posts[i] = posts[i].toObject();
        delete posts[i].__v;
        delete posts[i].author.__v;
        delete posts[i].author._id;
        delete posts[i].author.email;
        delete posts[i].author.password;
      }
      return reply.status(200).send(posts);
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ msg: 'Something went wrong' });
    }
  });
}
