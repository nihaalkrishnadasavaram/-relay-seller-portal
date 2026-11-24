
const express = require('express')
const router = express.Router()
const db = require('../database')

// GET all handovers
router.get('/', (req, res) => {
  const handovers = db.prepare(
    'SELECT * FROM handovers ORDER BY createdAt DESC'
  ).all()

  res.json(handovers)
})

// GET one handover
router.get('/:id', (req, res) => {
  const handover = db.prepare(
    'SELECT * FROM handovers WHERE id = ?'
  ).get(req.params.id)

  if (!handover) {
    return res.status(404).json({ error: 'Handover not found' })
  }

  res.json(handover)
})

// CREATE a handover
router.post('/', (req, res) => {
  const {
    id,
    vehicle,
    registration,
    buyerName,
    buyerPhone,
    status,
    createdAt,
    expiresAt,
  } = req.body

  if (!id || !vehicle || !buyerName) {
    return res.status(400).json({
      error: 'Handover ID, vehicle and buyer name are required',
    })
  }

  try {
    db.prepare(`
      INSERT INTO handovers (
        id, vehicle, registration, buyerName, buyerPhone,
        status, createdAt, expiresAt
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      vehicle,
      registration || null,
      buyerName,
      buyerPhone || null,
      status || 'Pending',
      createdAt || new Date().toISOString(),
      expiresAt || null
    )

    res.status(201).json({
      message: 'Handover created successfully',
    })
  } catch (error) {
    res.status(400).json({
      error: 'Handover already exists or invalid data',
    })
  }
})

// ACCEPT a handover
router.patch('/:id/accept', (req, res) => {
  const result = db.prepare(`
    UPDATE handovers
    SET status = 'Accepted', acceptedAt = ?
    WHERE id = ? AND status = 'Pending'
  `).run(new Date().toISOString(), req.params.id)

  if (result.changes === 0) {
    return res.status(400).json({
      error: 'Handover not found or cannot be accepted',
    })
  }

  res.json({ message: 'Handover accepted successfully' })
})

// COMPLETE a handover
router.patch('/:id/complete', (req, res) => {
  const result = db.prepare(`
    UPDATE handovers
    SET status = 'Completed', completedAt = ?
    WHERE id = ? AND status = 'Accepted'
  `).run(new Date().toISOString(), req.params.id)

  if (result.changes === 0) {
    return res.status(400).json({
      error: 'Handover not found or not yet accepted',
    })
  }

  res.json({ message: 'Handover completed successfully' })
})

// DELETE a handover
router.delete('/:id', (req, res) => {
  const result = db.prepare(
    'DELETE FROM handovers WHERE id = ?'
  ).run(req.params.id)

  if (result.changes === 0) {
    return res.status(404).json({ error: 'Handover not found' })
  }

  res.json({ message: 'Handover deleted successfully' })
})

module.exports = router
