import POST, { IPost } from '@src/db/models/post';
import { FastifyInstance, FastifyLoggerInstance } from 'fastify';

class GetPostHandler {
  params: RequestParams;
  log: FastifyLoggerInstance;
  post!: IPost;
  errorReply!: { status: number; msg: string };
  reply!: {
    status: number;
    data: PostData;
  };
  constructor(params: RequestParams, logger: FastifyLoggerInstance) {
    this.params = params;
    this.log = logger;
  }

  async isOk(): Promise<boolean> {
    try {
      await this.isPostExist();
      await this.isPostReady();
      return true;
    } catch (error) {
      return false;
    }
  }

  isPostExist(): Promise<void> {
    return new Promise(async (resolve, reject) => {
      try {
        const { slug } = this.params;
        const post = await POST.findOne({ slug });
        if (!post) {
          this.errorReply = {
            status: 404,
            msg: 'Not found',
          };
          reject();
        } else {
          this.post = post;
          resolve();
        }
      } catch (error) {
        this.log.error(error);
        this.errorReply = { status: 500, msg: 'Something went wrong' };
        reject();
      }
    });
  }

  isPostReady(): Promise<void> {
    return new Promise(async (resolve, reject) => {
      try {
        this.post = await this.post.populate('author').execPopulate();
        const data = this.post.toObject();
        this.reply = {
          status: 200,
          data: {
            id: data._id,
            title: data.title,
            content: data.content,
            comments: data.comments,
            author: {
              username: data.author.username,
              avatar: data.author.avatar,
            },
          },
        };
        resolve();
      } catch (error) {
        this.log.error(error);
        this.errorReply = { status: 500, msg: 'Something went wrong' };
        reject();
      }
    });
  }
}

export default async function (fastify: FastifyInstance): Promise<void> {
  fastify.get('/:slug', async function (request, reply) {
    const handler = new GetPostHandler(request.params as RequestParams, fastify.log);
    if (!(await handler.isOk())) {
      return reply.status(handler.errorReply.status).send({ msg: handler.errorReply.msg });
    } else {
      return reply.status(handler.reply.status).send({ data: handler.reply.data });
    }
  });
}

interface RequestParams {
  slug: string;
}

interface PostComments {
  votes: number;
  author: string;
  content: string;
  line: string;
  _id: string;
  comments: PostComments[];
}

interface PostData {
  id: string;
  title: string;
  content: string;
  comments: PostComments;
  author: { username: string; avatar: string };
}

export const testables = {
  GetPostHandler,
};
