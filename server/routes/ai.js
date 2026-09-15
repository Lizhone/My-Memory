import express from 'express';
import pool from '../db.js';
import { answerQuestion } from '../services/ai.js';

const router = express.Router();

// Ask AI about memories
router.post('/ask', async (req, res) => {
  try {
    const { question } = req.body;

    if (!question || !question.trim()) {
      return res.status(400).json({ message: 'Question required' });
    }

    // Get relevant memories based on the question
    // For MVP, just return recent memories; can add vector search later
    const memoriesResult = await pool.query(
      `SELECT id, title, original_text, summary, category, created_at 
       FROM memories 
       WHERE user_id = $1 
       ORDER BY created_at DESC 
       LIMIT 20`,
      [req.user.id]
    );

    if (memoriesResult.rows.length === 0) {
      return res.json({
        answer: "I couldn't find any memories yet. Start by adding some memories!",
        sources: []
      });
    }

    // Get answer from AI
    const answer = await answerQuestion(question, memoriesResult.rows);

    res.json({
      answer,
      sources: memoriesResult.rows
    });
  } catch (err) {
    console.error('Ask AI error:', err);
    res.status(500).json({ message: 'Failed to process question' });
  }
});

export default router;
