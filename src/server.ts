import app from './app';

const fastify = app({
  logger: {
    prettyPrint: true,
  },
});

fastify.ready((err) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  fastify.AppStatus.start();
});
