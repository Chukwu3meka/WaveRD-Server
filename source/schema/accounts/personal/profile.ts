import { Schema } from "mongoose";

const ProfileSchema = new Schema({
  handle: { type: String, required: true },
  fullName: { type: String, required: true },
  email: { type: String, unique: true, required: false },
  stat: {
    joined: { type: Date, default: Date.now },
  },
});

export default ProfileSchema;
