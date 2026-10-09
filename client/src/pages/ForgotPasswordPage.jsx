
import { useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    setError('')

    try {
      const response = await api.post('/auth/forgot-password', {
        email: email.trim(),
      })

      setMessage(
        response.data?.message ||
          'If an account exists for this email, a reset link will be sent.'
      )
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Unable to send the reset email. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-very-light p-6">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-blue text-xl font-bold text-white">
            M
          </div>

          <h1 className="mb-2 text-2xl font-bold text-dark-navy">
            Forgot Password?
          </h1>

          <p className="text-sm text-secondary-navy">
            Enter the email address associated with your My Memory account.
            We'll send you a password-reset link if the account exists.
          </p>
        </div>

        {message && (
          <div
            role="status"
            className="mb-5 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700"
          >
            {message}
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="reset-email"
              className="mb-2 block text-sm font-semibold text-dark-navy"
            >
              Email Address
            </label>

            <input
              id="reset-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              required
              className="w-full rounded-lg border border-border-color px-4 py-3 text-dark-navy outline-none transition focus:ring-2 focus:ring-primary-blue"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3 font-semibold disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-secondary-navy">
          Remember your password?{' '}
          <Link
            to="/login"
            className="font-semibold text-primary-blue hover:text-blue-700"
          >
            Back to Sign In
          </Link>
        </p>
      </div>
    </div>
  )
}
