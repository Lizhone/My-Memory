import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import Sidebar from '../components/Sidebar'

export default function AllMemoriesPage() {
  const [memories, setMemories] = useState([])
  const [filteredMemories, setFilteredMemories] = useState([])
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [loading, setLoading] = useState(true)
  const [deleteId, setDeleteId] = useState(null)
  const navigate = useNavigate()

  const categories = ['All', 'Person', 'Reminder', 'Food', 'Personal', 'Work', 'Place', 'Other']

  useEffect(() => {
    fetchMemories()
  }, [])

  useEffect(() => {
    filterMemories()
  }, [memories, search, category])

  const fetchMemories = async () => {
    try {
      const response = await api.get('/memories')
      setMemories(response.data)
    } catch (err) {
      console.error('Failed to fetch memories:', err)
    } finally {
      setLoading(false)
    }
  }

  const filterMemories = () => {
    let filtered = memories

    if (search) {
      const searchLower = search.toLowerCase()
      filtered = filtered.filter(m =>
        m.title?.toLowerCase().includes(searchLower) ||
        m.summary?.toLowerCase().includes(searchLower) ||
        m.original_text?.toLowerCase().includes(searchLower)
      )
    }

    if (category !== 'All') {
      filtered = filtered.filter(m => m.category === category)
    }

    setFilteredMemories(filtered)
  }

  const handleDelete = async (id) => {
    try {
      await api.delete(`/memories/${id}`)
      setMemories(memories.filter(m => m.id !== id))
      setDeleteId(null)
    } catch (err) {
      console.error('Failed to delete memory:', err)
    }
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getCategoryColor = (category) => {
    if (!category) return { bg: 'bg-light-blue', text: 'text-primary-blue' }
    
    const colors = {
      'work': { bg: 'bg-blue-100', text: 'text-blue-700' },
      'personal': { bg: 'bg-purple-100', text: 'text-purple-700' },
      'idea': { bg: 'bg-amber-100', text: 'text-amber-700' },
      'reminder': { bg: 'bg-red-100', text: 'text-red-700' },
      'learning': { bg: 'bg-green-100', text: 'text-green-700' }
    }
    
    return colors[category.toLowerCase()] || { bg: 'bg-light-blue', text: 'text-primary-blue' }
  }

  return (
    <div className="flex h-screen bg-very-light overflow-hidden">
      <Sidebar />
      
      <div className="flex-1 overflow-auto">
        <div className="bg-white border-b border-border-color sticky top-0 z-10">
          <div className="px-6 md:px-10 py-8">
            <h1 className="text-3xl md:text-4xl font-bold text-dark-navy mb-2">All Memories</h1>
            <p className="text-secondary-navy">
              Search, filter, and manage your memory collection.
            </p>
          </div>
        </div>

        <main className="px-6 md:px-10 py-8">
          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative max-w-lg">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search memories..."
                className="card w-full px-4 py-3 pl-10 border border-border-color rounded-10 focus:outline-none focus:ring-2 focus:ring-primary-blue focus:ring-offset-2 focus:ring-offset-very-light text-dark-navy placeholder-gray-400"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-navy">🔍</span>
            </div>
          </div>

          {/* Category Filters */}
          <div className="mb-8 flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all border ${
                  category === cat
                    ? 'bg-primary-blue text-white border-primary-blue shadow-sm'
                    : 'bg-white text-primary-blue border-border-color hover:border-primary-blue'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Memories List */}
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-blue"></div>
            </div>
          ) : filteredMemories.length === 0 ? (
            <div className="card p-12 text-center bg-white">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="text-lg font-semibold text-dark-navy mb-2">No memories found</h3>
              <p className="text-secondary-navy">
                {search ? 'Try a different search term' : 'Start creating memories to see them here'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="text-sm text-secondary-navy mb-4">
                Found {filteredMemories.length} memory{filteredMemories.length !== 1 ? 'ies' : ''}
              </div>
              {filteredMemories.map((memory) => {
                const categoryColors = getCategoryColor(memory.category)
                return (
                  <div key={memory.id} className="card p-5 hover:shadow-md hover:border-primary-blue/30 transition-all duration-200 bg-white group">
                    <div className="flex items-start justify-between gap-4">
                      <div
                        className="flex-1 cursor-pointer"
                        onClick={() => navigate(`/memory/${memory.id}`)}
                      >
                        <h3 className="text-base font-semibold text-dark-navy mb-2 group-hover:text-primary-blue transition-colors truncate">
                          {memory.title || memory.original_text?.substring(0, 60)}
                        </h3>
                        <p className="text-secondary-navy text-sm mb-3 line-clamp-2">
                          {memory.summary || memory.original_text?.substring(0, 120)}
                        </p>
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className="text-xs text-secondary-navy">
                            {formatDate(memory.created_at)}
                          </span>
                          {memory.category && (
                            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${categoryColors.bg} ${categoryColors.text}`}>
                              {memory.category}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Action Menu */}
                      <div className="flex gap-2 flex-shrink-0">
                        <button
                          onClick={() => navigate(`/memory/${memory.id}`)}
                          className="px-3 py-2 text-dark-navy hover:text-primary-blue rounded-lg hover:bg-very-light transition-colors text-sm font-medium"
                          title="View memory"
                        >
                          👁️
                        </button>
                        <button
                          onClick={() => setDeleteId(memory.id)}
                          className="px-3 py-2 text-dark-navy hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium"
                          title="Delete memory"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>

                    {/* Delete confirmation */}
                    {deleteId === memory.id && (
                      <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between gap-4">
                        <p className="text-red-700 text-sm font-medium">Delete this memory permanently?</p>
                        <div className="flex gap-2 flex-shrink-0">
                          <button
                            onClick={() => handleDelete(memory.id)}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-semibold transition-colors"
                          >
                            Delete
                          </button>
                          <button
                            onClick={() => setDeleteId(null)}
                            className="px-4 py-2 bg-white border border-red-200 text-dark-navy rounded-lg hover:bg-red-50 text-sm font-semibold transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
