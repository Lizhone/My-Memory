import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import Sidebar from '../components/Sidebar'

export default function HomePage() {
  const [memories, setMemories] = useState([])
  const [searchMemories, setSearchMemories] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const storedUser = localStorage.getItem('user')

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (err) {
        console.error('Failed to read stored user:', err)
      }
    }

    fetchRecentMemories()
  }, [])

  const fetchRecentMemories = async () => {
    try {
      const [recentResponse, searchResponse] = await Promise.all([
        api.get('/memories?limit=6'),
        api.get('/memories?limit=1000'),
      ])

      setMemories(recentResponse.data || [])
      setSearchMemories(searchResponse.data || [])
    } catch (err) {
      console.error('Failed to fetch memories:', err)
    } finally {
      setLoading(false)
    }
  }

  const displayName = user?.name?.trim() || 'User'
  const initials = displayName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'U'

  const filteredSearchMemories = searchTerm.trim()
    ? searchMemories
        .filter((memory) => {
          const haystack = [
            memory.title,
            memory.original_text,
            memory.summary,
            memory.category,
            ...(Array.isArray(memory.tags) ? memory.tags : []),
            ...(Array.isArray(memory.people) ? memory.people : []),
            ...(Array.isArray(memory.places) ? memory.places : []),
          ]
            .filter(Boolean)
            .join(' ')
            .toLowerCase()

          return haystack.includes(searchTerm.trim().toLowerCase())
        })
        .slice(0, 6)
    : []

  const handleSearchKeyDown = (e) => {
    if (e.key !== 'Enter') return

    const term = searchTerm.trim()
    if (!term) return

    if (filteredSearchMemories.length === 1) {
      navigate(`/memory/${filteredSearchMemories[0].id}`)
    } else {
      navigate('/memories')
    }
  }

  const getTimeOfDay = () => {
    const hour = new Date().getHours()

    if (hour < 12) return 'morning'
    if (hour < 18) return 'afternoon'
    return 'evening'
  }

  const quickActions = [
    {
      title: 'Add a Memory',
      description: 'Save anything from your day',
      icon: 'memory',
      bg: 'bg-[#FFF1F3]',
      iconBg: 'bg-[#FFE1E6]',
      iconColor: '#EF233C',
      onClick: () => navigate('/add-memory'),
    },
    {
      title: 'Ask My Memories',
      description: 'Find answers from your past',
      icon: 'chat',
      bg: 'bg-[#EFF8FF]',
      iconBg: 'bg-[#DBEEFF]',
      iconColor: '#1683E8',
      onClick: () => navigate('/ask-ai'),
    },
    {
      title: 'View All Memories',
      description: "Explore everything you've saved",
      icon: 'library',
      bg: 'bg-[#F0FCF5]',
      iconBg: 'bg-[#D9F8E7]',
      iconColor: '#18A36B',
      onClick: () => navigate('/memories'),
    },
    {
      title: 'Set a Reminder',
      description: 'Never miss what matters',
      icon: 'bell',
      bg: 'bg-[#F6F2FF]',
      iconBg: 'bg-[#E9E1FF]',
      iconColor: '#6741D9',
      onClick: () => navigate('/reminders'),
    },
  ]

  return (
    <div className="flex h-screen overflow-hidden bg-[#F8FAFD]">
      <Sidebar />

      <div className="flex-1 min-w-0 overflow-auto">
        {/* ================= TOP HEADER ================= */}
        <header className="h-[70px] bg-white border-b border-[#E6ECF5] flex items-center justify-between px-5 md:px-8">
          <div className="relative w-full max-w-[450px]">
            <SearchIcon />

            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              placeholder="Search your memories..."
              className="
                w-full
                h-10
                rounded-lg
                border border-[#DCE5F0]
                bg-white
                pl-10
                pr-4
                text-sm
                text-[#102A56]
                placeholder:text-[#8A9AB3]
                outline-none
                focus:border-[#2563EB]
                focus:ring-2
                focus:ring-blue-100
                transition
              "
            />

            {searchTerm.trim() && (
              <div className="absolute z-50 top-12 left-0 w-full bg-white rounded-lg border border-[#E2E8F0] shadow-lg overflow-hidden">
                {filteredSearchMemories.length > 0 ? (
                  filteredSearchMemories.map((memory) => (
                    <button
                      key={memory.id}
                      type="button"
                      onClick={() => {
                        setSearchTerm('')
                        navigate(`/memory/${memory.id}`)
                      }}
                      className="w-full px-3 py-2.5 text-left hover:bg-[#F8FBFF] transition border-b border-[#F1F4F8] last:border-b-0"
                    >
                      <p className="text-xs font-semibold text-[#102A56] truncate">
                        {memory.title || memory.original_text || 'Memory'}
                      </p>
                      <p className="text-[10px] text-[#7A899F] mt-0.5 truncate">
                        {memory.category || 'Other'}
                      </p>
                    </button>
                  ))
                ) : (
                  <div className="px-3 py-3 text-xs text-[#718198]">
                    No matching memories found.
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-5 ml-5">
            <button
              className="
                w-9 h-9
                flex items-center justify-center
                rounded-full
                hover:bg-[#F3F6FA]
                transition
              "
            >
              <HeaderBellIcon />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#102A56] text-white flex items-center justify-center text-xs font-semibold">
                {initials}
              </div>

              <div className="hidden sm:block text-left">
                <p className="text-[11px] text-[#8291A7] leading-none mb-1">
                  Hi,
                </p>
                <p className="text-sm font-semibold text-[#102A56] leading-none">
                  {displayName}
                </p>
              </div>

              <ChevronDownIcon />
            </div>
          </div>
        </header>

        {/* ================= PAGE ================= */}
        <main className="px-4 sm:px-6 lg:px-8 py-5">
          <div className="max-w-[1250px] mx-auto">

            {/* ================= WELCOME PANEL ================= */}
            <section className="rounded-xl bg-[#FFF8F1] border border-[#F5EDE4] p-4 md:p-5 mb-4">
              <div className="mb-4">
                <div className="flex items-center gap-2">
                  <h1 className="text-xl md:text-2xl font-bold text-[#102A56]">
                    Good {getTimeOfDay()}, {displayName}!
                  </h1>

                  <SunIcon />
                </div>

                <p className="text-sm text-[#61728C] mt-1">
                  Your memories make life easier. What would you like to do today?
                </p>
              </div>

              {/* ================= QUICK ACTIONS ================= */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {quickActions.map((action) => (
                  <QuickActionCard
                    key={action.title}
                    {...action}
                  />
                ))}
              </div>
            </section>

            {/* ================= LOWER CONTENT ================= */}
            <section className="grid grid-cols-1 xl:grid-cols-[1.65fr_0.8fr] gap-4">

              {/* ================= RECENT MEMORIES ================= */}
              <div className="bg-white rounded-xl border border-[#E7EDF5] overflow-hidden">
                <div className="px-4 py-3 border-b border-[#EDF1F6] flex items-center justify-between">
                  <h2 className="text-base font-bold text-[#102A56]">
                    Recent Memories
                  </h2>

                  <button
                    onClick={() => navigate('/memories')}
                    className="
                      text-xs
                      font-medium
                      text-[#2563EB]
                      hover:text-[#1D4ED8]
                      transition
                    "
                  >
                    View all
                  </button>
                </div>

                {loading ? (
                  <div className="flex justify-center items-center py-10">
                    <div className="w-6 h-6 rounded-full border-2 border-[#DBE7F5] border-t-[#2563EB] animate-spin" />
                  </div>
                ) : memories.length === 0 ? (
                  <EmptyMemories onCreate={() => navigate('/add-memory')} />
                ) : (
                  <div>
                    {memories.slice(0, 4).map((memory) => (
                      <MemoryRow
                        key={memory.id}
                        memory={memory}
                        onClick={() => navigate(`/memory/${memory.id}`)}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* ================= INSPIRATION CARD ================= */}
              <div
                className="
                  relative
                  min-h-[260px]
                  rounded-xl
                  overflow-hidden
                  bg-gradient-to-br
                  from-[#EEF1FF]
                  via-[#EAF0FF]
                  to-[#DCE6FF]
                  border border-[#DDE5FA]
                  p-5
                  flex
                  items-center
                  justify-center
                  text-center
                "
              >
                <div className="relative z-10 max-w-[220px]">
                  <p
                    className="
                      text-[#33478A]
                      text-[22px]
                      leading-[1.45]
                      italic
                      font-serif
                    "
                  >
                    Small details
                    <br />
                    today make a more
                    <br />
                    organized you
                    <br />
                    tomorrow.
                  </p>

                  <div className="mt-4 flex justify-center">
                    <HeartIcon />
                  </div>
                </div>

                <PlantDecoration />
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  )
}

/* =========================================================
   QUICK ACTION CARD
========================================================= */

function QuickActionCard({
  title,
  description,
  icon,
  bg,
  iconBg,
  iconColor,
  onClick,
}) {
  return (
    <button
      onClick={onClick}
      className={`
        ${bg}
        relative
        min-h-[118px]
        rounded-lg
        border border-white/70
        p-3
        text-left
        shadow-[0_2px_8px_rgba(16,42,86,0.04)]
        hover:-translate-y-[2px]
        hover:shadow-[0_5px_16px_rgba(16,42,86,0.08)]
        transition-all
        duration-200
        group
      `}
    >
      <div
        className={`
          ${iconBg}
          w-9 h-9
          rounded-lg
          flex items-center justify-center
          mb-2.5
        `}
      >
        <ActionIcon type={icon} color={iconColor} />
      </div>

      <h3 className="text-[13px] font-bold text-[#102A56] mb-1">
        {title}
      </h3>

      <p className="text-[10px] leading-[1.45] text-[#566983] max-w-[125px]">
        {description}
      </p>

      <div className="absolute bottom-3 right-3 text-[#173B73] group-hover:translate-x-1 transition-transform">
        <ArrowRightIcon />
      </div>
    </button>
  )
}

/* =========================================================
   MEMORY ROW
========================================================= */

function MemoryRow({ memory, onClick }) {
  const category = memory.category || 'Other'
  const categoryStyle = getCategoryStyle(category)

  return (
    <button
      onClick={onClick}
      className="
        w-full
        px-4
        py-3
        flex
        items-center
        gap-3
        text-left
        border-b border-[#F0F3F7]
        last:border-b-0
        hover:bg-[#F8FBFF]
        transition
        group
      "
    >
      {/* Category icon */}
      <div
        className={`
          ${categoryStyle.iconBg}
          w-8 h-8
          rounded-lg
          flex
          items-center
          justify-center
          flex-shrink-0
        `}
      >
        <CategoryIcon
          category={category}
          color={categoryStyle.iconColor}
        />
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-[#102A56] truncate">
          {memory.title || memory.original_text || 'Memory'}
        </p>

        <p className="text-[10px] text-[#7A899F] truncate mt-1">
          {getRelativeTime(memory.created_at)}
        </p>
      </div>

      {/* Category */}
      <span
        className={`
          ${categoryStyle.badgeBg}
          ${categoryStyle.badgeText}
          px-2.5
          py-1
          rounded-full
          text-[9px]
          font-semibold
          flex-shrink-0
        `}
      >
        {category}
      </span>
    </button>
  )
}

/* =========================================================
   EMPTY
========================================================= */

function EmptyMemories({ onCreate }) {
  return (
    <div className="py-10 px-6 text-center">
      <div className="w-12 h-12 mx-auto rounded-xl bg-[#EEF5FF] flex items-center justify-center mb-3">
        <MemoryDocumentIcon />
      </div>

      <h3 className="text-sm font-bold text-[#102A56]">
        No memories yet
      </h3>

      <p className="text-xs text-[#718198] mt-1 mb-4">
        Start saving moments from your day.
      </p>

      <button
        onClick={onCreate}
        className="
          bg-[#2563EB]
          text-white
          text-xs
          font-semibold
          px-4
          py-2
          rounded-lg
          hover:bg-[#1D4ED8]
          transition
        "
      >
        Create Your First Memory
      </button>
    </div>
  )
}

/* =========================================================
   CATEGORY STYLES
========================================================= */

function getCategoryStyle(category) {
  const styles = {
    Person: {
      iconBg: 'bg-[#EEF0FF]',
      iconColor: '#6366F1',
      badgeBg: 'bg-[#E8EDFF]',
      badgeText: 'text-[#5564C9]',
    },
    Reminder: {
      iconBg: 'bg-[#FFF0F1]',
      iconColor: '#EF4444',
      badgeBg: 'bg-[#FFE3E6]',
      badgeText: 'text-[#D9364A]',
    },
    Food: {
      iconBg: 'bg-[#FFF6E8]',
      iconColor: '#F59E0B',
      badgeBg: 'bg-[#FFF0D7]',
      badgeText: 'text-[#C97A00]',
    },
    Personal: {
      iconBg: 'bg-[#F4ECFF]',
      iconColor: '#A855F7',
      badgeBg: 'bg-[#F0E5FF]',
      badgeText: 'text-[#8743D1]',
    },
    Work: {
      iconBg: 'bg-[#EAF2FF]',
      iconColor: '#2563EB',
      badgeBg: 'bg-[#DFEBFF]',
      badgeText: 'text-[#2563EB]',
    },
    Place: {
      iconBg: 'bg-[#EAF9EF]',
      iconColor: '#16A34A',
      badgeBg: 'bg-[#DDF5E5]',
      badgeText: 'text-[#15803D]',
    },
    Other: {
      iconBg: 'bg-[#F1F5F9]',
      iconColor: '#64748B',
      badgeBg: 'bg-[#E9EEF4]',
      badgeText: 'text-[#64748B]',
    },
  }

  return styles[category] || styles.Other
}

/* =========================================================
   RELATIVE TIME
========================================================= */

function getRelativeTime(dateString) {
  if (!dateString) return ''

  const now = new Date()
  const date = new Date(dateString)
  const diff = Math.max(0, now - date)

  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes} min ago`
  if (hours < 24) return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`

  return `${days} ${days === 1 ? 'day' : 'days'} ago`
}

/* =========================================================
   ACTION ICONS
========================================================= */

function ActionIcon({ type, color }) {
  if (type === 'memory') {
    return <MemoryIcon color={color} />
  }

  if (type === 'chat') {
    return <ChatIcon color={color} />
  }

  if (type === 'library') {
    return <LibraryIcon color={color} />
  }

  if (type === 'bell') {
    return <BellIcon color={color} />
  }

  return null
}

function MemoryIcon({ color }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <rect x="5" y="3.5" width="11" height="15" rx="2" stroke={color} strokeWidth="1.8" />
      <path d="M9 7.5H12.5" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
      <path d="M9 10.5H12.5" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
      <path d="M17 8V16" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <path d="M20 11H14" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function ChatIcon({ color }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path
        d="M5 5.5H17.5C18.88 5.5 20 6.62 20 8V14C20 15.38 18.88 16.5 17.5 16.5H11L7 20V16.5H5C3.62 16.5 2.5 15.38 2.5 14V8C2.5 6.62 3.62 5.5 5 5.5Z"
        stroke={color}
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="M7 10H16"
        stroke={color}
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M7 13H12.5"
        stroke={color}
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  )
}

function LibraryIcon({ color }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <rect x="4" y="5" width="13" height="15" rx="2" stroke={color} strokeWidth="1.8" />
      <path d="M8 9H13" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
      <path d="M8 12H13" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
      <path d="M8 15H11" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
      <path d="M17 8L20 10V18C20 19.1 19.1 20 18 20H10" stroke={color} strokeWidth="1.6" />
    </svg>
  )
}

function BellIcon({ color }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path
        d="M7 10C7 7.24 9.24 5 12 5C14.76 5 17 7.24 17 10V14L19 17H5L7 14V10Z"
        stroke={color}
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M10 19C10.5 19.8 11.15 20.2 12 20.2C12.85 20.2 13.5 19.8 14 19"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  )
}

/* =========================================================
   CATEGORY ICONS
========================================================= */

function CategoryIcon({ category, color }) {
  switch (category) {
    case 'Person':
      return <PersonIcon color={color} />
    case 'Reminder':
      return <ReminderIcon color={color} />
    case 'Food':
      return <FoodIcon color={color} />
    case 'Personal':
      return <PersonalIcon color={color} />
    case 'Work':
      return <WorkIcon color={color} />
    case 'Place':
      return <PlaceIcon color={color} />
    default:
      return <OtherIcon color={color} />
  }
}

function PersonIcon({ color }) {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
      <circle cx="9" cy="8" r="3" stroke={color} strokeWidth="1.7" />
      <path
        d="M3.5 19C3.5 15.96 5.96 13.5 9 13.5C12.04 13.5 14.5 15.96 14.5 19"
        stroke={color}
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <circle cx="17" cy="9" r="2.3" stroke={color} strokeWidth="1.5" />
      <path
        d="M15.3 14.2C18 13.9 20.5 15.9 20.5 18.4"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

function ReminderIcon({ color }) {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
      <rect x="4" y="5" width="16" height="15" rx="2.5" stroke={color} strokeWidth="1.7" />
      <path d="M7 3V7" stroke={color} strokeWidth="1.7" strokeLinecap="round" />
      <path d="M17 3V7" stroke={color} strokeWidth="1.7" strokeLinecap="round" />
      <path d="M4 9H20" stroke={color} strokeWidth="1.7" />
      <path d="M8 13H12" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

function FoodIcon({ color }) {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
      <path d="M6 4V11" stroke={color} strokeWidth="1.7" strokeLinecap="round" />
      <path d="M4 4V8C4 9.1 4.9 10 6 10C7.1 10 8 9.1 8 8V4" stroke={color} strokeWidth="1.7" strokeLinecap="round" />
      <path d="M6 10V20" stroke={color} strokeWidth="1.7" strokeLinecap="round" />
      <path d="M16 4C14.9 6.3 14.5 8.2 14.5 10C14.5 12 15.5 13 17.5 13V20" stroke={color} strokeWidth="1.7" strokeLinecap="round" />
      <path d="M14.5 4V10" stroke={color} strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  )
}

function PersonalIcon({ color }) {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 20C12 20 4.5 15.8 4.5 9.6C4.5 7.1 6.3 5 8.6 5C10.1 5 11.4 5.8 12 7C12.6 5.8 13.9 5 15.4 5C17.7 5 19.5 7.1 19.5 9.6C19.5 15.8 12 20 12 20Z"
        stroke={color}
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function WorkIcon({ color }) {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
      <rect x="3.5" y="7" width="17" height="12" rx="2" stroke={color} strokeWidth="1.7" />
      <path
        d="M8 7V5.5C8 4.67 8.67 4 9.5 4H14.5C15.33 4 16 4.67 16 5.5V7"
        stroke={color}
        strokeWidth="1.7"
      />
      <path d="M3.5 11H20.5" stroke={color} strokeWidth="1.7" />
      <path d="M10 11V13H14V11" stroke={color} strokeWidth="1.7" />
    </svg>
  )
}

function PlaceIcon({ color }) {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 21C12 21 19 14.7 19 9C19 5.13 15.87 2 12 2C8.13 2 5 5.13 5 9C5 14.7 12 21 12 21Z"
        stroke={color}
        strokeWidth="1.7"
      />
      <circle cx="12" cy="9" r="2.5" stroke={color} strokeWidth="1.7" />
    </svg>
  )
}

function OtherIcon({ color }) {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
      <path
        d="M6 3.5H14L18 7.5V20.5H6V3.5Z"
        stroke={color}
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path d="M14 3.5V8H18" stroke={color} strokeWidth="1.7" />
      <path d="M9 11H15" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
      <path d="M9 14H15" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

/* =========================================================
   HEADER ICONS
========================================================= */

function SearchIcon() {
  return (
    <svg
      className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle cx="11" cy="11" r="6.5" stroke="#71829A" strokeWidth="1.8" />
      <path
        d="M16 16L20 20"
        stroke="#71829A"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  )
}

function HeaderBellIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
      <path
        d="M7 10C7 7.24 9.24 5 12 5C14.76 5 17 7.24 17 10V14L19 17H5L7 14V10Z"
        stroke="#173B73"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M10 20H14"
        stroke="#173B73"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  )
}

function ChevronDownIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path
        d="M7 10L12 15L17 10"
        stroke="#173B73"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function SunIcon() {
  return (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="4.2" fill="#FDBA2D" />
      <path
        d="M12 2V5M12 19V22M2 12H5M19 12H22M4.9 4.9L7 7M17 17L19.1 19.1M19.1 4.9L17 7M7 17L4.9 19.1"
        stroke="#F59E0B"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  )
}

function ArrowRightIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
      <path
        d="M5 12H18"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M13 7L18 12L13 17"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/* =========================================================
   EMPTY / INSPIRATION ICONS
========================================================= */

function MemoryDocumentIcon() {
  return (
    <svg width="23" height="23" viewBox="0 0 24 24" fill="none">
      <path
        d="M6 3.5H14L18 7.5V20.5H6V3.5Z"
        stroke="#2563EB"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path d="M14 3.5V8H18" stroke="#2563EB" strokeWidth="1.7" />
      <path d="M9 11H15" stroke="#2563EB" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M9 14H14" stroke="#2563EB" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

function HeartIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 19.5C12 19.5 4.5 15.1 4.5 9.5C4.5 7 6.2 5 8.7 5C10.2 5 11.3 5.8 12 7C12.7 5.8 13.8 5 15.3 5C17.8 5 19.5 7 19.5 9.5C19.5 15.1 12 19.5 12 19.5Z"
        stroke="#5B67C8"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function PlantDecoration() {
  return (
    <svg
      className="absolute bottom-0 right-0 w-28 h-40 opacity-55"
      viewBox="0 0 120 170"
      fill="none"
    >
      <path
        d="M82 170C83 135 84 102 89 70"
        stroke="#5E9C64"
        strokeWidth="3"
        strokeLinecap="round"
      />

      <path
        d="M84 129C69 118 61 104 63 91C76 94 84 105 84 129Z"
        fill="#8EC69A"
      />

      <path
        d="M87 111C103 102 108 88 107 77C94 80 87 91 87 111Z"
        fill="#7DBB88"
      />

      <path
        d="M86 88C73 79 70 66 73 55C84 59 88 70 86 88Z"
        fill="#9ACDA1"
      />

      <path
        d="M89 72C101 62 103 50 100 39C90 44 87 55 89 72Z"
        fill="#79B883"
      />

      <path
        d="M91 55C82 45 82 33 87 25C95 32 97 42 91 55Z"
        fill="#A0D1A6"
      />
    </svg>
  )
}