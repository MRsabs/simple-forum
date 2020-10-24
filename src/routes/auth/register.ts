import USER from '@src/db/models/user';
import { FastifyInstance, FastifyLoggerInstance } from 'fastify';
import Joi from 'joi';
import bcrypt from 'bcrypt';

const userRegistrationSchema = Joi.object({
  email: Joi.string().trim().email().required(),
  username: Joi.string().trim().alphanum().min(3).max(18).required(),
  password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,16}$')).required(),
  repeatPassword: Joi.ref('password'),
});

class RegisterHandler {
  private body: RequestBody;
  private log: FastifyLoggerInstance;
  errorReply!: { status: number; msg: string };
  constructor(body: RequestBody, log: FastifyLoggerInstance) {
    this.body = body;
    this.log = log;
  }
  async isOk(): Promise<boolean> {
    try {
      await this.isInputValid();
      if (await this.isUserExist()) {
        throw new Error('User already exists');
      }
      await this.isUserSaved();
      return true;
    } catch (error) {
      this.log.error(error);
      return false;
    }
  }

  async isInputValid(): Promise<void> {
    try {
      this.body = await userRegistrationSchema.validateAsync(this.body);
    } catch (error) {
      this.errorReply = {
        status: 400,
        msg: 'Invalid',
      };
      throw new Error(error);
    }
  }

  async isUserExist(): Promise<boolean> {
    try {
      const user = await USER.findOne({ email: this.body.email });
      if (user) {
        this.errorReply = {
          status: 409,
          msg: 'User already exists',
        };
        return true;
      } else {
        return false;
      }
    } catch (error) {
      this.errorReply = {
        status: 500,
        msg: 'Something went wrong',
      };
      throw new Error(error);
    }
  }

  async isUserSaved(): Promise<void> {
    try {
      this.body.password = await bcrypt.hash(this.body.password, 10);
      const { email, username, password } = this.body;
      const slug = username.replace(/ /g, '-');
      const user = new USER({ email, username, password, slug });
      await user.save();
    } catch (error) {
      this.log.error(error);
      this.errorReply = {
        status: 500,
        msg: 'Something went wrong',
      };
      throw new Error(error);
    }
  }
}

export default async function (fastify: FastifyInstance): Promise<void> {
  fastify.post('/register', async function (request, reply) {
    const handler = new RegisterHandler(request.body as RequestBody, fastify.log);
    if (!(await handler.isOk())) {
      return reply.status(handler.errorReply.status).send({ msg: handler.errorReply.msg });
    }
    return reply.status(200).send({ msg: 'ok' });
  });
}

interface RequestBody {
  email: string;
  username: string;
  password: string;
  repeatPassword: string;
}

// for testing
export { RegisterHandler };
