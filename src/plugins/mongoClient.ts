import mongoose from 'mongoose';
import config from 'config';
import { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import load, { IDbModels } from '@src/db/loadModels';

class MongoClient {
  fastify: FastifyInstance;
  mongoClient!: mongoose.Connection;
  dbURL: string;
  constructor(fastify: FastifyInstance) {
    this.fastify = fastify;
    this.dbURL = config.get('MONGO_URL') as string;
  }

  public async init() {
    try {
      const c = await this.connect();
      this.fastify.log.info(`Mongoose connection is open to ${this.dbURL}`);
      this.loadModels();
      this.fastify.log.info(`Mongoose has loaded all models`);
      this.listenToEvents();
      return c;
    } catch (error) {
      this.fastify.log.warn(`Mongoose fail to connect`);
    }
  }

  public ConnectionModels() {
    return this.mongoClient.models;
  }

  private async connect() {
    this.mongoClient = await mongoose.createConnection(this.dbURL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      bufferCommands: process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'develpment' ? true : false,
    });
    return this.mongoClient;
  }

  private loadModels() {
    load(this.mongoClient);
  }

  private listenToEvents() {
    this.mongoClient.on('connected', () => this.mongoConnnected());
    this.mongoClient.on('error', (err) => this.fastify.log.error(`Mongoose connection has occured ${err} error`));
    this.mongoClient.on('disconnected', () => this.mongoDisconnected());
  }

  private mongoConnnected() {
    this.fastify.log.info(`Mongoose connection is open to ${this.dbURL}`);
    this.fastify.AppStatus.fireEvent('external');
  }

  private mongoDisconnected() {
    this.fastify.log.warn(`Mongoose connection is disconnected`);
    this.fastify.AppStatus.fireEvent('external');
  }
}

export default fp(
  async function (fastify: FastifyInstance) {
    const mc = new MongoClient(fastify);
    fastify.decorate('mongoClient', await mc.init());
    fastify.decorate('mongoClientModels', mc.ConnectionModels());
  },
  { name: 'mongoClient', dependencies: ['AppStatus'] },
);

declare module 'fastify' {
  interface FastifyInstance {
    mongoClient: mongoose.Connection;
    mongoClientModels: IDbModels;
  }
}
