import { FastifyInstance, FastifyReply, FastifyRequest, HookHandlerDoneFunction } from 'fastify';
import fp from 'fastify-plugin';

class Helpers {
  isAuthenticated(request: FastifyRequest, reply: FastifyReply, next: HookHandlerDoneFunction) {
    if (request.session.get('isAuthenticated') !== true) {
      reply.status(401).send({ msg: 'authentication ERROR' });
    }
    next();
  }
}

export default fp(
  async function (fastify: FastifyInstance) {
    fastify.decorate('helpers', new Helpers());
  },
  { name: 'helpers', dependencies: ['AppStatus'] },
);

declare module 'fastify' {
  interface FastifyInstance {
    helpers: Helpers;
  }
}
