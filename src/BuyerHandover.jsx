import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ShieldCheck,
  Bike,
  CheckCircle2,
  Clock3,
  AlertCircle,
  ArrowLeft,
} from 'lucide-react'

const STORAGE_KEY = 'relayHandovers'

const getRecords = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  } catch {
    return []
  }
}

export default function BuyerHandover() {
  const { id } = useParams()
  const [records, setRecords] = useState(getRecords)
  const [message, setMessage] = useState('')

  const handover = records.find((item) => item.id === id)
  const [currentTime, setCurrentTime] = useState(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentTime(Date.now())
    }, 0)

    return () => clearTimeout(timer)
  }, [handover?.expiresAt, handover?.status])

  const expired =
    handover &&
    handover.status === 'Pending' &&
    currentTime !== null &&
    currentTime > new Date(handover.expiresAt).getTime()

  const status = expired ? 'Expired' : handover?.status

  const acceptHandover = async () => {
    if (!handover || status !== 'Pending') return

    const updated = records.map((item) =>
      item.id === id
        ? {
          ...item,
          status: 'Accepted',
          acceptedAt: new Date().toISOString(),
        }
        : item
    )

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    setRecords(updated)
    setMessage('You have successfully accepted the vehicle handover.')

    try {
      const response = await fetch(
        `http://localhost:5000/api/handovers/${encodeURIComponent(id)}/accept`,
        {
          method: 'PATCH',
        }
      )

      if (!response.ok) {
        throw new Error('Failed to accept handover in backend')
      }

      console.log('Handover acceptance saved to backend successfully')
    } catch (error) {
      console.error('Backend handover acceptance error:', error)
    }
  }

  if (!handover) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 p-5">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <AlertCircle className="mx-auto mb-4 text-red-500" size={42} />
          <h1 className="text-xl font-bold">Handover not found</h1>
          <p className="mt-2 text-sm text-slate-500">
            This handover link may be invalid or the record may not exist in this browser.
          </p>
          <Link to="/handover" className="mt-6 inline-flex items-center gap-2 font-semibold text-blue-700">
            <ArrowLeft size={16} /> Back to Handover Management
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-5 py-10">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="bg-blue-800 px-7 py-8 text-white">
          <div className="mb-5 flex items-center gap-3">
            <div className="rounded-xl bg-white/15 p-3">
              <ShieldCheck size={27} />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-wide">RELAY</h1>
              <p className="text-xs text-blue-100">Vehicle Handover</p>
            </div>
          </div>

          <p className="text-sm text-blue-100">Buyer verification portal</p>
          <h2 className="mt-2 text-2xl font-bold">
            Review your vehicle handover
          </h2>
          <p className="mt-2 text-sm leading-6 text-blue-100">
            Review the vehicle information below before accepting the transfer request.
          </p>
        </div>

        <div className="p-7">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-xl bg-blue-50 p-3 text-blue-700">
              <Bike size={25} />
            </div>
            <div>
              <p className="font-bold">{handover.vehicle}</p>
              <p className="text-sm text-slate-500">{handover.registration}</p>
            </div>
          </div>

          <div className="space-y-4 rounded-xl bg-slate-50 p-4">
            <div className="flex justify-between gap-3 text-sm">
              <span className="text-slate-500">Buyer</span>
              <span className="font-semibold">{handover.buyerName}</span>
            </div>
            <div className="flex justify-between gap-3 text-sm">
              <span className="text-slate-500">Handover ID</span>
              <span className="font-mono text-xs font-semibold">{handover.id}</span>
            </div>
            <div className="flex justify-between gap-3 text-sm">
              <span className="text-slate-500">Request created</span>
              <span className="text-right font-medium">
                {new Date(handover.createdAt).toLocaleString('en-IN')}
              </span>
            </div>
            <div className="flex justify-between gap-3 text-sm">
              <span className="text-slate-500">Acceptance deadline</span>
              <span className="text-right font-medium">
                {new Date(handover.expiresAt).toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {message && (
            <div className="mt-5 flex gap-3 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800">
              <CheckCircle2 className="shrink-0" size={20} />
              {message}
            </div>
          )}

          {status === 'Pending' && (
            <>
              <div className="mt-6 flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
                <Clock3 className="shrink-0 text-amber-700" size={20} />
                <p className="text-xs leading-5 text-amber-900">
                  Please confirm that the vehicle details are correct. This request expires 72 hours after it was created.
                </p>
              </div>

              <button
                onClick={acceptHandover}
                className="mt-6 w-full rounded-xl bg-blue-700 px-5 py-4 text-sm font-semibold text-white transition hover:bg-blue-800"
              >
                Accept Vehicle Handover
              </button>
            </>
          )}

          {status === 'Accepted' && (
            <div className="mt-6 rounded-xl bg-blue-50 p-5 text-center">
              <CheckCircle2 className="mx-auto mb-2 text-blue-700" size={32} />
              <h3 className="font-bold text-blue-900">Handover Accepted</h3>
              <p className="mt-1 text-sm text-blue-800">
                Your acceptance has been recorded. The seller can now complete the transfer.
              </p>
            </div>
          )}

          {status === 'Completed' && (
            <div className="mt-6 rounded-xl bg-emerald-50 p-5 text-center">
              <CheckCircle2 className="mx-auto mb-2 text-emerald-700" size={32} />
              <h3 className="font-bold text-emerald-900">Handover Completed</h3>
              <p className="mt-1 text-sm text-emerald-800">
                This vehicle handover has been marked as completed.
              </p>
            </div>
          )}

          {status === 'Expired' && (
            <div className="mt-6 rounded-xl bg-red-50 p-5 text-center">
              <AlertCircle className="mx-auto mb-2 text-red-600" size={32} />
              <h3 className="font-bold text-red-900">Request Expired</h3>
              <p className="mt-1 text-sm text-red-800">
                The 72-hour acceptance window has ended. Ask the seller to create a new request.
              </p>
            </div>
          )}

          <div className="mt-7 border-t border-slate-100 pt-5 text-center">
            <p className="text-xs text-slate-400">
              RELAY · Verified Vehicle History Platform
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
