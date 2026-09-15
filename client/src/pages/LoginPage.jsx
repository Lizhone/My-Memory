import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import loginBg from '../assets/login-bg.png'

export default function LoginPage({ setIsAuthenticated }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)

  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const endpoint = isSignUp ? '/auth/register' : '/auth/login'

      const payload = isSignUp
        ? {
            name: name.trim(),
            email: email.trim(),
            password,
          }
        : {
            email: email.trim(),
            password,
          }

      const response = await api.post(endpoint, payload)

      if (response.data?.token) {
        localStorage.setItem('token', response.data.token)
      }

      if (response.data?.user) {
        localStorage.setItem(
          'user',
          JSON.stringify(response.data.user)
        )
      } else if (isSignUp) {
        // Fallback in case register response doesn't include user
        localStorage.setItem(
          'user',
          JSON.stringify({
            name: name.trim(),
            email: email.trim(),
          })
        )
      }

      // Remember-me preference
      if (rememberMe) {
        localStorage.setItem('rememberMe', 'true')
      } else {
        localStorage.removeItem('rememberMe')
      }

      setIsAuthenticated(true)
      navigate('/')
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          'Something went wrong. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  const switchAuthMode = () => {
    setIsSignUp(!isSignUp)
    setError('')
    setName('')
    setEmail('')
    setPassword('')
  }

  return (
    <div className="min-h-screen flex">

      {/* =====================================================
          LEFT SECTION
      ===================================================== */}
      <div
        className="
          hidden
          lg:flex
          lg:w-1/2
          min-h-screen
          bg-cover
          bg-center
          relative
          flex-col
          justify-between
          p-12
        "
        style={{ backgroundImage: `url(${loginBg})` }}
      >
        {/* Overlay */}
        <div className="
          absolute
          inset-0
          bg-gradient-to-br
          from-primary-blue/90
          via-dark-navy/80
          to-secondary-navy/85
        " />

        <div className="relative z-10">

          {/* Brand */}
          <div className="mb-16">

            <div className="flex items-center gap-3 mb-4">

              {/* Brain Logo */}
              <div className="
                w-11
                h-11
                rounded-xl
                bg-white
                flex
                items-center
                justify-center
              ">
                <BrainLogo
                  color="#2563EB"
                  size={27}
                />
              </div>

              <h1 className="
                text-4xl
                font-bold
                text-white
              ">
                My Memory
              </h1>

            </div>

            <p className="
              text-xl
              text-blue-100
              font-light
            ">
              "Your life, remembered."
            </p>

          </div>

          {/* Benefits */}
          <div className="space-y-6 max-w-lg">

            <Benefit
              title="Remember Important Details"
              description="Never forget a name, place, or moment"
            />

            <Benefit
              title="Find Information Instantly"
              description="Search through all your memories with AI"
            />

            <Benefit
              title="Keep Your Life Organized"
              description="Automatic categorization and tagging"
            />

          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10">
          <p className="text-blue-100 text-sm">
            © 2026 My Memory. Your privacy is protected.
          </p>
        </div>
      </div>

      {/* =====================================================
          RIGHT SECTION
      ===================================================== */}
      <div className="
        w-full
        lg:w-1/2
        bg-white
        flex
        flex-col
        justify-center
        items-center
        p-6
        sm:p-10
        lg:p-16
      ">

        <div className="w-full max-w-sm">

          {/* Mobile Logo */}
          <div className="lg:hidden mb-8 text-center">

            <div className="
              flex
              items-center
              justify-center
              gap-2
              mb-4
            ">

              <div className="
                w-10
                h-10
                rounded-xl
                bg-primary-blue
                flex
                items-center
                justify-center
              ">
                <BrainLogo
                  color="#FFFFFF"
                  size={24}
                />
              </div>

              <h1 className="
                text-3xl
                font-bold
                text-dark-navy
              ">
                My Memory
              </h1>

            </div>

            <p className="
              text-secondary-navy
              text-sm
            ">
              "Your life, remembered."
            </p>

          </div>

          {/* =================================================
              FORM TITLE
          ================================================= */}
          <div className="mb-8">

            <h2 className="
              text-3xl
              font-bold
              text-dark-navy
              mb-2
            ">
              {isSignUp
                ? 'Create Your Account'
                : 'Welcome Back'}
            </h2>

            <p className="
              text-secondary-navy
              text-sm
            ">
              {isSignUp
                ? 'Start saving and organizing your memories'
                : 'Sign in to continue to your memories'}
            </p>

          </div>

          {/* =================================================
              ERROR
          ================================================= */}
          {error && (
            <div className="
              mb-6
              p-4
              bg-red-50
              border
              border-red-200
              rounded-10
              text-red-700
              text-sm
              font-medium
              flex
              items-start
              gap-3
            ">

              <ErrorIcon />

              <span>
                {error}
              </span>

            </div>
          )}

          {/* =================================================
              FORM
          ================================================= */}
          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >

            {/* NAME - SIGN UP ONLY */}
            {isSignUp && (
              <div>

                <label className="
                  block
                  text-dark-navy
                  font-semibold
                  mb-2
                  text-sm
                ">
                  Full Name
                </label>

                <input
                  type="text"
                  value={name}
                  onChange={(e) =>
                    setName(e.target.value)
                  }
                  className="
                    w-full
                    px-4
                    py-3
                    border
                    border-border-color
                    rounded-10
                    focus:outline-none
                    focus:ring-2
                    focus:ring-primary-blue
                    focus:ring-offset-2
                    focus:ring-offset-white
                    text-dark-navy
                    placeholder-gray-400
                    font-medium
                    transition-all
                  "
                  placeholder="Enter your full name"
                  required
                />

              </div>
            )}

            {/* EMAIL */}
            <div>

              <label className="
                block
                text-dark-navy
                font-semibold
                mb-2
                text-sm
              ">
                Email Address
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                className="
                  w-full
                  px-4
                  py-3
                  border
                  border-border-color
                  rounded-10
                  focus:outline-none
                  focus:ring-2
                  focus:ring-primary-blue
                  focus:ring-offset-2
                  focus:ring-offset-white
                  text-dark-navy
                  placeholder-gray-400
                  font-medium
                  transition-all
                "
                placeholder="you@example.com"
                required
              />

            </div>

            {/* PASSWORD */}
            <div>

              <label className="
                block
                text-dark-navy
                font-semibold
                mb-2
                text-sm
              ">
                Password
              </label>

              <input
                type="password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                className="
                  w-full
                  px-4
                  py-3
                  border
                  border-border-color
                  rounded-10
                  focus:outline-none
                  focus:ring-2
                  focus:ring-primary-blue
                  focus:ring-offset-2
                  focus:ring-offset-white
                  text-dark-navy
                  placeholder-gray-400
                  font-medium
                  transition-all
                "
                placeholder="••••••••"
                required
                minLength={6}
              />

            </div>

            {/* LOGIN OPTIONS */}
            {!isSignUp && (
              <div className="
                flex
                items-center
                justify-between
                pt-2
              ">

                <label className="
                  flex
                  items-center
                  gap-2
                  cursor-pointer
                ">

                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) =>
                      setRememberMe(e.target.checked)
                    }
                    className="
                      w-4
                      h-4
                      rounded
                      border
                      border-border-color
                      cursor-pointer
                    "
                  />

                  <span className="
                    text-dark-navy
                    text-sm
                    font-medium
                  ">
                    Remember me
                  </span>

                </label>

                <button
                  type="button"
                  onClick={() => {
                    setError(
                      'Password reset is not available yet.'
                    )
                  }}
                  className="
                    text-primary-blue
                    text-sm
                    font-semibold
                    hover:text-blue-700
                    transition-colors
                  "
                >
                  Forgot password?
                </button>

              </div>
            )}

            {/* SUBMIT */}
            <button
              type="submit"
              disabled={loading}
              className="
                btn-primary
                w-full
                py-3
                font-semibold
                text-base
                mt-6
                disabled:opacity-60
                disabled:cursor-not-allowed
              "
            >

              {loading ? (
                <span className="
                  inline-flex
                  items-center
                  justify-center
                  gap-2
                ">

                  <LoadingIcon />

                  {isSignUp
                    ? 'Creating Account...'
                    : 'Signing In...'}

                </span>
              ) : (
                isSignUp
                  ? 'Create Account'
                  : 'Sign In'
              )}

            </button>

          </form>

          {/* =================================================
              SWITCH LOGIN / SIGNUP
          ================================================= */}
          <p className="
            text-center
            text-dark-navy
            mt-8
            text-sm
          ">
            {isSignUp
              ? 'Already have an account? '
              : "Don't have an account? "}

            <button
              type="button"
              onClick={switchAuthMode}
              className="
                text-primary-blue
                font-bold
                hover:text-blue-700
                transition-colors
              "
            >
              {isSignUp
                ? 'Sign In'
                : 'Sign Up'}
            </button>
          </p>

          {/* Footer */}
          <p className="
            text-center
            text-secondary-navy
            text-xs
            mt-8
            border-t
            border-border-color
            pt-8
          ">
            By continuing, you agree to our Terms of Service
            and Privacy Policy
          </p>

        </div>
      </div>
    </div>
  )
}

/* =========================================================
   BENEFIT COMPONENT
========================================================= */

function Benefit({ title, description }) {
  return (
    <div className="
      flex
      items-start
      gap-4
    ">

      <div className="
        w-8
        h-8
        rounded-full
        bg-white/20
        flex
        items-center
        justify-center
        flex-shrink-0
        mt-1
      ">
        <CheckIcon />
      </div>

      <div>
        <p className="
          text-white
          font-semibold
        ">
          {title}
        </p>

        <p className="
          text-blue-100
          text-sm
          mt-1
        ">
          {description}
        </p>
      </div>

    </div>
  )
}

/* =========================================================
   SVG ICONS
========================================================= */

function BrainLogo({ color, size = 28 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="
          M16.5 8.5
          C13.2 6 9 7.9 9 12
          C6.3 12.5 5 15.2 6.1 17.5
          C3.9 20.5 5.7 24.4 9 24.7
          C8.8 28.4 12 30.7 15.2 29.5
          C16 33 20 34 21.5 31.2

          M23.5 8.5
          C26.8 6 31 7.9 31 12
          C33.7 12.5 35 15.2 33.9 17.5
          C36.1 20.5 34.3 24.4 31 24.7
          C31.2 28.4 28 30.7 24.8 29.5
          C24 33 20 34 18.5 31.2

          M20 7V32
          M11 17H15
          M25 17H29
          M12 23H16
          M24 23H28
        "
        stroke={color}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
    >
      <path
        d="M5 12.5L9.5 17L19 7"
        stroke="white"
        strokeWidth="2.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function ErrorIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      className="flex-shrink-0"
    >
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="#DC2626"
        strokeWidth="1.8"
      />

      <path
        d="M12 8V13"
        stroke="#DC2626"
        strokeWidth="1.8"
        strokeLinecap="round"
      />

      <circle
        cx="12"
        cy="16.5"
        r="1"
        fill="#DC2626"
      />
    </svg>
  )
}

function LoadingIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      className="animate-spin"
    >
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="currentColor"
        strokeWidth="2"
        opacity="0.25"
      />

      <path
        d="M21 12C21 7.03 16.97 3 12 3"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}