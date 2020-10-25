import path from 'path';
import AutoLoad from 'fastify-autoload';
import fastify, { FastifyInstance, FastifyServerOptions } from 'fastify';
import fastifyFormbody from 'fastify-formbody';
import fastifyCompress from 'fastify-compress';
import fastifyEtag from 'fastify-etag';
import fastifyCookie from 'fastify-cookie';

export default function (): FastifyInstance {
  const opts = envConfig();
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

function envConfig(): FastifyServerOptions {
  let res: FastifyServerOptions;
  switch (process.env.NODE_ENV) {
    case 'development':
      res = options.development;
      break;
    case 'test':
      res = options.test;
      break;
    case 'production':
      res = options.production;
      break;
    default:
      res = options.development;
      break;
  }
  return res;
}

const options: { development: FastifyServerOptions; test: FastifyServerOptions; production: FastifyServerOptions } = {
  production: {
    logger: {
      prettyPrint: false,
      // @ts-ignore
      file: path.join(__dirname, '../production.log'),
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
      file: path.join(__dirname, '../test.log'),
    },
  },
};
