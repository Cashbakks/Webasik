const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middlewares/auth');
const Quiz = require('../models/Quiz');
const Attempt = require('../models/Attempt');
const User = require('../models/User');

const QUIZ_TIME_LIMIT = 60; // 60 seconds time limit

// Start the quiz
router.get('/start', isAuthenticated, async (req, res) => {
    try {
        const attempts = await Attempt.find({ userId: req.session.user._id });

        if (attempts.length >= 50) {
            return res.render('pages/quiz', { 
                message: "You have reached the maximum number of attempts. Please check your result.",
                attemptsLeft: 0,
                resultMessage: "You cannot take the quiz anymore.",
                timeLimit: QUIZ_TIME_LIMIT
            });
        }

        const questions = await Quiz.aggregate([{ $sample: { size: 5 } }]);

        const newAttempt = new Attempt({
            userId: req.session.user._id,
            questions: questions.map(q => ({ questionId: q._id, answer: '' })),
            score: 0
        });

        await newAttempt.save();
        req.session.attemptId = newAttempt._id; 

        res.render('pages/quiz', { 
            questions, 
            attemptId: req.session.attemptId, 
            attemptsLeft: 50 - attempts.length,
            resultMessage: null,
            timeLimit: QUIZ_TIME_LIMIT
        });
    } catch (error) {
        console.error('Error fetching quiz questions:', error);
        res.status(500).send('Failed to load quiz.');
    }
});

// Submit quiz answers
router.post('/submit/:attemptId', isAuthenticated, async (req, res) => {
    try {
        const { attemptId } = req.params;
        const { answers } = req.body;

        if (!answers || !Array.isArray(answers) || answers.length === 0) {
            return res.status(400).json({ success: false, message: "No answers provided." });
        }

        const attempt = await Attempt.findById(attemptId).populate('questions.questionId');

        if (!attempt) {
            return res.status(404).json({ success: false, message: "Attempt not found." });
        }

        let score = 0;

        attempt.questions.forEach((question, index) => {
            const correctAnswer = question.questionId?.answers.find(a => a.isCorrect);
            if (!correctAnswer) return;
            question.answer = answers[index];
            if (answers[index] === correctAnswer.text) {
                score++;
            }
        });

        attempt.score = score;
        await attempt.save();

        const user = await User.findById(req.session.user._id);
        let discount = 0;
        if (score === 5) discount = 50;
        else if (score === 4) discount = 40;
        else if (score === 3) discount = 30;

        user.discountPercentage = Math.max(user.discountPercentage, discount);
        user.calculateDiscountedPrice();
        await user.save();

        res.json({ success: true, score, discount: user.discountPercentage });
    } catch (error) {
        console.error('Error submitting quiz:', error);
        res.status(500).json({ success: false, message: 'Failed to submit quiz.' });
    }
});



module.exports = router;
