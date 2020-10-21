import POST, { IPost } from '@src/db/models/post';
import USER, { IUser } from '@src/db/models/user';
import { FastifyInstance, FastifyLoggerInstance } from 'fastify';
import Joi from 'joi';

const commentValidition = Joi.object({
  id: Joi.string().max(30).required(),
  content: Joi.string().max(1000).required(),
});

class Commenthandler {
  private userId: string;
  private body: RequestBody;
  private log: FastifyLoggerInstance;
  private post!: IPost;
  errorReply!: { status: number; msg: string };
  constructor(body: RequestBody, userId: string, log: FastifyLoggerInstance) {
    this.body = body;
    this.log = log;
    this.userId = userId;
  }

  async isCommentValid(): Promise<boolean> {
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
    const post = await POST.findOne({ _id: this.body.id });
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
      const user = await USER.findOne({ _id: this.userId });
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
  async isCommentSaved(): Promise<boolean> {
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
  fastify.addHook('preHandler', (request, reply) => fastify.helpers.isAuthenticated(request, reply));
  fastify.post('/comment', async (request, reply) => {
    const handler = new Commenthandler(request.body as RequestBody, request.session.userId, fastify.log);
    if (!(await handler.isCommentValid())) {
      return reply.status(handler.errorReply.status).send({ msg: handler.errorReply.msg });
    }
    if (!(await handler.isPostExist())) {
      return reply.status(handler.errorReply.status).send({ msg: handler.errorReply.msg });
    }
    if (!(await handler.isCommentSaved())) {
      return reply.status(handler.errorReply.status).send({ msg: handler.errorReply.msg });
    }
    return reply.status(200).send({ msg: 'ok' });
  });
}

interface RequestBody {
  id: string;
  content: string;
}
