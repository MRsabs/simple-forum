import { FastifyInstance } from 'fastify';

export default async function (fastify: FastifyInstance): Promise<void> {
  fastify.get('/:slug', async (request, reply) => {
    try {
      const { slug } = request.params as RequestBody;
      const user = await fastify.mongoClient.models.User.findOne({ slug });
      if (!user) {
        return reply.status(404).send({ msg: 'Not found' });
      } else {
        const userData = user.toJSON();
        delete userData.__v;
        delete userData.password;
        return reply.status(200).send(userData);
      }
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ msg: 'Something went wrong' });
    }
  });
}

interface RequestBody {
  slug: string;
}
