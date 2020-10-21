import { IReply } from '@src/db/models/comment';
import POST, { IPost } from '@src/db/models/post';
import USER, { IUser } from '@src/db/models/user';
import { FastifyInstance, FastifyLoggerInstance } from 'fastify';
import Joi from 'joi';

const commentValidition = Joi.object({
  id: Joi.string().max(30).required(),
  line: Joi.string().required(),
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
  async isReplySaved(): Promise<boolean> {
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
}

export default async function (fastify: FastifyInstance): Promise<void> {
  fastify.addHook('preHandler', (request, reply) => fastify.helpers.isAuthenticated(request, reply));
  fastify.post('/reply', async (request, reply) => {
    const handler = new Commenthandler(request.body as RequestBody, request.session.userId, fastify.log);
    if (!(await handler.isReplyValid())) {
      reply.status(handler.errorReply.status).send({ msg: handler.errorReply.msg });
    }
    if (!(await handler.isPostExist())) {
      reply.status(handler.errorReply.status).send({ msg: handler.errorReply.msg });
    }
    if (!(await handler.isReplySaved())) {
      reply.status(handler.errorReply.status).send({ msg: handler.errorReply.msg });
    }
    reply.status(200).send({ msg: 'ok' });
  });
}

interface RequestBody {
  id: string;
  line: string;
  content: string;
}
