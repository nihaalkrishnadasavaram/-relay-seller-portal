
const express = require('express')
const router = express.Router()
const db = require('../database')

// GET seller settings
router.get('/', (req, res) => {
  const settings = db.prepare(
    'SELECT * FROM settings WHERE id = 1'
  ).get()

  res.json(settings)
})

// UPDATE seller settings
router.put('/', (req, res) => {
      console.log('Settings received by backend:', req.body)
  const {
    sellerName,
    sellerPhone,
    emailNotifications,
    smsNotifications,
  } = req.body

  db.prepare(`
    UPDATE settings
    SET sellerName = ?,
        sellerPhone = ?,
        emailNotifications = ?,
        smsNotifications = ?
    WHERE id = 1
  `).run(
    sellerName ?? '',
    sellerPhone ?? '',
    emailNotifications === false ? 0 : 1,
    smsNotifications === false ? 0 : 1
  )

  res.json({
    message: 'Settings updated successfully',
  })
})

module.exports = router
