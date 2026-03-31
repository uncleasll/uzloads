import { Fragment, ReactNode } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { X } from 'lucide-react'

interface Props {
  open: boolean
  onClose: () => void
  title: string
  subtitle?: string
  children: ReactNode
  width?: 'sm' | 'md' | 'lg' | 'xl'
}

const WIDTHS = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-3xl',
}

export default function SlideOver({ open, onClose, title, subtitle, children, width = 'md' }: Props) {
  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        {/* Backdrop */}
        <Transition.Child
          as={Fragment}
          enter="ease-in-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in-out duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/25 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-[cubic-bezier(0.16,1,0.3,1)] duration-300"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in duration-200"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <Dialog.Panel className={`pointer-events-auto w-screen ${WIDTHS[width]}`}>
                  <div className="flex h-full flex-col bg-white shadow-2xl">
                    {/* Header */}
                    <div className="px-6 py-4 border-b border-gray-200 flex items-start justify-between">
                      <div>
                        <Dialog.Title className="text-base font-semibold text-gray-900">
                          {title}
                        </Dialog.Title>
                        {subtitle && (
                          <p className="mt-0.5 text-xs text-gray-500">{subtitle}</p>
                        )}
                      </div>
                      <button
                        onClick={onClose}
                        className="ml-4 p-1.5 rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>

                    {/* Body */}
                    <div className="flex-1 overflow-y-auto px-6 py-5">
                      {children}
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}
