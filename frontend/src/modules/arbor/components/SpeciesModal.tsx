import { useState } from 'react'
import { X } from 'lucide-react'
import { createSpecies } from '../api/species'
import toast from 'react-hot-toast'

export default function SpeciesModal({ onClose, onSuccess }: { onClose: () => void, onSuccess: (newSpecies: any) => void }) {
    const [form, setForm] = useState({
        common_name: '',
        scientific_name: '',
        description: '',
        fun_fact: ''
    })
    const [saving, setSaving] = useState(false)

    const set = (k: string) => (e: React.ChangeEvent<any>) => setForm(f => ({ ...f, [k]: e.target.value }))

    const submit = async () => {
        if (!form.common_name || !form.scientific_name) {
            return toast.error('Common name and scientific name are required')
        }
        setSaving(true)
        try {
            const data = await createSpecies(form)
            toast.success('Species added!')
            onSuccess(data)
            onClose()
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Failed to create species')
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="fixed inset-0 z-[60] flex flex-col justify-end sm:justify-center sm:items-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white w-full sm:max-w-md sm:rounded-3xl rounded-t-3xl p-6 shadow-2xl animate-in slide-in-from-bottom-5">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-800">New Species</h2>
                    <button onClick={onClose} className="p-2 bg-gray-100 rounded-full text-gray-600 active:scale-95"><X size={18} /></button>
                </div>

                <Field label="Common Name *" k="common_name" form={form} onChange={set('common_name')} placeholder="e.g. Banyan Tree" />
                <Field label="Scientific Name *" k="scientific_name" form={form} onChange={set('scientific_name')} placeholder="e.g. Ficus benghalensis" />
                <Field label="Description" k="description" form={form} onChange={set('description')} isTextArea />
                <Field label="Fun Fact" k="fun_fact" form={form} onChange={set('fun_fact')} isTextArea />

                <button onClick={submit} disabled={saving}
                    className="w-full bg-forest-600 text-white font-semibold py-4 rounded-2xl active:scale-95 transition-transform disabled:opacity-60 mt-4">
                    {saving ? 'Creating…' : 'Create Species'}
                </button>
            </div>
        </div>
    )
}

const Field = ({ label, k, form, onChange, placeholder = '', isTextArea = false }: any) => (
    <div className="mb-3">
        <label className="text-xs font-medium text-gray-500 uppercase">{label}</label>
        {isTextArea ? (
            <textarea value={(form as any)[k]} onChange={onChange} placeholder={placeholder}
                className="w-full mt-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-forest-300"
                rows={3} />
        ) : (
            <input type="text" value={(form as any)[k]} onChange={onChange} placeholder={placeholder}
                className="w-full mt-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-forest-300" />
        )}
    </div>
)
