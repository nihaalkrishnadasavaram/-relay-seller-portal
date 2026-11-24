
const express = require('express')
const cors = require('cors')
const db = require('./database')
const vehiclesRouter = require('./routes/vehicles')
const recordsRouter = require('./routes/records')
const handoversRouter = require('./routes/handovers')
const settingsRouter = require('./routes/settings')

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors())
app.use(express.json({ limit: '10mb' }))
app.use('/api/vehicles', vehiclesRouter)
app.use('/api/records', recordsRouter)
app.use('/api/handovers', handoversRouter)
app.use('/api/settings', settingsRouter)

// Test API route
app.get('/', (req, res) => {
  res.json({
    message: 'RELAY Backend API is running!',
    status: 'Success',
  })
})

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`RELAY Backend running on port ${PORT}`)
})
