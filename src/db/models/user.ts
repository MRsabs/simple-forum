import { mongoClient } from '@src/plugins/mongoClient';
import { Document, Schema } from 'mongoose';
import { nanoid } from 'nanoid';

const UserSchema: Schema = new Schema({
  _id: {
    type: String,
    default: () => nanoid(),
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  avatar: {
    type: String,
    default: null,
  },
});

const USER = mongoClient.model<IUser>('User', UserSchema);

export default USER;

export interface IUser extends Document {
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
}
