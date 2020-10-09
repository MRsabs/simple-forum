import { Schema, Types } from 'mongoose';
import { nanoid } from 'nanoid';

const CommentSchema = new Schema({
	_id: {
		type: String,
		default: () => nanoid(),
	},
	author: {
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
	line: {
		type: String,
	},
});

CommentSchema.add({
	comments: [CommentSchema],
});
export default CommentSchema;

export interface IReply extends Types.Embedded {
	author: string;
	content: string;
	votes?: number;
	line: string;
	comments: Types.DocumentArray<IReply>;
}
