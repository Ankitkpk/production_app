import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    fullName: {
      type: String,
      required: true
    },
    avatar: {
      type: String,
      default: '',
    },
    coverImage: {
      type: String,
      default: '',
    },
    password: {
      type: String,
      required: true,
    },
    refreshToken: {
      type: String,
      default: '',
    },
    watchHistory: [
      {
        videoId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Video',
        },
        watchedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Check if password is correct
userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// Generate Access Token
userSchema.methods.generateAccessToken = function () {
  return jwt.sign({ _id: this._id,email:this.email}, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: '1d',
  });
};

// Generate Refresh Token
userSchema.methods.generateRefreshToken = function () {
  return jwt.sign({ id: this._id }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: '7d',
  });
};

export const User = mongoose.model('User', userSchema);
