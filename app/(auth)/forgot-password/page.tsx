import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'

export const metadata = { title: 'Forgot Password' }

export default function ForgotPasswordPage() {
  return (
    <div className="bg-white rounded-2xl p-8 shadow-sm border border-peach-light">
      <h1 className="text-2xl font-light text-brown mb-2">Reset password</h1>
      <p className="text-sm text-brown-light mb-6">Enter your email and we will send you a reset link.</p>
      <form className="space-y-4">
        <Input label="Email" type="email" name="email" placeholder="you@example.com" />
        <Button type="submit" className="w-full">Send reset link</Button>
      </form>
      <p className="mt-4 text-center text-sm text-brown-light">
        <Link href="/login" className="underline hover:text-brown">Back to sign in</Link>
      </p>
    </div>
  )
}
