import { useState, useEffect } from 'react'
import QRCode from 'qrcode'
import { Routes, Route, useNavigate } from 'react-router-dom'
import PublicRecord from './PublicRecord'
import Handover from './Handover.jsx'
import BuyerHandover from './BuyerHandover.jsx'
import {
  LayoutDashboard,
  CarFront,
  FileText,
  ArrowLeftRight,
  Settings,
  Bell,
  Search,
  Plus,
  ShieldCheck,
  Wrench,
  Zap,
} from 'lucide-react'
import './App.css'


const vehicles = [
  {
    name: 'Honda Activa 6G',
    registration: 'TS 09 AB 1234',
    chassisNumber: 'RELAYHONDA123456',
    year: '2023',
    score: 92,
    status: 'Verified',
    color: 'bg-blue-100 text-blue-700',
    services: [],
  },
  {
    name: 'Royal Enfield Classic 350',
    registration: 'TS 08 CD 5678',
    chassisNumber: 'RELAYROYAL123456',
    year: '2022',
    score: 85,
    status: 'Pending',
    color: 'bg-amber-100 text-amber-700',
    services: [],
  },
]


function SellerDashboard() {
  const navigate = useNavigate()
  const [showAddVehicle, setShowAddVehicle] = useState(false)
  const [activeSection, setActiveSection] = useState('Dashboard')
  const [sellerName, setSellerName] = useState(
    () => localStorage.getItem('relaySellerName') || ''
  )
  const [sellerPhone, setSellerPhone] = useState(
    () => localStorage.getItem('relaySellerPhone') || ''
  )
  const [emailNotifications, setEmailNotifications] = useState(
    () => localStorage.getItem('relayEmailNotifications') !== 'false'
  )
  const [smsNotifications, setSmsNotifications] = useState(
    () => localStorage.getItem('relaySmsNotifications') !== 'false'
  )
  const [settingsMessage, setSettingsMessage] = useState('')
  const [vehicleList, setVehicleList] = useState(() => {
    try {
      const savedVehicles = localStorage.getItem('relayVehicles')
      return savedVehicles ? JSON.parse(savedVehicles) : vehicles
    } catch {
      return vehicles
    }
  })
  useEffect(() => {
    const loadVehicles = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/vehicles`)

        if (!response.ok) {
          throw new Error('Failed to load vehicles')
        }

        const backendVehicles = await response.json()

        if (backendVehicles.length > 0) {
          setVehicleList(backendVehicles)
          localStorage.setItem('relayVehicles', JSON.stringify(backendVehicles))
        } else if (vehicleList.length > 0) {
          for (const vehicle of vehicleList) {
            await fetch(`http://localhost:5000/api/vehicles`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(vehicle),
            })
          }
        }
      } catch (error) {
        console.error('Backend vehicle loading error:', error)
      }
    }

    loadVehicles()
  }, [])
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/settings`)

        if (!response.ok) {
          throw new Error('Failed to load settings')
        }

        const settings = await response.json()

        if (settings) {
          setSellerName(settings.sellerName || '')
          setSellerPhone(settings.sellerPhone || '')
          setEmailNotifications(settings.emailNotifications === 1)
          setSmsNotifications(settings.smsNotifications === 1)

          localStorage.setItem('relaySellerName', settings.sellerName || '')
          localStorage.setItem('relaySellerPhone', settings.sellerPhone || '')
          localStorage.setItem('relayEmailNotifications', String(settings.emailNotifications === 1))
          localStorage.setItem('relaySmsNotifications', String(settings.smsNotifications === 1))
        }
      } catch (error) {
        console.error('Backend settings loading error:', error)
      }
    }

    loadSettings()
  }, [])
  useEffect(() => {
    const loadRelayRecords = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/records`)

        if (!response.ok) {
          throw new Error('Failed to load RELAY records')
        }

        const backendRecords = await response.json()

        if (backendRecords.length > 0) {
          const savedRecords = backendRecords.map(
            (record) => record.record_data
          )

          setRelayRecords(savedRecords)
          localStorage.setItem('relayRecords', JSON.stringify(savedRecords))
        }
      } catch (error) {
        console.error('Backend RELAY records loading error:', error)
      }
    }

    loadRelayRecords()
  }, [])
  const [chassisNumber, setChassisNumber] = useState('')
  const [searchResult, setSearchResult] = useState(null)
  const [hasSearched, setHasSearched] = useState(false)
  const [selectedVehicle, setSelectedVehicle] = useState(null)
  const [selectedGalleryVehicle, setSelectedGalleryVehicle] = useState(null)
  const [showServiceForm, setShowServiceForm] = useState(false)
  const [relayRecords, setRelayRecords] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('relayRecords') || '[]')
    } catch {
      return []
    }
  })
  const [createdRecord, setCreatedRecord] = useState(null)
  const [recordAlreadyExists, setRecordAlreadyExists] = useState(false)
  const [showRecord, setShowRecord] = useState(false)
  const [qrCode, setQrCode] = useState('')



  const createRelayRecord = async (vehicle) => {
    const savedRecords = JSON.parse(
      localStorage.getItem('relayRecords') || '[]'
    )

    // Check whether this vehicle already has a RELAY record
    const existingRecord = savedRecords.find((record) => {
      const existingVehicle = record.vehicle || {}

      const sameChassis =
        vehicle.chassisNumber &&
        existingVehicle.chassisNumber &&
        vehicle.chassisNumber.trim().toLowerCase() ===
        existingVehicle.chassisNumber.trim().toLowerCase()

      const sameRegistration =
        vehicle.registration &&
        existingVehicle.registration &&
        vehicle.registration.trim().toLowerCase() ===
        existingVehicle.registration.trim().toLowerCase()

      return sameChassis || sameRegistration
    })

    // If a record already exists, show it instead of creating another
    if (existingRecord) {
      try {
        const backendResponse = await fetch(
          `http://localhost:5000/api/records`
        )

        const backendRecords = await backendResponse.json()

        const alreadySaved = backendRecords.some(
          (record) => record.id === existingRecord.id
        )

        if (!alreadySaved) {
          await fetch(`http://localhost:5000/api/records`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              id: existingRecord.id,
              registration:
                existingRecord.vehicle?.registration || vehicle.registration,
              record_data: existingRecord,
            }),
          })
        }
      } catch (error) {
        console.error('Existing RELAY record sync error:', error)
      }
      setRecordAlreadyExists(true)
      setRelayRecords(savedRecords)
      setCreatedRecord(existingRecord)
      setShowRecord(true)

      QRCode.toDataURL(existingRecord.publicUrl)
        .then((url) => setQrCode(url))
        .catch((error) => {
          console.error('QR Code generation failed:', error)
        })

      return
    }

    // Create a new record only if one doesn't already exist
    const recordId = `RELAY-${Date.now()}`

    setRecordAlreadyExists(false)
    const newRecord = {
      id: recordId,
      vehicle: vehicle,
      createdAt: new Date().toLocaleDateString('en-IN'),
      careScore: vehicle.score || 0,
      odometerStatus: 'Not verified',
      publicUrl: `http://localhost:5173/r/${recordId}`,
    }

    const updatedRecords = [...savedRecords, newRecord]

    localStorage.setItem(
      'relayRecords',
      JSON.stringify(updatedRecords)
    )
    try {
      const response = await fetch(`http://localhost:5000/api/records`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: newRecord.id,
          registration: vehicle.registration,
          record_data: newRecord,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to save RELAY record to backend')
      }

      console.log('RELAY record saved to backend successfully')
    } catch (error) {
      console.error('Backend RELAY record save error:', error)
    }

    setRelayRecords(updatedRecords)
    setCreatedRecord(newRecord)
    setShowRecord(true)

    QRCode.toDataURL(newRecord.publicUrl)
      .then((url) => setQrCode(url))
      .catch((error) => {
        console.error('QR Code generation failed:', error)
      })
  }


  const deleteRelayRecord = async (recordId) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this RELAY record? This action cannot be undone.'
    )

    if (!confirmed) return

    const savedRecords = JSON.parse(
      localStorage.getItem('relayRecords') || '[]'
    )

    const updatedRecords = savedRecords.filter(
      (record) => record.id !== recordId
    )

    localStorage.setItem(
      'relayRecords',
      JSON.stringify(updatedRecords)
    )

    setRelayRecords(updatedRecords)

    if (createdRecord?.id === recordId) {
      setShowRecord(false)
      setCreatedRecord(null)
      setQrCode('')
      setRecordAlreadyExists(false)
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/records/${encodeURIComponent(recordId)}`,
        {
          method: 'DELETE',
        }
      )

      if (!response.ok) {
        throw new Error('Failed to delete RELAY record from backend')
      }

      console.log('RELAY record deleted from backend successfully')
    } catch (error) {
      console.error('Backend RELAY record deletion error:', error)
    }
  }

  const openServiceHistory = (vehicle) => {
    setSelectedVehicle(vehicle)
    setShowServiceForm(false)
  }

  const handleVehicleSearch = (e) => {
    e.preventDefault()

    const result = vehicleList.find(
      (vehicle) =>
        vehicle.chassisNumber?.toLowerCase() === chassisNumber.trim().toLowerCase()
    )

    setSearchResult(result || null)
    setHasSearched(true)
  }
  const handleVehiclePhotoUpload = (e) => {
    const file = e.target.files?.[0]

    if (!file || !selectedGalleryVehicle) return

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file.')
      e.target.value = ''
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      alert('Please choose an image smaller than 2 MB.')
      e.target.value = ''
      return
    }

    const reader = new FileReader()

    reader.onload = async () => {
      const updatedVehicle = {
        ...selectedGalleryVehicle,
        photo: reader.result,
      }

      const updatedVehicles = vehicleList.map((vehicle) =>
        vehicle.registration === updatedVehicle.registration
          ? updatedVehicle
          : vehicle
      )

      setVehicleList(updatedVehicles)
      localStorage.setItem('relayVehicles', JSON.stringify(updatedVehicles))
      setSelectedGalleryVehicle(updatedVehicle)

      try {
        const response = await fetch(
          `http://localhost:5000/api/vehicles/${encodeURIComponent(updatedVehicle.registration)}`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedVehicle),
          }
        )

        if (!response.ok) {
          throw new Error('Failed to save vehicle photo to backend')
        }

        console.log('Vehicle photo saved to backend successfully')
      } catch (error) {
        console.error('Backend photo upload error:', error)
      }
    }

    reader.readAsDataURL(file)
  }
  const handleDeleteVehicle = async (vehicle) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${vehicle.name}?`
    )

    if (!confirmed) return

    const updatedVehicles = vehicleList.filter(
      (item) => item.registration !== vehicle.registration
    )

    setVehicleList(updatedVehicles)
    localStorage.setItem('relayVehicles', JSON.stringify(updatedVehicles))

    if (selectedGalleryVehicle?.registration === vehicle.registration) {
      setSelectedGalleryVehicle(null)
    }

    if (selectedVehicle?.registration === vehicle.registration) {
      setSelectedVehicle(null)
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/vehicles/${encodeURIComponent(vehicle.registration)}`,
        {
          method: 'DELETE',
        }
      )

      if (!response.ok) {
        throw new Error('Failed to delete vehicle from backend')
      }

      console.log('Vehicle deleted from backend successfully')
    } catch (error) {
      console.error('Backend vehicle deletion error:', error)
    }
  }
  const handleSaveSettings = async () => {
    localStorage.setItem('relaySellerName', sellerName)
    localStorage.setItem('relaySellerPhone', sellerPhone)
    localStorage.setItem('relayEmailNotifications', String(emailNotifications))
    localStorage.setItem('relaySmsNotifications', String(smsNotifications))

    try {
      const response = await fetch(`http://localhost:5000/api/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sellerName,
          sellerPhone,
          emailNotifications,
          smsNotifications,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to save settings to backend')
      }

      setSettingsMessage('Settings saved successfully!')
      console.log('Settings saved to backend successfully')
    } catch (error) {
      console.error('Backend settings save error:', error)
      setSettingsMessage('Settings saved locally, but backend save failed.')
    }
  }
  return (

    <div className="relay-theme min-h-screen bg-slate-50 text-slate-900">
      <aside className="fixed left-0 top-0 hidden h-screen w-64 border-r border-slate-200/80 bg-white p-6 shadow-sm md:block">

        {/* RELAY Branding */}
        <div className="mb-12 flex items-center gap-3">
          <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 p-3 text-white shadow-md shadow-blue-200">
            <CarFront size={27} />
          </div>

          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
              RELAY
            </h1>
            <p className="text-xs font-medium text-slate-400">
              Vehicle History Platform
            </p>
          </div>
        </div>

        {/* Navigation */}
        <p className="mb-4 px-2 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
          Main Menu
        </p>

        <nav className="space-y-2">
          <NavItem
            icon={<LayoutDashboard size={19} />}
            label="Dashboard"
            active={activeSection === 'Dashboard'}
            onClick={() => setActiveSection('Dashboard')}
          />

          <NavItem
            icon={<CarFront size={19} />}
            label="My Vehicles"
            active={activeSection === 'My Vehicles'}
            onClick={() => setActiveSection('My Vehicles')}
          />

          <NavItem
            icon={<FileText size={19} />}
            label="RELAY Records"
            active={activeSection === 'RELAY Records'}
            onClick={() => setActiveSection('RELAY Records')}
          />

          <NavItem
            icon={<ArrowLeftRight size={19} />}
            label="Handovers"
            active={false}
            onClick={() => navigate('/handover')}
          />

          <NavItem
            icon={<Settings size={19} />}
            label="Settings"
            active={activeSection === 'Settings'}
            onClick={() => setActiveSection('Settings')}
          />
        </nav>

        {/* Trust Information */}
        <div className="absolute bottom-6 left-5 right-5 rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
          <div className="mb-3 inline-flex rounded-xl bg-white p-2 text-blue-600 shadow-sm">
            <ShieldCheck size={23} />
          </div>

          <p className="text-sm font-bold text-slate-800">
            Your records, protected.
          </p>

          <p className="mt-2 text-xs leading-relaxed text-slate-500">
            RELAY helps build trust through verified vehicle history.
          </p>

          <div className="mt-4 h-1 w-full overflow-hidden rounded-full bg-blue-100">
            <div className="h-full w-3/4 rounded-full bg-blue-600" />
          </div>
        </div>

      </aside>

      <main className="min-h-screen md:ml-64">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-5 md:px-10">
          <div>
            <p className="text-sm text-slate-500">Seller Portal</p>
            <h2 className="text-xl font-bold md:text-2xl">Dashboard</h2>
          </div>
          <div className="flex items-center gap-4">
            <button className="rounded-full p-2 text-slate-500 hover:bg-slate-100">
              <Bell size={21} />
            </button>
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700">
                N
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-semibold">Seller Account</p>
                <p className="text-xs text-slate-500">Vehicle Owner</p>
              </div>
            </div>
          </div>
        </header>
        {activeSection === 'My Vehicles' && (
          <div className="p-5 md:p-10">
            <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <h3 className="text-3xl font-extrabold text-slate-900">
                  My Vehicles
                </h3>
                <p className="mt-2 text-sm text-slate-500">
                  Manage your registered vehicles and their details.
                </p>
              </div>

              <button
                onClick={() => setShowAddVehicle(true)}
                className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
              >
                <Plus size={18} /> Add Vehicle
              </button>
            </div>

            {vehicleList.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
                <CarFront size={40} className="mx-auto text-slate-300" />
                <p className="mt-3 font-semibold text-slate-700">
                  No vehicles added yet
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Add a vehicle to get started.
                </p>
              </div>
            ) : (
              <div className="grid gap-6 xl:grid-cols-2">
                {vehicleList.map((vehicle) => (
                  <div
                    key={vehicle.registration}
                    className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                  >
                    <h4 className="text-lg font-bold text-slate-900">
                      {vehicle.name}
                    </h4>

                    <p className="mt-1 text-sm text-slate-500">
                      {vehicle.registration} · {vehicle.year}
                    </p>

                    <div className="mt-5 flex items-center justify-between">
                      <span className="text-sm font-semibold text-slate-500">
                        Care Score
                      </span>
                      <span className="font-bold text-slate-900">
                        {vehicle.score === null || vehicle.score === undefined
                          ? 'Not Rated'
                          : `${vehicle.score}/100`}
                      </span>
                    </div>

                    <div className="mt-5 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedGalleryVehicle(vehicle)}
                        className="rounded-xl border border-indigo-200 px-4 py-3 text-xs font-semibold text-indigo-700 hover:bg-indigo-50"
                      >
                        View Photos
                      </button>

                      <button
                        type="button"
                        onClick={() => openServiceHistory(vehicle)}
                        className="rounded-xl border border-slate-200 px-4 py-3 text-xs font-semibold text-slate-700 hover:bg-blue-50"
                      >
                        Service History
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteVehicle(vehicle)}
                        className="rounded-xl border border-red-200 px-4 py-3 text-xs font-semibold text-red-600 hover:bg-red-50"
                      >
                        Delete Vehicle
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {activeSection === 'Settings' && (
          <div className="p-5 md:p-10">
            <div className="mb-8">
              <h3 className="text-3xl font-extrabold text-slate-900">
                Settings
              </h3>
              <p className="mt-2 text-sm text-slate-500">
                Manage your seller profile and notification preferences.
              </p>
            </div>

            <div className="max-w-3xl space-y-6">
              {/* Profile Settings */}
              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-6">
                  <h4 className="text-lg font-bold text-slate-900">
                    Profile Settings
                  </h4>
                  <p className="mt-1 text-sm text-slate-500">
                    Update your seller information.
                  </p>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Seller Name
                    </label>
                    <input
                      type="text"
                      value={sellerName}
                      onChange={(e) => setSellerName(e.target.value)}
                      placeholder="Enter your name"
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={sellerPhone}
                      onChange={(e) => setSellerPhone(e.target.value)}
                      placeholder="Enter your phone number"
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                </div>
              </section>

              {/* Notification Preferences */}
              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-6">
                  <h4 className="text-lg font-bold text-slate-900">
                    Notification Preferences
                  </h4>
                  <p className="mt-1 text-sm text-slate-500">
                    Choose how you want to receive notifications.
                  </p>
                </div>

                <div className="space-y-5">
                  <label className="flex cursor-pointer items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        Email Notifications
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        Receive updates through email.
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={emailNotifications}
                      onChange={(e) => setEmailNotifications(e.target.checked)}
                      className="h-5 w-5 accent-blue-600"
                    />
                  </label>

                  <div className="border-t border-slate-100" />

                  <label className="flex cursor-pointer items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        SMS Notifications
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        Receive updates through SMS.
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={smsNotifications}
                      onChange={(e) => setSmsNotifications(e.target.checked)}
                      className="h-5 w-5 accent-blue-600"
                    />
                  </label>
                </div>
              </section>

              {/* Save Settings */}
              <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
                <button
                  type="button"
                  onClick={handleSaveSettings}
                  className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
                >
                  Save Changes
                </button>

                {settingsMessage && (
                  <p className="text-sm font-medium text-emerald-600">
                    {settingsMessage}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
        {activeSection === 'RELAY Records' && (
          <div className="p-5 md:p-10">
            {/* My RELAY Records */}
            <div className="mb-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    My RELAY Records
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Access your previously created vehicle records
                  </p>
                </div>

                <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">
                  {relayRecords.length} Records
                </span>
              </div>

              {relayRecords.length === 0 ? (
                <p className="text-sm text-gray-500">
                  No RELAY records created yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {relayRecords.map((record) => (
                    <div
                      key={record.id}
                      className="flex flex-col justify-between gap-4 rounded-xl border border-gray-100 bg-gray-50 p-4 sm:flex-row sm:items-center"
                    >
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {record.vehicle.name}
                        </h3>
                        <p className="mt-1 text-xs text-gray-500">
                          {record.id}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-3 text-sm text-gray-600">
                          <span>
                            Care Score: <strong>{record.careScore}/100</strong>
                          </span>

                          <span>
                            Odometer: <strong>{record.odometerStatus}</strong>
                          </span>

                          <span>
                            Created: <strong>{record.createdAt}</strong>
                          </span>
                        </div>
                      </div>


                      <div className="flex flex-wrap gap-2">
                        <a
                          href={record.publicUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-lg bg-blue-600 px-4 py-2 text-center text-sm font-semibold text-white transition hover:bg-blue-700"
                        >
                          View Public Record
                        </a>

                        <button
                          type="button"
                          onClick={() => deleteRelayRecord(record.id)}
                          className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100"
                        >
                          Delete Record
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {showRecord && createdRecord && (
              <div className="mx-5 mb-6 rounded-2xl border border-blue-200 bg-white p-6 md:mx-10">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">
                      {recordAlreadyExists ? 'RELAY Record Details' : 'RELAY Record Created'}
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      {recordAlreadyExists
                        ? 'You are viewing your previously created vehicle record.'
                        : 'Your vehicle record has been generated successfully.'}
                    </p>
                  </div>

                  <button
                    onClick={() => setShowRecord(false)}
                    className="rounded-lg px-3 py-2 text-sm text-slate-500 hover:bg-slate-100"
                  >
                    Close
                  </button>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-xs font-medium text-slate-500">Record ID</p>
                    <p className="mt-2 font-bold text-slate-900">
                      {createdRecord.id}
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-xs font-medium text-slate-500">Vehicle</p>
                    <p className="mt-2 font-bold text-slate-900">
                      {createdRecord.vehicle.name}
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-xs font-medium text-slate-500">Care Score</p>
                    <p className="mt-2 font-bold text-slate-900">
                      {createdRecord.careScore}/100
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-xs font-medium text-slate-500">Odometer Status</p>
                    <p className="mt-2 font-bold text-amber-600">
                      {createdRecord.odometerStatus}
                    </p>
                  </div>
                </div>

                <div className="mt-5 rounded-xl bg-blue-50 p-4">
                  <p className="text-xs font-medium text-blue-700">Public Record Link</p>
                  <p className="mt-2 break-all text-sm font-semibold text-blue-900">
                    {createdRecord.publicUrl}
                  </p>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(createdRecord.publicUrl)
                      alert('RELAY Record link copied!')
                    }}
                    className="mt-3 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                  >
                    Copy Record Link
                  </button>
                  <button
                    onClick={() => {
                      const message = `I've created a verified RELAY record for my ${createdRecord.vehicle.name}. Check the full service history here: ${createdRecord.publicUrl}. Verify at the vehicle using chassis number.`

                      window.open(
                        `https://wa.me/?text=${encodeURIComponent(message)}`,
                        '_blank'
                      )
                    }}
                    className="mt-3 ml-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
                  >
                    Share on WhatsApp
                  </button>
                  {qrCode && (
                    <div className="mt-5 flex flex-col items-center rounded-xl bg-white p-4">
                      <p className="mb-3 text-sm font-semibold text-slate-700">
                        Scan to View Vehicle Record
                      </p>

                      <img
                        src={qrCode}
                        alt="RELAY Record QR Code"
                        className="h-48 w-48"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}




          </div>
        )}
        {showAddVehicle && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
            <div className="w-full max-w-xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">

              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                    <CarFront size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">
                      Add New Vehicle
                    </h3>
                    <p className="mt-1 text-xs text-slate-500">
                      Register a vehicle in your RELAY account
                    </p>
                  </div>
                </div>


              </div>

              {/* Modal Form */}
              <form
                onSubmit={async (e) => {
                  e.preventDefault()
                  const formData = new FormData(e.target)

                  const newVehicle = {
                    name: formData.get('name'),
                    registration: formData.get('registration'),
                    chassisNumber: formData.get('chassisNumber'),
                    year: formData.get('year'),
                    score: null,
                    status: 'Pending',
                    color: 'bg-amber-100 text-amber-700',
                    services: [],
                  }

                  const updatedVehicles = [...vehicleList, newVehicle]
                  setVehicleList(updatedVehicles)
                  localStorage.setItem('relayVehicles', JSON.stringify(updatedVehicles))

                  try {
                    const response = await fetch(`http://localhost:5000/api/vehicles`, {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify(newVehicle),
                    })

                    if (!response.ok) {
                      throw new Error('Failed to save vehicle to backend')
                    }

                    console.log('Vehicle saved to backend successfully')
                  } catch (error) {
                    console.error('Backend vehicle save error:', error)
                  }

                  setShowAddVehicle(false)
                  e.target.reset()
                }}
                className="grid gap-5 p-6 sm:grid-cols-2"
              >
                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Vehicle Model
                  </label>
                  <input
                    name="name"
                    required
                    placeholder="e.g. Honda Activa 6G"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Registration Number
                  </label>
                  <input
                    name="registration"
                    required
                    placeholder="e.g. TS 09 AB 1234"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Manufacturing Year
                  </label>
                  <input
                    name="year"
                    required
                    type="number"
                    min="1900"
                    max="2100"
                    placeholder="e.g. 2022"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Chassis Number
                  </label>
                  <input
                    name="chassisNumber"
                    required
                    placeholder="Enter vehicle chassis number"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                  />
                </div>

                <div className="flex justify-end gap-3 border-t border-slate-100 pt-5 sm:col-span-2">
                  <button
                    type="button"
                    onClick={() => setShowAddVehicle(false)}
                    className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700"
                  >
                    Save Vehicle
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {activeSection === 'Dashboard' && (
          <>
            <div className="p-5 md:p-10">
              <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
                <div>
                  <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                    <span className="h-2 w-2 rounded-full bg-blue-500" />
                    Seller Dashboard
                  </div>

                  <h3 className="text-3xl font-extrabold tracking-tight text-slate-900">
                    Welcome back!
                  </h3>

                  <p className="mt-2 text-sm text-slate-500">
                    Here's what's happening with your vehicles.
                  </p>
                </div>

                <button
                  onClick={() => setShowAddVehicle(true)}
                  className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
                >
                  <Plus size={18} /> Add Vehicle
                </button>
              </div>
              <div className="mb-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard
                  icon={<CarFront />}
                  title="Total Vehicles"
                  value={String(vehicleList.length).padStart(2, '0')}
                  detail="Vehicles in your account"
                />
                <StatCard
                  icon={<FileText />}
                  title="RELAY Records"
                  value={String(relayRecords.length).padStart(2, '0')}
                  detail="Vehicle records created"
                />

                <StatCard
                  icon={<Wrench />}
                  title="Service Entries"
                  value={String(
                    vehicleList.reduce(
                      (total, vehicle) => total + (vehicle.services?.length || 0),
                      0
                    )
                  ).padStart(2, '0')}
                  detail="Service history entries"
                />

                <StatCard
                  icon={<ArrowLeftRight />}
                  title="Handovers"
                  value={String(
                    JSON.parse(localStorage.getItem('relayHandovers') || '[]').length
                  ).padStart(2, '0')}
                  detail="Ownership transfers initiated"
                />
              </div>


              {selectedVehicle && (
                <section className="mb-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                  {/* Header */}
                  <div className="flex flex-col justify-between gap-4 border-b border-slate-100 bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-6 sm:flex-row sm:items-center">
                    <div className="flex items-center gap-4">
                      <div className="rounded-2xl bg-white p-3 text-blue-600 shadow-sm">
                        <Wrench size={25} />
                      </div>

                      <div>
                        <h3 className="text-xl font-extrabold text-slate-900">
                          Service History
                        </h3>
                        <p className="mt-1 text-sm text-slate-600">
                          {selectedVehicle.name} · {selectedVehicle.registration}
                        </p>
                        <p className="mt-1 text-xs font-medium text-slate-500">
                          {selectedVehicle.services?.length || 0} maintenance records
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedVehicle(null)}
                      className="w-fit rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                    >
                      Close
                    </button>
                  </div>

                  {/* Timeline Header and Add Button */}
                  <div className="flex flex-col justify-between gap-4 px-6 py-5 sm:flex-row sm:items-center">
                    <div>
                      <h4 className="font-bold text-slate-900">
                        Maintenance Timeline
                      </h4>
                      <p className="mt-1 text-sm text-slate-500">
                        Track the service and maintenance history of your vehicle.
                      </p>
                    </div>

                    <button
                      onClick={() => setShowServiceForm(true)}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 hover:shadow-md"
                    >
                      <span className="text-lg">+</span>
                      Add Service Record
                    </button>
                  </div>

                  {/* Add Service Form */}
                  {showServiceForm && (
                    <form

                      onSubmit={async (e) => {
                        e.preventDefault()

                        const formData = new FormData(e.target)

                        const newService = {
                          garage: formData.get('garage'),
                          date: formData.get('date'),
                          odometer: formData.get('odometer'),
                          description: formData.get('description'),
                          source: 'owner',
                        }

                        const updatedVehicle = {
                          ...selectedVehicle,
                          services: [...(selectedVehicle.services || []), newService],
                        }

                        try {
                          const response = await fetch(
                            `http://localhost:5000/api/vehicles/${encodeURIComponent(updatedVehicle.registration)}`,
                            {
                              method: 'PUT',
                              headers: {
                                'Content-Type': 'application/json',
                              },
                              body: JSON.stringify(updatedVehicle),
                            }
                          )

                          if (!response.ok) {
                            throw new Error('Failed to save service record')
                          }

                          const updatedVehicles = vehicleList.map((vehicle) =>
                            vehicle.registration === updatedVehicle.registration
                              ? updatedVehicle
                              : vehicle
                          )

                          setVehicleList(updatedVehicles)

                          localStorage.setItem(
                            'relayVehicles',
                            JSON.stringify(updatedVehicles)
                          )

                          setSelectedVehicle(updatedVehicle)
                          setShowServiceForm(false)
                          e.target.reset()

                        } catch (error) {
                          console.error('Service record saving error:', error)
                          alert('Failed to save service record. Please try again.')
                        }
                      }}

                      className="mx-6 mb-6 grid gap-4 rounded-2xl border border-blue-100 bg-blue-50/50 p-5 sm:grid-cols-2"
                    >
                      <div className="sm:col-span-2">
                        <h4 className="font-bold text-slate-900">
                          Add Maintenance Details
                        </h4>
                        <p className="mt-1 text-xs text-slate-500">
                          Enter the details of the service performed.
                        </p>
                      </div>

                      <input
                        name="garage"
                        required
                        placeholder="Garage name"
                        className="rounded-xl border border-slate-200 bg-white p-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />

                      <input
                        name="date"
                        required
                        type="date"
                        className="rounded-xl border border-slate-200 bg-white p-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />

                      <input
                        name="odometer"
                        required
                        type="number"
                        min="0"
                        placeholder="Odometer reading (KM)"
                        className="rounded-xl border border-slate-200 bg-white p-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />

                      <textarea
                        name="description"
                        required
                        rows="3"
                        placeholder="Describe the service performed"
                        className="rounded-xl border border-slate-200 bg-white p-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 sm:col-span-2"
                      />

                      <button
                        type="submit"
                        className="rounded-xl bg-blue-600 p-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                      >
                        Save Service Record
                      </button>

                      <button
                        type="button"
                        onClick={() => setShowServiceForm(false)}
                        className="rounded-xl border border-slate-200 bg-white p-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
                      >
                        Cancel
                      </button>
                    </form>
                  )}

                  {/* Service Timeline */}
                  <div className="px-6 pb-7">
                    {selectedVehicle.services?.length > 0 ? (
                      <div className="relative space-y-5 border-l-2 border-blue-100 pl-6">

                        {selectedVehicle.services.map((service, index) => (
                          <div key={index} className="relative">

                            {/* Timeline Marker */}
                            <div className="absolute -left-[34px] top-5 flex h-4 w-4 items-center justify-center rounded-full border-[3px] border-blue-500 bg-white shadow-sm" />

                            {/* Service Card */}
                            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-blue-200 hover:shadow-md">

                              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                                <div>
                                  <h4 className="text-base font-bold text-slate-900">
                                    {service.garage}
                                  </h4>

                                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                                    {service.description}
                                  </p>
                                </div>

                                <span className="w-fit rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700">
                                  Added by owner · Not confirmed
                                </span>
                              </div>

                              <div className="mt-5 flex flex-wrap gap-3 border-t border-slate-100 pt-4">

                                <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2">
                                  <span className="text-xs font-semibold text-slate-500">
                                    Date:
                                  </span>
                                  <span className="text-xs font-bold text-slate-700">
                                    {service.date}
                                  </span>
                                </div>

                                <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2">
                                  <span className="text-xs font-semibold text-slate-500">
                                    Odometer:
                                  </span>
                                  <span className="text-xs font-bold text-slate-700">
                                    {service.odometer} km
                                  </span>
                                </div>

                              </div>
                            </div>
                          </div>
                        ))}

                      </div>
                    ) : (
                      <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-10 text-center">
                        <Wrench size={30} className="mx-auto text-slate-400" />

                        <p className="mt-3 font-semibold text-slate-700">
                          No service records yet
                        </p>

                        <p className="mt-1 text-sm text-slate-500">
                          Add your first maintenance record to build this vehicle's history.
                        </p>
                      </div>
                    )}
                  </div>
                </section>
              )}

              <div className="grid gap-6 xl:grid-cols-2">
                <div className="space-y-6">
                  <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:shadow-md">

                    {/* Search Header */}
                    <div className="border-b border-slate-100 bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-white p-3 text-blue-600 shadow-sm">
                          <Search size={23} />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-slate-900">
                            Search Vehicle
                          </h3>
                          <p className="mt-1 text-sm text-slate-500">
                            Find vehicle records using a chassis number.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Search Form */}
                    <div className="p-6">
                      <form
                        onSubmit={handleVehicleSearch}
                        className="flex flex-col gap-3 sm:flex-row"
                      >
                        <div className="relative flex-1">
                          <Search
                            size={19}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                          />
                          <input
                            value={chassisNumber}
                            onChange={(e) => setChassisNumber(e.target.value)}
                            required
                            placeholder="Enter vehicle chassis number"
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-12 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                          />
                        </div>

                        <button
                          type="submit"
                          className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-7 py-3.5 text-sm font-semibold text-white shadow-md shadow-blue-200 transition hover:bg-blue-700 hover:shadow-lg"
                        >
                          <Search size={17} />
                          Search Vehicle
                        </button>
                      </form>

                      {/* Search Results */}
                      {hasSearched && (
                        <div className={`mt-5 rounded-2xl border p-5 ${searchResult
                          ? 'border-green-200 bg-green-50/70'
                          : 'border-red-200 bg-red-50/70'
                          }`}>
                          {searchResult ? (
                            <>
                              <div className="mb-4 flex items-center gap-2">
                                <div className="rounded-full bg-green-100 p-2 text-green-700">
                                  <ShieldCheck size={19} />
                                </div>
                                <p className="font-bold text-green-800">
                                  Vehicle Found
                                </p>
                              </div>

                              <div className="grid gap-3 sm:grid-cols-2">
                                <div className="rounded-xl bg-white p-3">
                                  <p className="text-xs text-slate-500">Vehicle Model</p>
                                  <p className="mt-1 text-sm font-semibold text-slate-800">
                                    {searchResult.name}
                                  </p>
                                </div>

                                <div className="rounded-xl bg-white p-3">
                                  <p className="text-xs text-slate-500">Registration</p>
                                  <p className="mt-1 text-sm font-semibold text-slate-800">
                                    {searchResult.registration}
                                  </p>
                                </div>

                                <div className="rounded-xl bg-white p-3 sm:col-span-2">
                                  <p className="text-xs text-slate-500">Chassis Number</p>
                                  <p className="mt-1 break-all text-sm font-semibold text-slate-800">
                                    {searchResult.chassisNumber}
                                  </p>
                                </div>
                              </div>
                            </>
                          ) : (
                            <div className="flex items-start gap-3">
                              <div className="rounded-full bg-red-100 p-2 text-red-600">
                                <Search size={18} />
                              </div>
                              <div>
                                <p className="font-bold text-red-800">
                                  Vehicle Not Found
                                </p>
                                <p className="mt-1 text-sm text-red-700">
                                  No matching vehicle was found. You can register it using the Add Vehicle option.
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </section>




                  <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:shadow-md">

                    {/* Header */}
                    <div className="border-b border-slate-100 bg-gradient-to-r from-indigo-50 to-blue-50 px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-white p-3 text-indigo-600 shadow-sm">
                          <Zap size={23} />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-slate-900">
                            Quick Actions
                          </h3>
                          <p className="mt-1 text-sm text-slate-500">
                            Access your most-used seller activities.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Action Cards */}
                    <div className="space-y-3 p-5">

                      <button
                        type="button"
                        onClick={() => setShowAddVehicle(true)}
                        className="group w-full text-left"
                      >
                        <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50/50 hover:shadow-md">
                          <div className="rounded-xl bg-blue-50 p-3 text-blue-600 transition group-hover:bg-blue-100">
                            <Plus size={22} />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-800">
                              Add New Vehicle
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              Register a vehicle in RELAY
                            </p>
                          </div>
                          <span className="ml-auto text-xl text-slate-300 transition group-hover:translate-x-1 group-hover:text-blue-600">
                            →
                          </span>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          document.getElementById('my-vehicles')?.scrollIntoView({
                            behavior: 'smooth',
                          })
                        }}
                        className="group w-full text-left"
                      >
                        <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-200 hover:bg-indigo-50/50 hover:shadow-md">
                          <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600 transition group-hover:bg-indigo-100">
                            <FileText size={22} />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-800">
                              Create RELAY Record
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              Build a vehicle history record
                            </p>
                          </div>
                          <span className="ml-auto text-xl text-slate-300 transition group-hover:translate-x-1 group-hover:text-indigo-600">
                            →
                          </span>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => window.location.href = '/handover'}
                        className="group w-full text-left"
                      >
                        <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-200 hover:bg-emerald-50/50 hover:shadow-md">
                          <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600 transition group-hover:bg-emerald-100">
                            <ArrowLeftRight size={22} />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-800">
                              Handover Management
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              Manage vehicle ownership transfers
                            </p>
                          </div>
                          <span className="ml-auto text-xl text-slate-300 transition group-hover:translate-x-1 group-hover:text-emerald-600">
                            →
                          </span>
                        </div>
                      </button>

                    </div>

                    {/* Trust Information */}
                    <div className="mx-5 mb-5 rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50 p-5">
                      <div className="mb-3 inline-flex rounded-xl bg-white p-2.5 text-blue-600 shadow-sm">
                        <ShieldCheck size={23} />
                      </div>
                      <h4 className="text-sm font-bold text-slate-800">
                        Build buyer confidence
                      </h4>
                      <p className="mt-2 text-xs leading-relaxed text-slate-600">
                        A complete service history makes your vehicle more transparent and trustworthy to potential buyers.
                      </p>
                    </div>

                  </section>
                  <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-100 bg-gradient-to-r from-indigo-50 to-blue-50 px-6 py-5">
                      <h3 className="text-lg font-bold text-slate-900">
                        Vehicle Gallery
                      </h3>
                      <p className="mt-1 text-sm text-slate-500">
                        View and manage your vehicle photos.
                      </p>
                    </div>

                    <div className="p-6">
                      {selectedGalleryVehicle ? (
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-semibold text-slate-900">
                              {selectedGalleryVehicle.name}
                            </h4>
                            <p className="mt-1 text-sm text-slate-500">
                              {selectedGalleryVehicle.registration}
                            </p>
                          </div>

                          {selectedGalleryVehicle.photo ? (
                            <img
                              src={selectedGalleryVehicle.photo}
                              alt={selectedGalleryVehicle.name}
                              className="h-56 w-full rounded-xl bg-slate-50 object-contain"
                            />
                          ) : (
                            <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center">
                              <CarFront size={40} className="mx-auto text-slate-300" />
                              <p className="mt-3 text-sm text-slate-500">
                                No photo uploaded for this vehicle yet.
                              </p>
                            </div>
                          )}
                          <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-xs font-semibold text-white transition hover:bg-indigo-700">
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={handleVehiclePhotoUpload}
                            />
                            Upload Vehicle Photo
                          </label>
                        </div>
                      ) : (
                        <div className="text-center">
                          <CarFront size={40} className="mx-auto text-slate-300" />
                          <p className="mt-3 text-sm font-semibold text-slate-700">
                            No vehicle selected
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            Select a vehicle to view or upload its photos.
                          </p>
                        </div>
                      )}
                    </div>
                  </section>
                </div>
                <div className="space-y-6">
                  <section
                    id="my-vehicles"
                    className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm xl:col-span-2"
                  >
                    {/* Header */}
                    <div className="flex flex-col justify-between gap-4 border-b border-slate-100 bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-5 sm:flex-row sm:items-center">
                      <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-white p-3 text-blue-600 shadow-sm">
                          <CarFront size={24} />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-slate-900">
                            My Vehicles
                          </h3>
                          <p className="mt-1 text-sm text-slate-500">
                            Manage your registered vehicles and their history.
                          </p>
                        </div>
                      </div>

                      <span className="inline-flex w-fit items-center rounded-full border border-blue-100 bg-white px-4 py-2 text-xs font-bold text-blue-700 shadow-sm">
                        {vehicleList.length} Registered Vehicles
                      </span>
                    </div>

                    {/* Vehicle List */}
                    <div className="space-y-4 p-5 md:p-6">
                      {vehicleList.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-10 text-center">
                          <CarFront size={32} className="mx-auto text-slate-400" />
                          <p className="mt-3 font-semibold text-slate-700">
                            No vehicles registered yet
                          </p>
                          <p className="mt-1 text-sm text-slate-500">
                            Add your first vehicle to get started with RELAY.
                          </p>
                        </div>
                      ) : (
                        vehicleList.map((vehicle) => (
                          <div
                            key={vehicle.registration}
                            className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-lg"
                          >
                            <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">

                              {/* Vehicle Information */}
                              <div className="flex items-start gap-4">
                                <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-100 p-4 text-blue-600">
                                  <CarFront size={30} />
                                </div>

                                <div className="min-w-0">
                                  <h4 className="text-base font-bold text-slate-900">
                                    {vehicle.name}
                                  </h4>

                                  <p className="mt-1 text-sm text-slate-500">
                                    {vehicle.registration} · {vehicle.year}
                                  </p>

                                  <div className="mt-3 flex flex-wrap items-center gap-2">
                                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${vehicle.color}`}>
                                      {vehicle.status}
                                    </span>

                                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                                      {vehicle.services?.length || 0} Service Entries
                                    </span>
                                  </div>

                                  <p className="mt-3 break-all text-xs text-slate-500">
                                    Chassis: {vehicle.chassisNumber || 'Not provided'}
                                  </p>
                                </div>
                              </div>

                              {/* Care Score and Actions */}
                              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">

                                <div className="min-w-[125px] rounded-xl bg-slate-50 px-5 py-3">
                                  <p className="text-xs font-semibold text-slate-500">
                                    Care Score
                                  </p>

                                  <p className="mt-1 text-2xl font-extrabold text-slate-900">
                                    {vehicle.score === null || vehicle.score === undefined ? (
                                      <span className="text-base font-semibold text-slate-400">
                                        Not Rated
                                      </span>
                                    ) : (
                                      <>
                                        {vehicle.score}
                                        <span className="text-sm font-medium text-slate-400">
                                          /100
                                        </span>
                                      </>
                                    )}
                                  </p>

                                  {vehicle.score !== null && vehicle.score !== undefined && (
                                    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                                      <div
                                        className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-600"
                                        style={{
                                          width: `${Math.min(100, Math.max(0, Number(vehicle.score) || 0))}%`,
                                        }}
                                      />
                                    </div>
                                  )}
                                </div>

                                <div className="flex flex-wrap gap-2">
                                  <button
                                    type="button"
                                    onClick={() => setSelectedGalleryVehicle(vehicle)}
                                    className="rounded-xl border border-indigo-200 px-4 py-3 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-50"
                                  >
                                    View Photos
                                  </button>
                                  <button
                                    onClick={() => openServiceHistory(vehicle)}
                                    className="rounded-xl border border-slate-200 px-4 py-3 text-xs font-semibold text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                                  >
                                    Service History
                                  </button>

                                  <button
                                    onClick={() => createRelayRecord(vehicle)}
                                    className="rounded-xl bg-blue-600 px-4 py-3 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-700 hover:shadow-md"
                                  >
                                    Create RELAY Record
                                  </button>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteVehicle(vehicle)}
                                  className="rounded-xl border border-red-200 px-4 py-3 text-xs font-semibold text-red-600 transition hover:bg-red-50"
                                >
                                  Delete Vehicle
                                </button>

                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </section>

                </div>
              </div>

              <p className="mt-8 text-center text-xs text-slate-400">
                RELAY Seller Portal · Independent development demo
              </p>
            </div>
          </>
        )}
      </main>
    </div>

  )
}

function NavItem({ icon, label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium ${active
        ? 'bg-blue-50 text-blue-700'
        : 'text-slate-600 hover:bg-slate-50'
        }`}
    >
      {icon}
      {label}
    </button>
  )
}

function StatCard({ icon, title, value, detail }) {
  return (
    <div className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg">
      <div className="mb-5 flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-500">
          {title}
        </p>

        <div className="rounded-xl bg-gradient-to-br from-blue-50 to-indigo-100 p-3 text-blue-600 transition-transform duration-300 group-hover:scale-110">
          {icon}
        </div>
      </div>

      <p className="text-3xl font-extrabold tracking-tight text-slate-900">
        {value}
      </p>

      <div className="mt-3 flex items-center gap-2">
        <div className="h-1 w-8 rounded-full bg-blue-500" />
        <p className="text-xs font-medium text-slate-400">
          {detail}
        </p>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<SellerDashboard />} />
      <Route path="/r/:recordId" element={<PublicRecord />} />
      <Route path="/handover" element={<Handover />} />
      <Route path="/handover/:id" element={<BuyerHandover />} />
    </Routes>
  )
}
