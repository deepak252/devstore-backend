import mongoose from 'mongoose';
import { REGEX, INVALID_USERNAMES } from '../config/constants.js';
import { comparePassword } from '../utils/authUtil.js';

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      trim: true,
      unique: true,
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
    name: {
      type: String,
      trim: true,
      // required: [true, "Name is required"],
      maxLength: [30, 'Name should not contain more than 30 characters']
    },
    headline: {
      type: String,
      trim: true,
      maxLength: [200, 'Headline should not contain more than 200 characters']
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
    avatarUrl: {
      type: String,
      trim: true,
      match: [REGEX.URL, 'Invalid avatar URL']
    },
    bio: {
      type: String,
      maxLength: [1000, 'Headline should not contain more than 1000 characters']
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
    apps: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'App'
      }
    ],
    websites: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Website'
      }
    ],
    games: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Game'
      }
    ],
    favoriteApps: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'App'
      }
    ],
    favoriteWebsites: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Website'
      }
    ],
    favoriteGames: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Game'
      }
    ],
    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    following: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ]
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
        if (REGEX.EMAIL.test(usernameOrEmail)) {
          return this.findByEmail(usernameOrEmail.toLowerCase().trim());
        }
        return this.findByUsername(usernameOrEmail);
      }
    }
  }
);

userSchema.methods.comparePassword = async function (candidatePassword) {
  return await comparePassword(candidatePassword, this.password);
};

export default mongoose.model('User', userSchema);
