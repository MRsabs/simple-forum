import { FastifyInstance, FastifyPluginOptions } from 'fastify';

export default async function (fastify: FastifyInstance, _opts: FastifyPluginOptions): Promise<void> {
  fastify.get('/', async function (request, reply) {
    reply.send({ msg: 'hello' });
  });
}
