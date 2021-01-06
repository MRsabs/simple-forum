import { getUnixTime } from 'date-fns';
import { Document, Schema } from 'mongoose';
import { nanoid } from 'nanoid';

export const UserSchema: Schema = new Schema({
  _id: {
    type: String,
    default: () => nanoid(),
  },
  createdAt: {
    type: Number,
    default: () => getUnixTime(new Date()),
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
  slug: {
    type: String,
    required: true,
  },
});

// const USER = mongoClient.model<IUser>('User', UserSchema);

export interface IUser extends Document {
  email: string;
  username: string;
  password: string;
  avatar: string;
  slug: string;
  createdAt: number;
}
