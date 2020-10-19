import POST from '@src/db/models/post';
import { FastifyInstance, FastifyLoggerInstance } from 'fastify';
import Joi from 'joi';

const postValidition = Joi.object({
  title: Joi.string().max(30).required(),
  content: Joi.string().max(1000).required(),
});

class NewPostHandler {
  private userId: string;
  private body: RequestBody;
  private log: FastifyLoggerInstance;
  errorReply!: { status: number; msg: string };
  constructor(body: RequestBody, userId: string, log: FastifyLoggerInstance) {
    this.body = body;
    this.log = log;
    this.userId = userId;
  }

  async isOk(): Promise<boolean> {
    try {
      await this.isPostValid();
      await this.isPostExist();
      await this.isPostSaved();
      return true;
    } catch (error) {
      return false;
    }
  }

  isPostValid(): Promise<void> {
    return new Promise((resolve, reject) => {
      const isValid = postValidition.validate(this.body);
      if (isValid.error) {
        this.errorReply = { status: 400, msg: 'Invalid' };
        reject();
      } else {
        this.body = isValid.value;
        resolve();
      }
    });
  }

  isPostExist(): Promise<void> {
    return new Promise((resolve, reject) => {
      const slug = this.body.title.replace(/ /g, '-');
      POST.findOne({ slug })
        .then((post) => {
          if (post) {
            this.errorReply = { status: 409, msg: 'Post already exists' };
            reject('Post already exists');
          } else {
            resolve();
          }
        })
        .catch((error) => {
          this.log.error(error);
          this.errorReply = { status: 500, msg: 'Something went wrong' };
          reject();
        });
    });
  }

  isPostSaved(): Promise<void> {
    return new Promise((resolve, reject) => {
      const slug = this.body.title.replace(/ /g, '-');
      const post = new POST({ ...this.body, author: this.userId, slug });
      post
        .save()
        .then(() => resolve())
        .catch((error) => {
          this.log.error(error);
          this.errorReply = { status: 500, msg: 'Something went wrong' };
          reject();
        });
    });
  }
}

export default async function (fastify: FastifyInstance): Promise<void> {
  fastify.addHook('preHandler', (request, reply) => fastify.helpers.isAuthenticated(request, reply));
  fastify.post('/', async function (request, reply) {
    const handler = new NewPostHandler(request.body as RequestBody, request.session.userId, fastify.log);
    if (!(await handler.isOk())) {
      return reply.status(handler.errorReply.status).send({ msg: handler.errorReply.msg });
    }
    return reply.status(200).send({ msg: 'ok' });
  });
}

interface RequestBody {
  title: string;
  content: string;
}

export const testables = {
  NewPostHandler,
};
