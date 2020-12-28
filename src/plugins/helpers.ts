import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import fp from 'fastify-plugin';

class Helpers {
  async isAuthenticated(request: FastifyRequest, reply: FastifyReply) {
    if (!request.session.authenticated) {
      reply.status(401).send({ msg: 'unauthenticated' });
      return;
    } else {
      return;
    }
  }
}

export default fp(
  async function (fastify: FastifyInstance) {
    fastify.decorate('helpers', new Helpers());
  },
  { name: 'helpers' },
);

declare module 'fastify' {
  interface FastifyInstance {
    helpers: Helpers;
  }
}
