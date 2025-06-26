import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    match: /^[A-Za-z0-9]+$/,
  },
  email: {
    type: String,
    required: true,
  },
  homepage: {
    type: String,
    default: '',
  },
  text: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
    default: null,
  },
  imagePath: {
    type: String
  },
  txtAttachment: {
    type: String
  }
}, {
  versionKey: false,
});

export default mongoose.model('Comment', commentSchema);
