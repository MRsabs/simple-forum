import { FastifyInstance } from 'fastify';

export default async function (fastify: FastifyInstance): Promise<void> {
  fastify.get<{ Querystring: { load?: number } }>('/', async function (request, reply) {
    try {
      const res: unknown[] = [];
      const load = request.query.load || 0;
      const posts = await fastify.mongoClientModels.Post.find()
        .skip(load * 4)
        .limit(4)
        .sort({ createdAt: -1 });
      for (let i = 0; i < posts.length; i++) {
        let post = posts[i];
        await post.populate('author').execPopulate();
        post = post.toJSON();
        delete post.__v;
        delete post._id;
        const obj = post;
        const { slug, username, avatar } = obj.author;
        res.push({ ...obj, author: { slug, username, avatar } });
      }
      return reply.status(200).send(res);
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ msg: 'Something went wrong' });
    }
  });
}
