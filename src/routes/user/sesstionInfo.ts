import { FastifyInstance } from 'fastify';

export default async function (fastify: FastifyInstance): Promise<void> {
  fastify.get('/session-info', async (request, reply) => {
    try {
      const userId = request.session.get('userId');
      const user = await fastify.mongoClient.models.User.findOne({ _id: userId });
      if (!user) {
        return reply.status(404).send({ msg: 'Not found' });
      } else {
        const { _id, username, slug, avatar } = user.toJSON();
        return reply.status(200).send({ id: _id, username, slug, avatar });
      }
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ msg: 'Something went wrong' });
    }
  });
}
