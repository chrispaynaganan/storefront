'use client'
import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase'

interface Props {
  value: string[]
  onChange: (urls: string[]) => void
}

export function ImageUploader({ value = [], onChange }: Props) {
  const [uploading, setUploading] = useState(false)
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  async function uploadFiles(files: FileList) {
    setUploading(true)
    const supabase = createClient()
    const uploaded: string[] = []

    for (const file of Array.from(files)) {
      const ext = file.name.split('.').pop()
      const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const { data, error } = await supabase.storage
        .from('products')
        .upload(filename, file, { upsert: true })

      if (data) {
        const { data: urlData } = supabase.storage.from('products').getPublicUrl(filename)
        uploaded.push(urlData.publicUrl)
      }
    }

    onChange([...value, ...uploaded])
    setUploading(false)
  }

  function removeImage(url: string) {
    onChange(value.filter(u => u !== url))
  }

  return (
    <div className="space-y-3">
      {/* Preview */}
      {value.length > 0 && (
        <div className="flex gap-3 flex-wrap">
          {value.map((url, i) => (
            <div key={i} className="relative w-24 h-24 rounded-xl overflow-hidden border border-[#FFE8D6] group">
              <img src={url} alt="" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removeImage(url)}
                className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs"
              >
                Remove
              </button>
              {i === 0 && (
                <span className="absolute bottom-1 left-1 bg-[#3B1F0E] text-white text-[10px] px-1.5 py-0.5 rounded">
                  Main
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Drop zone */}
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => { e.preventDefault(); setDragging(false); uploadFiles(e.dataTransfer.files) }}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
          dragging ? 'border-[#3B1F0E] bg-[#FFCBA4]/20' : 'border-[#FFE8D6] hover:border-[#FFCBA4]'
        }`}
      >
        {uploading ? (
          <p className="text-sm text-[#6B3A22]">Uploading...</p>
        ) : (
          <>
            <p className="text-sm text-[#6B3A22]">Drag images here or <span className="underline">browse</span></p>
            <p className="text-xs text-[#6B3A22]/60 mt-1">PNG, JPG up to 5MB each</p>
          </>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={e => e.target.files && uploadFiles(e.target.files)}
      />
    </div>
  )
}