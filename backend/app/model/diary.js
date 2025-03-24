'use strict';

module.exports = app => {
  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;
  
  const DiarySchema = new Schema({
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    content: {
      type: String,
      required: true
    },
    mood: {
      type: String,
      enum: ['happy', 'peaceful', 'tired', 'sad'],
      required: true
    },
    date: {
      type: Date,
      default: Date.now
    },
    exp: {
      type: Number,
      default: 10 // 每写一篇日记获得10点经验值
    }
  }, {
    timestamps: true
  });
  
  return mongoose.model('Diary', DiarySchema);
}; 