import app from './app';

const fastify = app();

const start = async () => {
  try {
    await fastify.ready();
    fastify.AppStatus.start();
  } catch (error) {
    fastify.log.error(error);
    process.exit(1);
  }
};
start();
