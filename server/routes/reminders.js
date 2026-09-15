import express from 'express';
import pool from '../db.js';

const router = express.Router();

// Get all reminders
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT r.*, m.title as memory_title, m.original_text
       FROM reminders r
       LEFT JOIN memories m ON r.memory_id = m.id
       WHERE r.user_id = $1
       ORDER BY r.reminder_date ASC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Get reminders error:', err);
    res.status(500).json({ message: 'Failed to fetch reminders' });
  }
});

// Create reminder
router.post('/', async (req, res) => {
  try {
    const { title, description, reminder_date, memory_id } = req.body;

    if (!title || !reminder_date) {
      return res.status(400).json({ message: 'Title and date required' });
    }

    const result = await pool.query(
      `INSERT INTO reminders (user_id, memory_id, title, description, reminder_date)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [req.user.id, memory_id || null, title, description || null, reminder_date]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Create reminder error:', err);
    res.status(500).json({ message: 'Failed to create reminder' });
  }
});

// Update reminder
router.put('/:id', async (req, res) => {
  try {
    const { title, description, reminder_date, completed } = req.body;

    const result = await pool.query(
      `UPDATE reminders
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           reminder_date = COALESCE($3, reminder_date),
           completed = COALESCE($4, completed),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $5 AND user_id = $6
       RETURNING *`,
      [title, description, reminder_date, completed, req.params.id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Reminder not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Update reminder error:', err);
    res.status(500).json({ message: 'Failed to update reminder' });
  }
});

// Delete reminder
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM reminders WHERE id = $1 AND user_id = $2 RETURNING id',
      [req.params.id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Reminder not found' });
    }

    res.json({ message: 'Reminder deleted' });
  } catch (err) {
    console.error('Delete reminder error:', err);
    res.status(500).json({ message: 'Failed to delete reminder' });
  }
});

export default router;
