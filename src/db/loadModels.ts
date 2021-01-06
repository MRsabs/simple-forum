import { Connection, Model } from 'mongoose';
import { UserSchema, IUser } from './models/user';
import { PostSchema, IPost } from './models/post';

const load = (mongoClient: Connection): void => {
  mongoClient.model<IUser>('User', UserSchema);
  mongoClient.model<IPost>('Post', PostSchema);
};

declare module 'mongoose' {
  interface Connection {
    models: IDbModels;
  }
}

export type IDbModels = {
  User: Model<IUser>;
  Post: Model<IPost>;
};

export default load;
