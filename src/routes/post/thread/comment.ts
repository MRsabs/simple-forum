import { IReply } from '@src/db/models/comment';
import { IPost } from '@src/db/models/post';
import { IUser } from '@src/db/models/user';
import { FastifyInstance, FastifyLoggerInstance } from 'fastify';
import Joi from 'joi';

const commentValidition = Joi.object({
  slug: Joi.string().max(30).required(),
  line: Joi.string().required(),
  content: Joi.string().max(1000).required(),
});

class Commenthandler {
  fastify: FastifyInstance;
  private userId: string;
  private body: RequestBody;
  private log: FastifyLoggerInstance;
  private post!: IPost;
  errorReply!: { status: number; msg: string };
  constructor(fastify: FastifyInstance, body: RequestBody, userId: string) {
    this.fastify = fastify;
    this.body = body;
    this.log = fastify.log;
    this.userId = userId;
  }

  async isReplyValid(): Promise<boolean> {
    try {
      this.body = await commentValidition.validateAsync(this.body);
      return true;
    } catch (error) {
      this.log.error(error);
      this.errorReply = { status: 400, msg: 'Invalid' };
      return false;
    }
  }

  async isPostExist(): Promise<boolean> {
    const post = await this.fastify.mongoClientModels.Post.findOne({ slug: this.body.slug });
    if (!post) {
      this.errorReply = {
        msg: 'Not found',
        status: 404,
      };
      return false;
    } else {
      this.post = post;
      return true;
    }
  }
  private async getCommenterData(): Promise<false | IUser> {
    try {
      const user = await this.fastify.mongoClientModels.User.findOne({ _id: this.userId });
      if (user) {
        return user;
      } else {
        // this.log.error("commenter has no account");
        this.errorReply = { status: 500, msg: 'Something went wrong' };
        return false;
      }
    } catch (error) {
      this.log.error(error);
      this.errorReply = { status: 500, msg: 'Something went wrong' };
      return false;
    }
  }

  async isCommentOrReplySaved() {
    return this.body.line === '-1' ? await this.isCommentSaved() : await this.isReplySaved();
  }

  private parseLines(line: string): false | IReply {
    const parsedLine = line.split('');
    let target: IReply;
    parsedLine.forEach((v, i) => {
      const number = parseInt(v);
      if (i === 0) {
        target = this.post.comments[number];
      } else {
        target = target.comments[number];
      }
    });
    // @ts-ignore
    if (target) {
      return target;
    } else {
      return false;
    }
  }
  private async isReplySaved(): Promise<boolean> {
    try {
      // TODO fix
      const commenter = await this.getCommenterData();
      const target = this.parseLines(this.body.line);
      if (target && commenter) {
        const linee = '' + target.line + target.comments.length;
        target.comments.push({ author: commenter.username, content: this.body.content, line: linee });
        await this.post.save();
        return true;
      } else {
        this.errorReply = { status: 500, msg: 'Something went wrong' };
        return false;
      }
    } catch (error) {
      this.log.error(error);
      this.errorReply = { status: 500, msg: 'Something went wrong' };
      return false;
    }
  }
  private async isCommentSaved(): Promise<boolean> {
    try {
      const line = '' + this.post.comments.length;
      const commenter = await this.getCommenterData();
      if (commenter) {
        this.post.comments.push({ author: commenter.username, content: this.body.content, line });
        await this.post.save();
        return true;
      } else {
        return false;
      }
    } catch (error) {
      this.log.error(error);
      this.errorReply = { status: 500, msg: 'Something went wrong' };
      return false;
    }
  }
}

export default async function (fastify: FastifyInstance): Promise<void> {
  fastify.addHook('onRequest', (request, reply, next) => fastify.helpers.isAuthenticated(request, reply, next));
  fastify.post('/', async (request, reply) => {
    const handler = new Commenthandler(fastify, request.body as RequestBody, request.session.get('userId'));
    if (!(await handler.isReplyValid())) {
      return reply.status(handler.errorReply.status).send({ msg: handler.errorReply.msg });
    }
    if (!(await handler.isPostExist())) {
      return reply.status(handler.errorReply.status).send({ msg: handler.errorReply.msg });
    }
    if (!(await handler.isCommentOrReplySaved())) {
      return reply.status(handler.errorReply.status).send({ msg: handler.errorReply.msg });
    }
    return reply.status(200).send({ msg: 'ok' });
  });
}

interface RequestBody {
  slug: string;
  line: string;
  content: string;
}
