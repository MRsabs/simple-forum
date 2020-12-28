// @ts-nocheck
import USER from '@src/db/models/user';
import { FastifyInstance } from 'fastify';

export default async function (fastify: FastifyInstance): Promise<void> {
  fastify.get('/session-info', async (request, reply) => {
    try {
      const { authenticated, userId } = request.session;
      if (!authenticated) {
        return reply.status(401).send({ msg: 'unauthenticated' });
      }
      const user = await USER.findOne({ _id: userId });
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
