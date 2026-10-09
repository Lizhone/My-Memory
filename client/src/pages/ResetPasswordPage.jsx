
import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import api from '../services/api'

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') || ''

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')

    if (!token) {
      setError('The reset link is invalid or missing. Request a new link.')
      return
    }

    if (password.length < 6) {
      setError('Your password must be at least 6 characters long.')
      return
    }

    if (password !== confirmPassword) {
      setError('The passwords do not match.')
      return
    }

    setLoading(true)

    try {
      const response = await api.post('/auth/reset-password', {
        token,
        password,
      })

      setMessage(
        response.data?.message ||
          'Password reset successful. You can now sign in.'
      )
      setSuccess(true)
      setPassword('')
      setConfirmPassword('')
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Unable to reset your password. Request a new link and try again.'
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
            Reset Password
          </h1>

          <p className="text-sm text-secondary-navy">
            Choose a new password for your My Memory account.
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

        {!success && (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="new-password"
                className="mb-2 block text-sm font-semibold text-dark-navy"
              >
                New Password
              </label>

              <input
                id="new-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                minLength={6}
                placeholder="Enter new password"
                required
                className="w-full rounded-lg border border-border-color px-4 py-3 text-dark-navy outline-none transition focus:ring-2 focus:ring-primary-blue"
              />
            </div>

            <div>
              <label
                htmlFor="confirm-password"
                className="mb-2 block text-sm font-semibold text-dark-navy"
              >
                Confirm Password
              </label>

              <input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                minLength={6}
                placeholder="Confirm new password"
                required
                className="w-full rounded-lg border border-border-color px-4 py-3 text-dark-navy outline-none transition focus:ring-2 focus:ring-primary-blue"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 font-semibold disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-secondary-navy">
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
