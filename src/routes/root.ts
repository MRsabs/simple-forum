import { FastifyInstance } from 'fastify';

export default async function (fastify: FastifyInstance): Promise<void> {
  fastify.get('/', async function (request, reply) {
    reply.send({ msg: 'hello' });
  });
}
