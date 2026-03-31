import { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { AlertTriangle } from 'lucide-react'

interface Props {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmLabel?: string
  loading?: boolean
}

export default function ConfirmDialog({
  open, onClose, onConfirm, title, message, confirmLabel = 'Delete', loading = false,
}: Props) {
  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-150"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/25 backdrop-blur-sm" />
        </Transition.Child>
        <div className="fixed inset-0 z-10 flex items-center justify-center p-4">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-150"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-100"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="w-full max-w-sm bg-white rounded-xl shadow-xl border border-gray-200 p-6">
              <div className="flex items-start gap-4">
                <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                  <AlertTriangle size={18} className="text-red-600" />
                </div>
                <div>
                  <Dialog.Title className="text-sm font-semibold text-gray-900">{title}</Dialog.Title>
                  <p className="mt-1 text-sm text-gray-500">{message}</p>
                </div>
              </div>
              <div className="mt-5 flex gap-3 justify-end">
                <button onClick={onClose} className="btn-secondary text-sm py-1.5">Cancel</button>
                <button
                  onClick={onConfirm}
                  disabled={loading}
                  className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-1.5 rounded-md text-sm font-medium transition-colors disabled:opacity-50"
                >
                  {loading ? 'Deleting…' : confirmLabel}
                </button>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  )
}
