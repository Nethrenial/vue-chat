import mongoose from "mongoose";
const { model, Schema } = mongoose;
import { genSalt, hash } from "bcrypt";

interface IUser {
  username: string;
  email: string;
  password: string;
  avatar?: string;
}

const UserSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    avatar: {
      type: String,
      required: false,
    },
  },
  { optimisticConcurrency: true, timestamps: true }
);

//hash password before saving
UserSchema.pre("save", async function (next) {
  const salt = await genSalt();
  const hashedPassword = await hash(this.password, salt);
  this.password = hashedPassword;
  next();
});

const User = model<IUser>("User", UserSchema);

export default User;
