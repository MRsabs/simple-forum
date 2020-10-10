import path from 'path';
import AutoLoad from 'fastify-autoload';
import fastify, { FastifyInstance, FastifyServerOptions } from 'fastify';
import fastifyFormbody from 'fastify-formbody';
import fastifyCompress from 'fastify-compress';
import fastifyEtag from 'fastify-etag';
import fastifyCookie from 'fastify-cookie';
console.log(process.env.NODE_ENV);

export default function (opts: FastifyServerOptions): FastifyInstance {
  const app = fastify(opts);
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
