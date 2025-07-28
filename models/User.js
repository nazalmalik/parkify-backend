import { Schema, model } from "mongoose";
import { genSalt, hash, compare } from "bcryptjs";

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    phoneNumber: {
      type: String,
      trim: true,
      default: "Not Provided",
      required: false,
    },
    vehicleNumber: {
      type: String,
      trim: true,
      default: "Not Provided",
      required: false,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      minlength: 6,
      required: false, // ✅ optional for Google users
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
  },
  { timestamps: true }
);

// Hash password only if provided
userSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) return next();
  const salt = await genSalt(10);
  this.password = await hash(this.password, salt);
  next();
});

// Compare hashed passwords safely
userSchema.methods.comparePassword = async function (password) {
  if (!this.password) return false;
  return compare(password, this.password);
};

const User = model("User", userSchema);
export default User;
