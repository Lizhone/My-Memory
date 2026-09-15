import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

export default function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()
  const [isOpen, setIsOpen] = useState(false)

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  const isActive = (path) => location.pathname === path

  const navItems = [
    {
      path: '/',
      label: 'Home',
      icon: 'home'
    },
    {
      path: '/add-memory',
      label: 'Add Memory',
      icon: 'edit'
    },
    {
      path: '/ask-ai',
      label: 'Ask AI',
      icon: 'ai'
    },
    {
      path: '/memories',
      label: 'All Memories',
      icon: 'library'
    },
    {
      path: '/reminders',
      label: 'Reminders',
      icon: 'bell'
    }
  ]

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="
          md:hidden
          fixed
          top-4
          left-4
          z-50
          w-11
          h-11
          rounded-xl
          bg-primary-blue
          text-white
          hover:bg-blue-700
          transition-colors
          flex
          items-center
          justify-center
        "
        aria-label="Open menu"
      >
        <MenuIcon size={24} />
      </button>

      {/* Sidebar */}
<aside
  className={`
    fixed md:static
    inset-0
    z-40
    w-64
   bg-blue-100/70
    border-r
    border-border-color
    transform
    transition-transform
    md:transform-none
    ${
      isOpen
        ? 'translate-x-0'
        : '-translate-x-full md:translate-x-0'
    }
    flex
    flex-col
    h-screen
    md:h-auto
    shadow-lg
    md:shadow-none
  `}
>
        {/* Header / Logo */}
        <div className="p-6 border-b border-border-color">
          <div className="flex items-center gap-3 mb-3">
            {/* Brain logo */}
            <div
              className="
                w-10
                h-10
                rounded-xl
                bg-blue-50
                flex
                items-center
                justify-center
                flex-shrink-0
              "
            >
              <BrainIcon
                size={28}
                color="#2563EB"
              />
            </div>

            <h1 className="text-xl font-bold text-dark-navy">
              My Memory
            </h1>
          </div>

          <p className="text-xs text-secondary-navy">
            Your life, remembered.
          </p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => {
                navigate(item.path)
                setIsOpen(false)
              }}
              className={`
                w-full
                text-left
                px-4
                py-3
                rounded-xl
                transition-all
                flex
                items-center
                gap-3
                font-medium
                text-sm
                ${
                  isActive(item.path)
                    ? 'bg-light-blue text-primary-blue shadow-sm'
                    : 'text-dark-navy hover:bg-very-light'
                }
              `}
            >
              <div className="w-6 flex items-center justify-center flex-shrink-0">
                <SidebarIcon
                  type={item.icon}
                  size={21}
                  color={
                    isActive(item.path)
                      ? '#2563EB'
                      : '#173B73'
                  }
                />
              </div>

              <span>{item.label}</span>

              {isActive(item.path) && (
                <div className="ml-auto w-1 h-6 bg-primary-blue rounded-full" />
              )}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-border-color space-y-3">
          {/* User Account */}
          <div className="card p-4">
            <div className="flex items-center gap-3">
              <div
                className="
                  w-10
                  h-10
                  rounded-full
                  bg-gradient-to-br
                  from-primary-blue
                  to-secondary-navy
                  text-white
                  flex
                  items-center
                  justify-center
                  font-semibold
                  text-sm
                  flex-shrink-0
                "
              >
                {getUserInitial()}
              </div>

              <div className="flex-1 min-w-0">
                <p className="
                  text-sm
                  font-semibold
                  text-dark-navy
                  truncate
                ">
                  {getUserEmail()}
                </p>

                <p className="text-xs text-secondary-navy">
                  Account
                </p>
              </div>
            </div>
          </div>

          {/* Sign Out */}
          <button
            onClick={handleLogout}
            className="
              w-full
              text-left
              px-4
              py-3
              rounded-xl
              text-dark-navy
              hover:bg-very-light
              transition-colors
              flex
              items-center
              gap-3
              font-medium
              text-sm
            "
          >
            <div className="w-6 flex items-center justify-center">
              <LogoutIcon
                size={21}
                color="#173B73"
              />
            </div>

            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="
            md:hidden
            fixed
            inset-0
            z-30
            bg-black/50
            backdrop-blur-sm
          "
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  )
}

/* --------------------------------------------------
   Helper functions
-------------------------------------------------- */

function getUserEmail() {
  try {
    const user = localStorage.getItem('user')

    if (!user) {
      return 'User'
    }

    const parsedUser = JSON.parse(user)

    return parsedUser?.email || 'User'
  } catch {
    return 'User'
  }
}

function getUserInitial() {
  const email = getUserEmail()

  if (!email || email === 'User') {
    return 'U'
  }

  return email[0].toUpperCase()
}

/* --------------------------------------------------
   Sidebar Icon Renderer
-------------------------------------------------- */

function SidebarIcon({ type, size, color }) {
  switch (type) {
    case 'home':
      return <HomeIcon size={size} color={color} />

    case 'edit':
      return <EditIcon size={size} color={color} />

    case 'ai':
      return <BrainIcon size={size} color={color} />

    case 'library':
      return <LibraryIcon size={size} color={color} />

    case 'bell':
      return <BellIcon size={size} color={color} />

    default:
      return null
  }
}

/* --------------------------------------------------
   Brain Icon
-------------------------------------------------- */

function BrainIcon({ size = 24, color = '#2563EB' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="
          M20.2 9.2
          C17.1 6.6 12.2 7.1 10.1 10.5
          C7.4 10.7 5.2 12.9 5.2 15.7
          C5.2 17.2 5.8 18.6 6.9 19.7
          C4.8 21 3.5 23.3 3.7 25.9
          C4 28.7 6 30.9 8.5 31.6
          C7.7 34.7 9.8 37.7 12.8 38.4
          C15.2 39 17.8 38.2 19.4 36.2
          L19.4 12
          C19.4 10.9 19.7 10 20.2 9.2Z
        "
        fill="white"
        stroke={color}
        strokeWidth="2.5"
        strokeLinejoin="round"
      />

      <path
        d="
          M27.8 9.2
          C30.9 6.6 35.8 7.1 37.9 10.5
          C40.6 10.7 42.8 12.9 42.8 15.7
          C42.8 17.2 42.2 18.6 41.1 19.7
          C43.2 21 44.5 23.3 44.3 25.9
          C44 28.7 42 30.9 39.5 31.6
          C40.3 34.7 38.2 37.7 35.2 38.4
          C32.8 39 30.2 38.2 28.6 36.2
          L28.6 12
          C28.6 10.9 28.3 10 27.8 9.2Z
        "
        fill="white"
        stroke={color}
        strokeWidth="2.5"
        strokeLinejoin="round"
      />

      <path
        d="M24 7V40"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      <path
        d="M10 18.5C12 18.5 13.5 17.4 14 15.5"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />

      <path
        d="M9 27C11.2 26.8 12.6 25.8 13.4 24"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />

      <path
        d="M38 18.5C36 18.5 34.5 17.4 34 15.5"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />

      <path
        d="M39 27C36.8 26.8 35.4 25.8 34.6 24"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}

/* --------------------------------------------------
   Home Icon
-------------------------------------------------- */

function HomeIcon({ size = 24, color = '#173B73' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M3 10.8L12 3L21 10.8V20H15.5V14H8.5V20H3V10.8Z"
        fill="white"
        stroke={color}
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/* --------------------------------------------------
   Edit Icon
-------------------------------------------------- */

function EditIcon({ size = 24, color = '#173B73' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M4 20H8L19.2 8.8C20.3 7.7 20.3 6 19.2 4.9L19.1 4.8C18 3.7 16.3 3.7 15.2 4.8L4 16V20Z"
        fill="white"
        stroke={color}
        strokeWidth="1.8"
        strokeLinejoin="round"
      />

      <path
        d="M13.8 6.2L17.8 10.2"
        stroke={color}
        strokeWidth="1.8"
      />
    </svg>
  )
}

/* --------------------------------------------------
   Library Icon
-------------------------------------------------- */

function LibraryIcon({ size = 24, color = '#173B73' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x="4"
        y="6"
        width="13"
        height="15"
        rx="1.8"
        fill="white"
        stroke={color}
        strokeWidth="1.7"
      />

      <rect
        x="7"
        y="3"
        width="13"
        height="15"
        rx="1.8"
        fill="#EFF6FF"
        stroke={color}
        strokeWidth="1.7"
      />

      <path
        d="M10 7H17"
        stroke={color}
        strokeWidth="1.6"
        strokeLinecap="round"
      />

      <path
        d="M10 11H17"
        stroke={color}
        strokeWidth="1.6"
        strokeLinecap="round"
      />

      <path
        d="M10 15H14"
        stroke={color}
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  )
}

/* --------------------------------------------------
   Bell Icon
-------------------------------------------------- */

function BellIcon({ size = 24, color = '#173B73' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M6 17H18L16.5 14.8V10C16.5 7.5 14.7 5.5 12 5.5C9.3 5.5 7.5 7.5 7.5 10V14.8L6 17Z"
        fill="white"
        stroke={color}
        strokeWidth="1.8"
        strokeLinejoin="round"
      />

      <path
        d="M10 19C10.5 20 11.2 20.5 12 20.5C12.8 20.5 13.5 20 14 19"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  )
}

/* --------------------------------------------------
   Logout Icon
-------------------------------------------------- */

function LogoutIcon({ size = 24, color = '#173B73' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M10 4H5.5C4.7 4 4 4.7 4 5.5V18.5C4 19.3 4.7 20 5.5 20H10"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
      />

      <path
        d="M13 8L17 12L13 16"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M8 12H17"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  )
}

/* --------------------------------------------------
   Menu Icon
-------------------------------------------------- */

function MenuIcon({ size = 24 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M4 6H20"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />

      <path
        d="M4 12H20"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />

      <path
        d="M4 18H20"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}