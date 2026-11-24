import { useState, useEffect } from 'react'
import {
    ArrowLeft,
    ArrowRight,
    Bike,
    CheckCircle2,
    Clock3,
    Copy,
    FileCheck,
    RefreshCw,
    ShieldCheck,
    UserRound,
    XCircle,
} from 'lucide-react'
import { Link } from 'react-router-dom'

const STORAGE_KEY = 'relayHandovers'

const readHandovers = () => {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    } catch {
        return []
    }
}

const getCurrentStatus = (handover) => {
    if (
        handover.status === 'Pending' &&
        Date.now() > new Date(handover.expiresAt).getTime()
    ) {
        return 'Expired'
    }

    return handover.status
}

const formatDate = (date) =>
    new Date(date).toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    })

export default function Handover() {
    const [handovers, setHandovers] = useState(readHandovers)
    const [vehicle, setVehicle] = useState('')
    const [registration, setRegistration] = useState('')
    const [buyerName, setBuyerName] = useState('')
    const [buyerPhone, setBuyerPhone] = useState('')
    const [message, setMessage] = useState('')
    useEffect(() => {
        const loadHandovers = async () => {
            try {
                const response = await fetch(
                    `http://localhost:5000/api/handovers`
                )

                if (!response.ok) {
                    throw new Error('Failed to load handovers')
                }

                const backendHandovers = await response.json()

                if (backendHandovers.length > 0) {
                    setHandovers(backendHandovers)
                    localStorage.setItem(
                        STORAGE_KEY,
                        JSON.stringify(backendHandovers)
                    )
                }
            } catch (error) {
                console.error('Backend handover loading error:', error)
            }
        }

        loadHandovers()
    }, [])

    const saveHandovers = (updated) => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
        setHandovers(updated)
    }

    const initiateHandover = async (e) => {
        e.preventDefault()

        const now = new Date()
        const expiresAt = new Date(
            now.getTime() + 72 * 60 * 60 * 1000
        )

        const newHandover = {
            id: `RH-${Date.now()}`,
            vehicle,
            registration,
            buyerName,
            buyerPhone,
            status: 'Pending',
            createdAt: now.toISOString(),
            expiresAt: expiresAt.toISOString(),
            acceptedAt: null,
            completedAt: null,
        }

        saveHandovers([newHandover, ...handovers])

        try {
            const response = await fetch(`http://localhost:5000/api/handovers`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newHandover),
            })

            if (!response.ok) {
                throw new Error('Failed to save handover to backend')
            }

            console.log('Handover saved to backend successfully')
        } catch (error) {
            console.error('Backend handover save error:', error)
        }

        setVehicle('')
        setRegistration('')
        setBuyerName('')
        setBuyerPhone('')
        setMessage('Handover request created successfully.')
    }

    const updateHandover = (id, changes) => {
        const updated = handovers.map((item) =>
            item.id === id ? { ...item, ...changes } : item
        )

        saveHandovers(updated)

    }

    const completeHandover = async (item) => {
        if (getCurrentStatus(item) !== 'Accepted') return

        const completedAt = new Date().toISOString()

        updateHandover(item.id, {
            status: 'Completed',
            completedAt,
        })

        try {
            const response = await fetch(
                `http://localhost:5000/api/handovers/${encodeURIComponent(item.id)}/complete`,
                {
                    method: 'PATCH',
                }
            )

            if (!response.ok) {
                throw new Error('Failed to complete handover in backend')
            }

            console.log('Handover completion saved to backend successfully')
        } catch (error) {
            console.error('Backend handover completion error:', error)
        }
    }

    const copyToken = async (text, type = 'Handover ID') => {
        try {
            await navigator.clipboard.writeText(text)
            setMessage(`${type} copied successfully.`)
        } catch {
            setMessage('Unable to copy automatically. Please copy manually.')
        }
    }

    const statusStyle = (status) => {
        if (status === 'Completed') return 'bg-emerald-50 text-emerald-700'
        if (status === 'Accepted') return 'bg-blue-50 text-blue-700'
        if (status === 'Expired') return 'bg-red-50 text-red-700'
        return 'bg-amber-50 text-amber-700'
    }

    const activeCount = handovers.filter(
        (item) => ['Pending', 'Accepted'].includes(getCurrentStatus(item))
    ).length

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900">
            <header className="border-b border-slate-200 bg-white">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 md:px-10">
                    <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-blue-700 p-2.5 text-white">
                            <ShieldCheck size={23} />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold tracking-tight">RELAY</h1>
                            <p className="text-xs text-slate-500">Seller Portal</p>
                        </div>
                    </div>

                    <Link
                        to="/"
                        className="flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold transition hover:bg-slate-50"
                    >
                        <ArrowLeft size={16} />
                        Dashboard
                    </Link>
                </div>
            </header>

            <main className="mx-auto max-w-7xl px-5 py-8 md:px-10 md:py-10">
                <div className="mb-8">
                    <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-blue-700">
                        Vehicle ownership transfer
                    </p>
                    <h2 className="text-3xl font-bold tracking-tight">
                        Handover Management
                    </h2>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                        Initiate a vehicle handover, track buyer acceptance, and record
                        the completion of the transfer process.
                    </p>
                </div>

                <div className="mb-8 grid gap-4 sm:grid-cols-3">
                    <div className="rounded-2xl border border-slate-200 bg-white p-5">
                        <div className="mb-3 flex items-center justify-between">
                            <span className="text-sm text-slate-500">Total handovers</span>
                            <FileCheck className="text-blue-700" size={20} />
                        </div>
                        <p className="text-3xl font-bold">{handovers.length}</p>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-5">
                        <div className="mb-3 flex items-center justify-between">
                            <span className="text-sm text-slate-500">Active handovers</span>
                            <Clock3 className="text-amber-600" size={20} />
                        </div>
                        <p className="text-3xl font-bold">{activeCount}</p>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-5">
                        <div className="mb-3 flex items-center justify-between">
                            <span className="text-sm text-slate-500">Completed</span>
                            <CheckCircle2 className="text-emerald-600" size={20} />
                        </div>
                        <p className="text-3xl font-bold">
                            {handovers.filter(
                                (item) => getCurrentStatus(item) === 'Completed'
                            ).length}
                        </p>
                    </div>
                </div>

                <div className="grid items-start gap-8 lg:grid-cols-5">
                    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
                        <div className="mb-6 flex items-center gap-3">
                            <div className="rounded-xl bg-blue-50 p-3 text-blue-700">
                                <Bike size={22} />
                            </div>
                            <div>
                                <h3 className="font-bold">Initiate handover</h3>
                                <p className="text-xs text-slate-500">
                                    Create a new buyer transfer request
                                </p>
                            </div>
                        </div>

                        <form onSubmit={initiateHandover} className="space-y-4">
                            <div>
                                <label className="mb-2 block text-sm font-medium">
                                    Vehicle model
                                </label>
                                <input
                                    required
                                    value={vehicle}
                                    onChange={(e) => setVehicle(e.target.value)}
                                    placeholder="e.g. Honda Activa 6G"
                                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium">
                                    Registration number
                                </label>
                                <input
                                    required
                                    value={registration}
                                    onChange={(e) => setRegistration(e.target.value)}
                                    placeholder="e.g. TS 09 AB 1234"
                                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm uppercase outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                />
                            </div>

                            <div className="border-t border-slate-100 pt-4">
                                <p className="mb-4 text-sm font-semibold">Buyer information</p>

                                <div className="mb-4">
                                    <label className="mb-2 block text-sm font-medium">
                                        Buyer name
                                    </label>
                                    <input
                                        required
                                        value={buyerName}
                                        onChange={(e) => setBuyerName(e.target.value)}
                                        placeholder="Enter buyer's full name"
                                        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium">
                                        Buyer phone number
                                    </label>
                                    <input
                                        required
                                        type="tel"
                                        inputMode="numeric"
                                        pattern="[0-9]{10}"
                                        maxLength={10}
                                        value={buyerPhone}
                                        onChange={(e) =>
                                            setBuyerPhone(e.target.value.replace(/\D/g, ''))
                                        }
                                        placeholder="10-digit mobile number"
                                        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    />
                                </div>
                            </div>

                            <div className="rounded-xl bg-blue-50 p-4">
                                <div className="flex gap-3">
                                    <Clock3 className="mt-0.5 shrink-0 text-blue-700" size={19} />
                                    <div>
                                        <p className="text-sm font-semibold text-blue-900">
                                            72-hour acceptance window
                                        </p>
                                        <p className="mt-1 text-xs leading-5 text-blue-800">
                                            The buyer must accept the request within 72 hours.
                                            Pending requests expire automatically after this period.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-blue-800"
                            >
                                Initiate handover
                                <ArrowRight size={17} />
                            </button>
                        </form>
                    </section>

                    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-3">
                        <div className="mb-6 flex items-center justify-between">
                            <div>
                                <h3 className="font-bold">Handover records</h3>
                                <p className="mt-1 text-xs text-slate-500">
                                    Monitor the progress of your transfers
                                </p>
                            </div>
                            <RefreshCw size={19} className="text-slate-400" />
                        </div>

                        {message && (
                            <div className="mb-5 flex items-start justify-between gap-3 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                                <span>{message}</span>
                                <button
                                    type="button"
                                    onClick={() => setMessage('')}
                                    aria-label="Dismiss message"
                                >
                                    <XCircle size={17} />
                                </button>
                            </div>
                        )}

                        {handovers.length === 0 ? (
                            <div className="rounded-xl border border-dashed border-slate-300 px-5 py-12 text-center">
                                <FileCheck className="mx-auto mb-3 text-slate-300" size={35} />
                                <p className="font-semibold text-slate-700">
                                    No handovers yet
                                </p>
                                <p className="mt-1 text-sm text-slate-500">
                                    Your new handover requests will appear here.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {handovers.map((item) => {
                                    const status = getCurrentStatus(item)

                                    return (
                                        <div
                                            key={item.id}
                                            className="rounded-xl border border-slate-200 p-4"
                                        >
                                            <div className="flex flex-wrap items-start justify-between gap-3">
                                                <div>
                                                    <h4 className="font-semibold">{item.vehicle}</h4>
                                                    <p className="mt-1 text-xs text-slate-500">
                                                        {item.registration}
                                                    </p>
                                                </div>

                                                <span
                                                    className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyle(status)}`}
                                                >
                                                    {status}
                                                </span>
                                            </div>

                                            <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                                                <div className="flex items-center gap-2 text-slate-600">
                                                    <UserRound size={16} className="text-slate-400" />
                                                    {item.buyerName}
                                                </div>
                                                <div className="text-slate-500">
                                                    {item.buyerPhone}
                                                </div>
                                            </div>

                                            <div className="mt-4 rounded-lg bg-slate-50 p-3">
                                                <div className="flex flex-wrap items-center justify-between gap-2">
                                                    <span className="text-xs font-medium text-slate-500">
                                                        Handover ID
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={() => copyToken(item.id)}
                                                        className="flex items-center gap-1 text-xs font-semibold text-blue-700 hover:text-blue-900"
                                                    >
                                                        <Copy size={13} />
                                                        Copy ID
                                                    </button>
                                                </div>
                                                <p className="mt-1 break-all font-mono text-sm font-semibold">
                                                    {item.id}
                                                </p>
                                            </div>

                                            <div className="mt-4 space-y-2 text-xs text-slate-500">
                                                <p>Created: {formatDate(item.createdAt)}</p>
                                                <p>Acceptance deadline: {formatDate(item.expiresAt)}</p>
                                                {item.acceptedAt && (
                                                    <p className="text-blue-700">
                                                        Accepted: {formatDate(item.acceptedAt)}
                                                    </p>
                                                )}
                                                {item.completedAt && (
                                                    <p className="text-emerald-700">
                                                        Completed: {formatDate(item.completedAt)}
                                                    </p>
                                                )}
                                            </div>

                                            {status === 'Pending' && (
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        copyToken(
                                                            `${window.location.origin}/handover/${item.id}`,
                                                            'Buyer acceptance link'
                                                        )
                                                    }
                                                    className="mt-4 w-full rounded-lg border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm font-semibold text-blue-800 transition hover:bg-blue-100"
                                                >
                                                    Copy Buyer Acceptance Link
                                                </button>
                                            )}

                                            {status === 'Accepted' && (
                                                <button
                                                    type="button"
                                                    onClick={() => completeHandover(item)}
                                                    className="mt-4 w-full rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
                                                >
                                                    Mark handover as completed
                                                </button>
                                            )}

                                            {status === 'Expired' && (
                                                <p className="mt-4 rounded-lg bg-red-50 p-3 text-xs text-red-700">
                                                    This request has expired. Initiate a new handover to
                                                    continue the transfer.
                                                </p>
                                            )}

                                            {status === 'Completed' && (
                                                <div className="mt-4 flex items-center gap-2 rounded-lg bg-emerald-50 p-3 text-sm font-medium text-emerald-800">
                                                    <CheckCircle2 size={17} />
                                                    Handover successfully completed
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </section>
                </div>

                <div className="mt-8 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
                    <ShieldCheck className="mt-0.5 shrink-0 text-amber-700" size={20} />
                    <div>
                        <p className="text-sm font-semibold text-amber-900">
                            Demo implementation notice
                        </p>
                        <p className="mt-1 text-xs leading-5 text-amber-800">
                            This standalone version stores handover information in browser
                            local storage. Buyer acceptance is simulated for demonstration.
                            Real buyer authentication, backend verification, and server-side
                            expiry enforcement will require the company API integration.
                        </p>
                    </div>
                </div>
            </main>
        </div>
    )
}
