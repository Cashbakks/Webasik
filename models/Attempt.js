const mongoose = require('mongoose');

const attemptSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    attemptDate: { type: Date, default: Date.now },
    score: { type: Number, required: true },
    questions: [
        {
            questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz' },  // Referencing the question
            answer: String  // Saving the answer chosen by the user
        }
    ]
});

const Attempt = mongoose.model('Attempt', attemptSchema);
module.exports = Attempt;
