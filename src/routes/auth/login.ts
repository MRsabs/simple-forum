import { IUser } from '@src/db/models/user';
import { FastifyInstance, FastifyLoggerInstance } from 'fastify';
import Joi from 'joi';
import bcrypt from 'bcrypt';

const userLoginSchema = Joi.object({
  email: Joi.string().trim().email().required(),
  password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,16}$')).required(),
});

class LoginHandler {
  private body: RequestBody;
  private log: FastifyLoggerInstance;
  dbUser!: IUser | null;
  userId!: string;
  errorReply: { status: number; msg: string };
  fastify: FastifyInstance;
  constructor(fastify: FastifyInstance, body: RequestBody) {
    this.fastify = fastify;
    this.log = fastify.log;
    this.body = body;
    this.errorReply = {
      status: 401,
      msg: 'Email or Password is incorrect',
    };
  }

  async isOk(): Promise<boolean> {
    try {
      if (!this.isInputValid()) {
        throw new Error();
      }
      if (!(await this.isUserExist())) {
        throw new Error();
      }
      if (!(await this.isUserPasswordValid())) {
        throw new Error();
      }
      return true;
    } catch {
      return false;
    }
  }

  isInputValid(): boolean {
    const validition = userLoginSchema.validate(this.body);
    if (validition.error) {
      this.errorReply = {
        msg: 'Invalid',
        status: 400,
      };
      return false;
    } else {
      this.body = validition.value;
      return true;
    }
  }

  async isUserExist(): Promise<boolean> {
    try {
      this.dbUser = await this.fastify.mongoClientModels.User.findOne({ email: this.body.email });
      if (this.dbUser) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      this.log.error(error);
      this.errorReply = {
        msg: 'Something went wrong',
        status: 500,
      };
      throw new Error();
    }
  }

  async isUserPasswordValid(): Promise<boolean> {
    try {
      if (await bcrypt.compare(this.body.password, (this.dbUser as IUser).password)) {
        this.userId = (this.dbUser as IUser)._id;
        return true;
      } else {
        return false;
      }
    } catch (error) {
      this.log.error(error);
      this.errorReply = {
        msg: 'Something went wrong',
        status: 500,
      };
      throw new Error();
    }
  }
}

export default async function (fastify: FastifyInstance): Promise<void> {
  fastify.post('/login', async function (request, reply) {
    const handler = new LoginHandler(fastify, request.body as RequestBody);
    if (!(await handler.isOk())) {
      return reply.status(handler.errorReply.status).send({ msg: handler.errorReply.msg });
    }
    request.session.set('userId', handler.userId);
    request.session.set('isAuthenticated', true);
    const { username, avatar, _id, slug } = (handler.dbUser as IUser).toObject();
    return reply.status(200).send({
      username,
      avatar,
      id: _id,
      slug,
    });
  });
}

interface RequestBody {
  email: string;
  password: string;
}

// for testing
export const testable = {
  LoginHandler,
};
