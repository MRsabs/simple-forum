import { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import { EventEmitter } from 'events';
import config from 'config';

class AppStatus {
  private fastify: FastifyInstance;
  private status: EventEmitter;
  private shouldStart: boolean;
  constructor(fastify: FastifyInstance) {
    this.fastify = fastify;
    this.shouldStart = false;
    this.status = new EventEmitter();
    this.onExit();
    this.listenToEvents();
  }

  public start() {
    this.shouldStart = true;
    this.httpStart();
  }

  private httpStart() {
    if (this.isExternalsReady()) {
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

  private stopWebServer() {
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

  private isExternalsReady() {
    if (this.isMongoClientReady() /*  || !this.isRedisClientReady() */) {
      return true;
    } else {
      return false;
    }
  }

  private checkExternals() {
    if (this.isExternalsReady()) {
      this.stopWebServer();
    } else {
      this.startWebServer();
    }
  }

  private isMongoClientReady() {
    if (this.fastify.mongoClient.readyState === 1) {
      return true;
    } else {
      return false;
    }
  }

  private onExit() {
    process.on('SIGINT', async () => {
      await this.fastify.mongoClient.close();
      this.fastify.log.info('Mongoose connection is closed due to application termination');
      this.stopWebServer();
    });
  }

  private listenToEvents() {
    this.status.on('external', () => this.checkExternals());
  }

  public fireEvent(event: string | symbol, value?: unknown) {
    this.status.emit(event, value);
  }
}

declare module 'fastify' {
  interface FastifyInstance {
    AppStatus: AppStatus;
  }
}

export default fp(
  async function (fastify: FastifyInstance) {
    fastify.decorate('AppStatus', new AppStatus(fastify));
  },
  { name: 'AppStatus' },
);
