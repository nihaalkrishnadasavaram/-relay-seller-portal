const express = require('express')
const router = express.Router()
const db = require('../database')

// GET all vehicles
router.get('/', (req, res) => {
    const vehicles = db.prepare(
        'SELECT * FROM vehicles ORDER BY created_at DESC'
    ).all()

    res.json(vehicles.map(vehicle => {
        if (vehicle.vehicle_data) {
            return JSON.parse(vehicle.vehicle_data)
        }

        return {
            name: vehicle.name,
            registration: vehicle.registration,
            year: vehicle.year,
            score: vehicle.score,
            photo: vehicle.photo,
        }
    }))
})

// GET one vehicle
router.get('/:registration', (req, res) => {
    const vehicle = db.prepare(
        'SELECT * FROM vehicles WHERE registration = ?'
    ).get(req.params.registration)

    if (!vehicle) {
        return res.status(404).json({ error: 'Vehicle not found' })
    }

    res.json(
        vehicle.vehicle_data
            ? JSON.parse(vehicle.vehicle_data)
            : {
                name: vehicle.name,
                registration: vehicle.registration,
                year: vehicle.year,
                score: vehicle.score,
                photo: vehicle.photo,
            }
    )
})

// ADD a vehicle
router.post('/', (req, res) => {
    const vehicle = req.body
    const { registration, name, year, score, photo } = vehicle

    if (!registration || !name) {
        return res.status(400).json({
            error: 'Registration and vehicle name are required',
        })
    }

    try {
        db.prepare(`
      INSERT INTO vehicles (
        registration, name, year, score, photo, vehicle_data
      )
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
            registration,
            name,
            year || null,
            score ?? null,
            photo || null,
            JSON.stringify(vehicle)
        )

        res.status(201).json({
            message: 'Vehicle added successfully',
            vehicle,
        })
    } catch (error) {
        res.status(400).json({
            error: 'Vehicle already exists or invalid data',
        })
    }
})
// UPDATE a vehicle
router.put('/:registration', (req, res) => {
    const vehicle = req.body
    const { name, year, score, photo } = vehicle

    const result = db.prepare(`
    UPDATE vehicles
    SET name = ?,
        year = ?,
        score = ?,
        photo = ?,
        vehicle_data = ?
    WHERE registration = ?
  `).run(
        name,
        year || null,
        score ?? null,
        photo || null,
        JSON.stringify(vehicle),
        req.params.registration
    )

    if (result.changes === 0) {
        return res.status(404).json({ error: 'Vehicle not found' })
    }

    res.json({
        message: 'Vehicle updated successfully',
        vehicle,
    })
})
// DELETE a vehicle
router.delete('/:registration', (req, res) => {
    const result = db.prepare(
        'DELETE FROM vehicles WHERE registration = ?'
    ).run(req.params.registration)

    if (result.changes === 0) {
        return res.status(404).json({ error: 'Vehicle not found' })
    }

    res.json({ message: 'Vehicle deleted successfully' })
})

module.exports = router