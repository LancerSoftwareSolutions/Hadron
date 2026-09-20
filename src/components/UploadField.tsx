'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Dict } from '@/lib/i18n'

// Uploads straight from the browser to Supabase Storage, so large files never
// pass through the server. The saved file path goes into a hidden form field.
export function UploadField({
  bucket,
  name,
  userId,
  accept,
  maxMb,
  label,
  hint,
  note,
  previewUrl,
  t,
}: {
  bucket: 'logos' | 'cvs'
  name: string
  userId: string
  accept: string
  maxMb: number
  label: string
  hint?: string
  note?: string
  previewUrl?: string | null
  t: Dict['upload']
}) {
  const [path, setPath] = useState('')
  const [status, setStatus] = useState<'idle' | 'uploading' | 'done' | 'too_big' | 'failed'>('idle')
  const [fileName, setFileName] = useState('')
  const [preview, setPreview] = useState<string | null>(previewUrl ?? null)

  async function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > maxMb * 1024 * 1024) {
      setStatus('too_big')
      setPath('')
      return
    }

    setStatus('uploading')
    setFileName(file.name)

    const ext = (file.name.split('.').pop() ?? 'bin').toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 5) || 'bin'
    const filePath = `${userId}/${crypto.randomUUID()}.${ext}`

    const supabase = createClient()
    const { error } = await supabase.storage.from(bucket).upload(filePath, file, { contentType: file.type })

    if (error) {
      setStatus('failed')
      setPath('')
      return
    }

    setPath(filePath)
    setStatus('done')
    if (bucket === 'logos') setPreview(URL.createObjectURL(file))
  }

  const message =
    status === 'uploading'
      ? t.uploading
      : status === 'done'
        ? `${t.done}: ${fileName}`
        : status === 'too_big'
          ? t.tooBig
          : status === 'failed'
            ? t.failed
            : ''

  return (
    <div>
      <label htmlFor={`${name}-file`} className="label">
        {label}
      </label>
      <div className="flex items-center gap-4">
        {preview && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="" className="size-16 rounded border border-line object-contain bg-white" />
        )}
        <input
          id={`${name}-file`}
          type="file"
          accept={accept}
          onChange={onChange}
          className="input"
          aria-describedby={`${name}-status`}
        />
      </div>
      <input type="hidden" name={name} value={path} />
      {hint && <p className="hint">{hint}</p>}
      {note && status === 'idle' && <p className="hint">{note}</p>}
      <p id={`${name}-status`} role="status" className={`hint ${status === 'failed' || status === 'too_big' ? 'text-marker' : ''}`}>
        {message}
      </p>
    </div>
  )
}
