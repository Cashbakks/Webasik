// models/Quiz.js

const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
    question: { type: String, required: true },
    answers: [{
        text: String,
        isCorrect: { type: Boolean, required: true }
    }],
}, { timestamps: true });

const Quiz = mongoose.model('Quiz', quizSchema); // This is where the model is created and saved

module.exports = Quiz;
