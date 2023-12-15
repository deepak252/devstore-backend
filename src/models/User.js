const mongoose = require("mongoose");
const { REGEX } = require("../config/constants");
const { comparePassword } = require("../utils/authUtil");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      // required: [true, "Name is required"],
      maxLength: [50, "Name should not contain more than 50 characters"],
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      required: [true, "Email is required"],
      match: [REGEX.EMAIL, "Invalid email"],
      unique: true,
    },
    password: {
      type: String,
      trim: true,
      required: [true, "Password is required"],
    },
    phone: {
      type: String,
      trim: true,
      // required: [true, "Phone number is required"],
      match: [REGEX.PHONE, "Invalid phone number"],
      unique: true,
      sparse: true //allows multiple documents to have a null or missing phone
    },
  },
  {
    timestamps: true
  }
);

userSchema.methods.comparePassword = async function(candidatePassword){
  return await comparePassword(candidatePassword, this.password);
}

module.exports = mongoose.model("User", userSchema);
