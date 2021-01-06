import { Document, Schema, Types } from 'mongoose';
import { nanoid } from 'nanoid';
import { getUnixTime } from 'date-fns';
import CommentSchema, { IReply } from './comment';

export const PostSchema: Schema = new Schema({
  _id: {
    type: String,
    default: () => nanoid(),
  },
  createdAt: {
    type: Number,
    default: () => getUnixTime(new Date()),
  },
  author: { type: String, ref: 'User' },
  title: {
    type: String,
    required: true,
  },
  slug: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  votes: {
    type: Number,
    default: 0,
  },
  comments: [CommentSchema],
  media: {
    type: [String],
    default: [],
  },
});

// const POST = mongoClient.model<IPost>('Post', PostSchema);

export interface IPost extends Document {
  author: string;
  content: string;
  votes: number;
  createdAt: number;
  comments: Types.DocumentArray<IReply>;
}
