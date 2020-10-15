import { mongoClient } from '@src/plugins/mongoClient';
import { Document, Schema, Types } from 'mongoose';
import { nanoid } from 'nanoid';
import CommentSchema, { IReply } from './comment';

const PostSchema: Schema = new Schema({
  _id: {
    type: String,
    default: () => nanoid(),
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
  media: [String],
});

const POST = mongoClient.model<IPost>('Post', PostSchema);

export default POST;

export interface IPost extends Document {
  author: string;
  content: string;
  votes?: number;
  comments: Types.DocumentArray<IReply>;
}
