import { Schema, model } from 'mongoose';
import bcryptjs from 'bcryptjs';
import { REGEX, INVALID_USERNAMES } from '../constants.js';
import {
  comparePassword,
  generateAccessToken,
  generateRefreshToken
} from '../utils/authUtil.js';
import { ApiError } from '../utils/ApiError.js';
import { remoteFileSchema } from './schemas.js';

const userSchema = new Schema(
  {
    username: {
      type: String,
      index: true,
      unique: true,
      trim: true,
      lowercase: true,
      required: [true, 'Username is required'],
      minLength: [4, 'Username must contain at least 4 characters'],
      maxLength: [20, 'Username should not contain more than 20 characters'],
      match: [
        REGEX.ALPHANUMERIC,
        'Username should contain only letters and numbers'
      ],
      validate: {
        validator: function (value) {
          return !INVALID_USERNAMES.includes(value.toLowerCase());
        },
        message: 'Invalid username'
      }
    },
    fullName: {
      type: String,
      trim: true,
      // required: [true, "Name is required"],
      maxLength: [30, 'Name should not contain more than 30 characters']
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      required: [true, 'Email is required'],
      match: [REGEX.EMAIL, 'Invalid email'],
      unique: true
    },
    password: {
      type: String,
      trim: true,
      required: [true, 'Password is required']
    },
    phone: {
      type: String,
      trim: true,
      // required: [true, "Phone number is required"],
      match: [REGEX.PHONE, 'Invalid phone number'],
      unique: true,
      sparse: true //allows multiple documents to have a null or missing phone
    },
    headline: {
      type: String,
      trim: true,
      maxLength: [200, 'Headline should not contain more than 200 characters']
    },
    bio: {
      type: String,
      maxLength: [1000, 'Headline should not contain more than 1000 characters']
    },
    avatar: {
      type: remoteFileSchema
    },
    githubUrl: {
      type: String,
      trim: true,
      match: [REGEX.URL, 'Invalid Github URL']
    },
    linkedinUrl: {
      type: String,
      trim: true,
      match: [REGEX.URL, 'Invalid Linkedin URL']
    },
    twitterUrl: {
      type: String,
      trim: true,
      match: [REGEX.URL, 'Invalid Twitter URL']
    },
    // favoriteApps: [
    //   {
    //     type: Schema.Types.ObjectId,
    //     ref: 'App'
    //   }
    // ],
    // favoriteWebsites: [
    //   {
    //     type: Schema.Types.ObjectId,
    //     ref: 'Website'
    //   }
    // ],
    // favoriteGames: [
    //   {
    //     type: Schema.Types.ObjectId,
    //     ref: 'Game'
    //   }
    // ],
    // followers: [
    //   {
    //     type: Schema.Types.ObjectId,
    //     ref: 'User'
    //   }
    // ],
    // following: [
    //   {
    //     type: Schema.Types.ObjectId,
    //     ref: 'User'
    //   }
    // ],
    refreshToken: {
      type: String
    }
  },
  {
    timestamps: true,
    statics: {
      findByUsername(username) {
        return this.findOne({ username });
      },
      findByEmail(email) {
        return this.findOne({ email });
      },
      findByUsernameOrEmail(usernameOrEmail) {
        return this.findOne({
          $or: [{ email: usernameOrEmail }, { username: usernameOrEmail }]
        });
        // if (REGEX.EMAIL.test(usernameOrEmail)) {
        //   return this.findByEmail(usernameOrEmail.toLowerCase().trim());
        // }
        // return this.findByUsername(usernameOrEmail);
      }
    }
  }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  if (this.password.length < 4) {
    throw new ApiError('Password must contain at least 4 characters');
  }
  this.password = await bcryptjs.hash(this.password, 10);
  next();
});

userSchema.methods.isPasswordCorrect = async function (candidatePassword) {
  return await comparePassword(candidatePassword, this.password);
};

userSchema.methods.getAccessToken = function () {
  return generateAccessToken({
    _id: this._id,
    email: this.email,
    username: this.username,
    fullName: this.fullName
  });
};

userSchema.methods.getRefreshToken = function () {
  return generateRefreshToken({
    _id: this._id
  });
};

export default model('User', userSchema);
