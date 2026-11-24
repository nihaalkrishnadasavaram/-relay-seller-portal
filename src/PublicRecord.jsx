import {
    ShieldCheck,
    CarFront,
    Gauge,
    CalendarDays,
    Wrench,
} from 'lucide-react'
import { useParams } from 'react-router-dom'

function PublicRecord() {
    const { recordId } = useParams()
    console.log('URL Record ID:', recordId)

    const savedRecords = JSON.parse(
        window.localStorage.getItem('relayRecords') || '[]'
    )

    const currentRecord = savedRecords.find(
        (record) => String(record.id) === String(recordId)
    )
    const vehicle = currentRecord
        ? {
            name: currentRecord.vehicle.name,
            registration: currentRecord.vehicle.registration || 'Not provided',
            year: currentRecord.vehicle.year,
            careScore: currentRecord.careScore,
            odometerStatus: currentRecord.odometerStatus,
            recordId: currentRecord.id,
        }
        : null
    const services = currentRecord?.vehicle?.services || []
    if (!currentRecord) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
                <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-sm">
                    <h1 className="text-2xl font-bold text-slate-900">
                        RELAY Record Not Found
                    </h1>

                    <p className="mt-3 text-sm text-slate-500">
                        This vehicle record does not exist or is not available.
                        Please check the link and try again.
                    </p>

                    <a
                        href="/"
                        className="mt-6 inline-block rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
                    >
                        Back to RELAY
                    </a>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-100 px-4 py-8">
            <div className="mx-auto max-w-3xl">

                <div className="mb-6 text-center">
                    <div className="mb-3 flex justify-center">
                        <div className="rounded-2xl bg-blue-600 p-3 text-white">
                            <ShieldCheck size={32} />
                        </div>
                    </div>

                    <h1 className="text-3xl font-bold text-slate-900">
                        RELAY
                    </h1>

                    <p className="mt-2 text-sm text-slate-500">
                        Digital Vehicle History Record
                    </p>
                </div>

                <div className="rounded-2xl bg-white p-6 shadow-sm">

                    <div className="mb-6 flex items-center gap-3">
                        <CarFront size={30} className="text-blue-600" />

                        <div>
                            <h2 className="text-xl font-bold text-slate-900">
                                {vehicle.name}
                            </h2>

                            <p className="text-sm text-slate-500">
                                {vehicle.registration} · {vehicle.year}
                            </p>
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">

                        <div className="rounded-xl bg-blue-50 p-4">
                            <p className="text-sm text-slate-500">Care Score</p>

                            <p className="mt-2 text-3xl font-bold text-blue-700">
                                {vehicle.careScore}/100
                            </p>
                        </div>

                        <div className="rounded-xl bg-amber-50 p-4">
                            <p className="text-sm text-slate-500">Odometer Status</p>

                            <p className="mt-2 font-bold text-amber-700">
                                {vehicle.odometerStatus}
                            </p>
                        </div>

                    </div>

                    <div className="mt-6">
                        <h3 className="mb-3 text-lg font-bold text-slate-900">
                            Vehicle Information
                        </h3>

                        <div className="space-y-3 rounded-xl bg-slate-50 p-4 text-sm">

                            <p>
                                <strong>Record ID:</strong> {vehicle.recordId}
                            </p>

                            <p>
                                <strong>Vehicle:</strong> {vehicle.name}
                            </p>

                            <p>
                                <strong>Model Year:</strong> {vehicle.year}
                            </p>

                        </div>
                    </div>

                    <div className="mt-7">
                        <h3 className="mb-4 text-lg font-bold text-slate-900">
                            Service History
                        </h3>

                        <div className="space-y-4">

                            {services.map((service, index) => (
                                <div
                                    key={index}
                                    className="rounded-xl border border-slate-200 p-4"
                                >
                                    <div className="flex items-center gap-2">
                                        <Wrench size={18} className="text-blue-600" />

                                        <h4 className="font-semibold text-slate-900">
                                            {service.garage}
                                        </h4>
                                    </div>

                                    <p className="mt-2 text-sm text-slate-600">
                                        {service.description}
                                    </p>

                                    <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-500">

                                        <span className="flex items-center gap-1">
                                            <CalendarDays size={14} />
                                            {service.date}
                                        </span>

                                        <span className="flex items-center gap-1">
                                            <Gauge size={14} />
                                            {service.odometer}
                                        </span>

                                    </div>

                                    <p className="mt-3 text-xs font-medium text-amber-700">
                                        Added by owner, not confirmed
                                    </p>

                                </div>
                            ))}

                        </div>
                    </div>

                    <div className="mt-7 border-t border-slate-200 pt-5 text-center">

                        <p className="text-xs text-slate-500">
                            RELAY Record: {vehicle.recordId}
                        </p>

                        <p className="mt-2 text-xs text-slate-400">
                            Vehicle history information for buyer reference.
                        </p>

                    </div>

                </div>
            </div>
        </div>
    )
}

export default PublicRecord