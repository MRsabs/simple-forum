import POST from '@src/db/models/post';
import { FastifyInstance } from 'fastify';

export default async function (fastify: FastifyInstance): Promise<void> {
  fastify.addHook('preHandler', (request, reply) => fastify.helpers.isAuthenticated(request, reply));
  fastify.delete('/', async (request, reply) => {
    try {
      const { slug } = request.body as RequestBody;
      const post = await POST.findOne({ slug });
      if (!post) {
        return reply.status(404).send({ msg: 'Not found' });
      }
      if (request.session.userId !== post.author) {
        return reply.status(401).send({ msg: 'Unauthorized' });
      }
      return reply.status(200).send({ msg: 'ok' });
    } catch (error) {
      return reply.status(500).send({ msg: 'Something went wrong' });
    }
  });
}

interface RequestBody {
  slug: string;
}
