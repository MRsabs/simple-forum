import { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import { EventEmitter } from 'events';
import config from 'config';

class AppStatus {
  private mongoStatus: boolean;
  private redisStatus: boolean;
  private fastify: FastifyInstance;
  private status: EventEmitter;
  private shouldStart: boolean;
  constructor(fastify: FastifyInstance) {
    this.fastify = fastify;
    this.mongoStatus = false;
    this.redisStatus = false;
    this.shouldStart = false;
    this.status = new EventEmitter();
    this.onExit();
    this.listenToEvents();
  }

  public async start() {
    this.shouldStart = true;
    this.httpStart();
  }

  private httpStart() {
    if (this.mongoStatus && this.redisStatus) {
      this.startWebServer();
    } else {
      if (this.fastify.server.listening) {
        this.stopWebServer();
        this.fastify.log.error('something went wrong stopping webServer');
      } else {
        this.fastify.log.error("something is wrong can't start webServer");
      }
    }
  }

  isAppReady() {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        reject('something wrong with external services');
      }, 30000);
      this.status.on('external', () => {
        this.isExternalsReady() ? resolve() : undefined;
      });
    });
  }

  private isExternalsReady() {
    if (!this.isMongoClientReady() || !this.isRedisClientReady()) {
      return false;
    } else {
      return true;
    }
  }

  private checkExternals() {
    if (this.isExternalsReady()) {
      this.stopWebServer();
    } else {
      this.startWebServer();
    }
  }

  private async stopWebServer() {
    if (this.fastify.server.listening) {
      this.fastify.server.close(() => {
        this.fastify.log.info('http server stopped');
      });
    }
  }

  private startWebServer() {
    if (!this.fastify.server.listening && this.shouldStart) {
      const port = config.get('HTTP_PORT');
      this.fastify.server.listen(port, () => {
        this.fastify.log.info(`http server started on ${port}`);
      });
    }
  }

  private isMongoClientReady() {
    return this.mongoStatus;
  }

  private isRedisClientReady() {
    return this.redisStatus;
  }

  private onExit() {
    process.on('SIGINT', async () => {
      await this.fastify.mongoClient.close();
      this.fastify.log.info('Mongoose connection is closed due to application termination');
      this.fastify.redisClient.end(false);
      this.fastify.log.info('Redis connection is closed due to application termination');
      this.stopWebServer();
    });
  }

  private listenToEvents() {
    this.status.on('external', () => this.checkExternals());
  }

  public set setMongoStatus(v: boolean) {
    this.mongoStatus = v;
    this.status.emit('external');
  }

  public set setRedisStatus(v: boolean) {
    this.redisStatus = v;
    this.status.emit('external');
  }
}

declare module 'fastify' {
  interface FastifyInstance {
    AppStatus: AppStatus;
  }
}

export default fp(async function (fastify: FastifyInstance) {
  fastify.decorate('AppStatus', new AppStatus(fastify));
});
