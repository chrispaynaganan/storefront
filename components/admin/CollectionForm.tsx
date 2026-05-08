'use client'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import { ImageUploader } from './ImageUploader'

interface Props { collectionId?: string }

export function CollectionForm({ collectionId }: Props) {
  return (
    <form className="max-w-2xl space-y-6">
      <div className="bg-white rounded-xl border border-peach-light p-6 space-y-4">
        <Input label="Collection name" name="name" placeholder="Hoodies" />
        <Input label="Slug" name="slug" placeholder="hoodies" />
        <Textarea label="Description" name="description" />
        <ImageUploader />
      </div>
      <Button type="submit">{collectionId ? 'Save changes' : 'Add collection'}</Button>
    </form>
  )
}
