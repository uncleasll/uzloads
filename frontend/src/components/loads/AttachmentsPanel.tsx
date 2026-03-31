import { useRef, useState } from 'react'
import { Upload, Paperclip, Trash2, FileText, ExternalLink } from 'lucide-react'
import { useUploadAttachment, useDeleteAttachment, Attachment } from '../../hooks/useLoads'
import toast from 'react-hot-toast'
import { clsx } from '../../utils/helpers'

const TYPES = [
  { value: 'rate_confirmation', label: 'Rate Confirmation' },
  { value: 'bol', label: 'Bill of Lading (BOL)' },
  { value: 'lumper_receipt', label: 'Lumper Receipt' },
  { value: 'pod', label: 'Proof of Delivery' },
  { value: 'other', label: 'Other' },
]

const TYPE_COLORS: Record<string, string> = {
  rate_confirmation: 'bg-blue-100 text-blue-700',
  bol: 'bg-green-100 text-green-700',
  lumper_receipt: 'bg-orange-100 text-orange-700',
  pod: 'bg-purple-100 text-purple-700',
  other: 'bg-gray-100 text-gray-600',
}

interface Props {
  loadId: number
  attachments: Attachment[]
}

export default function AttachmentsPanel({ loadId, attachments }: Props) {
  const [selectedType, setSelectedType] = useState('rate_confirmation')
  const fileRef = useRef<HTMLInputElement>(null)
  const upload = useUploadAttachment()
  const remove = useDeleteAttachment()

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      await upload.mutateAsync({ loadId, file, attachmentType: selectedType })
      toast.success('File uploaded successfully')
    } catch {
      toast.error('Upload failed')
    }
    e.target.value = ''
  }

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Remove "${name}"?`)) return
    try {
      await remove.mutateAsync(id)
      toast.success('Attachment removed')
    } catch {
      toast.error('Failed to remove')
    }
  }

  return (
    <div className="space-y-4">
      {/* Upload area */}
      <div className="border border-dashed border-gray-200 rounded-lg p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex-1">
            <label className="tms-label">Document Type</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="tms-input text-sm"
            >
              {TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          <div className="pt-5">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={upload.isPending}
              className="btn-primary text-sm py-2"
            >
              <Upload size={14} />
              {upload.isPending ? 'Uploading…' : 'Upload File'}
            </button>
          </div>
        </div>
        <p className="text-[11px] text-gray-400 text-center">PDF, PNG, JPG up to 25MB</p>
        <input
          ref={fileRef}
          type="file"
          accept=".pdf,.png,.jpg,.jpeg,.webp"
          className="hidden"
          onChange={handleFile}
        />
      </div>

      {/* Attachment list */}
      {attachments.length === 0 ? (
        <div className="flex flex-col items-center py-8 text-center">
          <Paperclip size={20} className="text-gray-300 mb-2" />
          <p className="text-xs text-gray-400">No attachments yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {attachments.map((att) => (
            <div
              key={att.id}
              className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100 group"
            >
              <FileText size={16} className="text-gray-400 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-800 truncate">{att.original_filename}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={clsx('badge text-[10px]', TYPE_COLORS[att.attachment_type] ?? 'bg-gray-100 text-gray-600')}>
                    {TYPES.find((t) => t.value === att.attachment_type)?.label ?? att.attachment_type}
                  </span>
                  {att.file_size && (
                    <span className="text-[10px] text-gray-400">
                      {(att.file_size / 1024).toFixed(0)} KB
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <a
                  href={`/uploads/${att.file_path}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded hover:bg-gray-200 text-gray-400 hover:text-brand-600 transition-colors"
                  title="Open"
                >
                  <ExternalLink size={13} />
                </a>
                <button
                  onClick={() => handleDelete(att.id, att.original_filename)}
                  className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                  title="Delete"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
