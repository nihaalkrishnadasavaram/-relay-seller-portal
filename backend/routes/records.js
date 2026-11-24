
const express = require('express')
const router = express.Router()
const db = require('../database')

// GET all RELAY records
router.get('/', (req, res) => {
  const records = db.prepare(
    'SELECT * FROM relay_records ORDER BY created_at DESC'
  ).all()

  res.json(records.map(record => ({
    ...record,
    record_data: JSON.parse(record.record_data),
  })))
})

// GET one RELAY record
router.get('/:id', (req, res) => {
  const record = db.prepare(
    'SELECT * FROM relay_records WHERE id = ?'
  ).get(req.params.id)

  if (!record) {
    return res.status(404).json({ error: 'RELAY record not found' })
  }

  res.json({
    ...record,
    record_data: JSON.parse(record.record_data),
  })
})

// CREATE a RELAY record
router.post('/', (req, res) => {
  const { id, registration, record_data } = req.body

  if (!id || !record_data) {
    return res.status(400).json({
      error: 'Record ID and record data are required',
    })
  }

  try {
    db.prepare(`
      INSERT INTO relay_records (id, registration, record_data)
      VALUES (?, ?, ?)
    `).run(id, registration || null, JSON.stringify(record_data))

    res.status(201).json({
      message: 'RELAY record created successfully',
    })
  } catch (error) {
    res.status(400).json({
      error: 'Record already exists or invalid data',
    })
  }
})

// DELETE a RELAY record
router.delete('/:id', (req, res) => {
  const result = db.prepare(
    'DELETE FROM relay_records WHERE id = ?'
  ).run(req.params.id)

  if (result.changes === 0) {
    return res.status(404).json({ error: 'RELAY record not found' })
  }

  res.json({ message: 'RELAY record deleted successfully' })
})

module.exports = router
