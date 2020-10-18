import path from 'path';
import AutoLoad from 'fastify-autoload';
import fastify, { FastifyInstance, FastifyServerOptions } from 'fastify';
import fastifyFormbody from 'fastify-formbody';
import fastifyCompress from 'fastify-compress';
import fastifyEtag from 'fastify-etag';
import fastifyCookie from 'fastify-cookie';

export default function (): FastifyInstance {
  let opts: FastifyServerOptions;
  switch (process.env.NODE_ENV?.trim()) {
    case 'development':
      opts = options.development;
      break;
    case 'test':
      opts = options.test;
      break;
    case 'production':
      opts = options.production;
      break;
    default:
      process.exit(1);
  }
  const app = fastify(opts);
  app.log.info(`in ${process.env.NODE_ENV} mode`);
  app.register(fastifyFormbody);
  app.register(fastifyCompress, { global: true });
  app.register(fastifyEtag);
  app.register(fastifyCookie);
  app.register(AutoLoad, {
    dir: path.join(__dirname, 'plugins'),
    options: Object.assign({}, opts),
  });
  app.register(AutoLoad, {
    dir: path.join(__dirname, 'routes'),
    options: Object.assign({}, opts),
    ignorePattern: /.*(test|spec).ts/,
  });
  return app;
}

const options: { development: FastifyServerOptions; test: FastifyServerOptions; production: FastifyServerOptions } = {
  production: {
    logger: {
      prettyPrint: false,
    },
    trustProxy: '127.0.0.1',
  },
  development: {
    logger: {
      prettyPrint: true,
    },
  },
  test: {
    logger: {
      prettyPrint: true,
      // @ts-ignore
      file: path.join(__dirname, '../logs/test.log'),
    },
  },
};
