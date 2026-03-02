import mongoose, { Schema, type Document } from "mongoose";

export interface IUser extends Document {
  email: string;
  name: string;
  passwordHash: string;
  preferences: {
    categories: string[];
    budgetRange: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true },
    name: { type: String, required: true },
    passwordHash: { type: String, required: true },
    preferences: {
      categories: { type: [String], default: [] },
      budgetRange: { type: String, default: "medium" },
    },
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>("User", userSchema);
