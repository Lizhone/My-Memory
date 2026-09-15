import express from 'express';
import pool from '../db.js';
import { extractMemoryInfo } from '../services/ai.js';

const router = express.Router();

// Get all memories
router.get('/', async (req, res) => {
  try {
    const limit = req.query.limit || 50;
    const result = await pool.query(
      'SELECT * FROM memories WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2',
      [req.user.id, limit]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Get memories error:', err);
    res.status(500).json({ message: 'Failed to fetch memories' });
  }
});

// Get single memory
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM memories WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Memory not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Get memory error:', err);
    res.status(500).json({ message: 'Failed to fetch memory' });
  }
});

// Create memory
router.post('/', async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ message: 'Memory text required' });
    }

    // Extract information using AI
    const extracted = await extractMemoryInfo(text);

    // Save to database
    const result = await pool.query(
      `INSERT INTO memories (user_id, original_text, title, summary, category, tags, extracted_data)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        req.user.id,
        text,
        extracted.title,
        extracted.summary,
        extracted.category,
        JSON.stringify(extracted.tags),
        JSON.stringify(extracted)
      ]
    );

    res.status(201).json({
      id: result.rows[0].id,
      extracted
    });
  } catch (err) {
    console.error('Create memory error:', err);
    res.status(500).json({ message: 'Failed to save memory' });
  }
});

// Update memory
router.put('/:id', async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ message: 'Memory text required' });
    }

    // Extract information using AI
    const extracted = await extractMemoryInfo(text);

    // Update database
    const result = await pool.query(
      `UPDATE memories 
       SET original_text = $1, title = $2, summary = $3, category = $4, tags = $5, extracted_data = $6, updated_at = CURRENT_TIMESTAMP
       WHERE id = $7 AND user_id = $8
       RETURNING *`,
      [
        text,
        extracted.title,
        extracted.summary,
        extracted.category,
        JSON.stringify(extracted.tags),
        JSON.stringify(extracted),
        req.params.id,
        req.user.id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Memory not found' });
    }

    res.json({
      id: result.rows[0].id,
      extracted
    });
  } catch (err) {
    console.error('Update memory error:', err);
    res.status(500).json({ message: 'Failed to update memory' });
  }
});

// Delete memory
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM memories WHERE id = $1 AND user_id = $2 RETURNING id',
      [req.params.id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Memory not found' });
    }

    res.json({ message: 'Memory deleted' });
  } catch (err) {
    console.error('Delete memory error:', err);
    res.status(500).json({ message: 'Failed to delete memory' });
  }
});

export default router;
