import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../services/api'
import Sidebar from '../components/Sidebar'

export default function MemoryDetailsPage() {
  const { id } = useParams()
  const [memory, setMemory] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    fetchMemory()
  }, [id])

  const fetchMemory = async () => {
    try {
      const response = await api.get(`/memories/${id}`)
      setMemory(response.data)
    } catch (err) {
      setError('Failed to load memory')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    try {
      await api.delete(`/memories/${id}`)
      navigate('/memories')
    } catch (err) {
      setError('Failed to delete memory')
    }
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="flex h-screen bg-very-light overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-blue"></div>
        </div>
      </div>
    )
  }

  if (error || !memory) {
    return (
      <div className="flex h-screen bg-very-light overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <div className="text-5xl mb-4">⚠️</div>
          <p className="text-red-600 font-semibold">{error}</p>
          <button
            onClick={() => navigate('/memories')}
            className="mt-6 text-primary-blue font-semibold hover:underline"
          >
            ← Back to Memories
          </button>
        </div>
      </div>
    )
  }

  const extracted = memory.extracted_data || {}

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

  const categoryColors = getCategoryColor(memory.category)

  return (
    <div className="flex h-screen bg-very-light overflow-hidden">
      <Sidebar />
      
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <div className="bg-white border-b border-border-color sticky top-0 z-10">
          <div className="px-6 md:px-10 py-6">
            <button
              onClick={() => navigate('/memories')}
              className="text-primary-blue hover:text-blue-700 font-semibold text-sm mb-4 inline-flex items-center gap-2 transition-colors"
            >
              ← Back to Memories
            </button>
            
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h1 className="text-3xl md:text-4xl font-bold text-dark-navy mb-2">
                  {memory.title || 'Untitled Memory'}
                </h1>
                <div className="flex items-center gap-3 text-secondary-navy text-sm">
                  <span>📅 {formatDate(memory.created_at)}</span>
                  {memory.category && (
                    <span className={`px-3 py-1 font-semibold rounded-full text-xs ${categoryColors.bg} ${categoryColors.text}`}>
                      {memory.category}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <main className="px-6 md:px-10 py-8 max-w-4xl mx-auto">
          {/* Original Text */}
          <section className="mb-8">
            <div className="card p-8 bg-white">
              <h2 className="text-lg font-semibold text-dark-navy mb-4 flex items-center gap-2">
                <span>📝</span>
                Original Text
              </h2>
              <p className="text-dark-navy leading-relaxed text-base whitespace-pre-wrap">
                {memory.original_text}
              </p>
            </div>
          </section>

          {/* Summary */}
          {memory.summary && (
            <section className="mb-8">
              <div className="card p-8 bg-white">
                <h2 className="text-lg font-semibold text-dark-navy mb-4 flex items-center gap-2">
                  <span>✨</span>
                  Summary
                </h2>
                <p className="text-dark-navy leading-relaxed text-base">
                  {memory.summary}
                </p>
              </div>
            </section>
          )}

          {/* AI Extracted Information */}
          {Object.keys(extracted).length > 0 && (
            <section className="mb-8">
              <div className="card p-8 bg-white">
                <h2 className="text-lg font-semibold text-dark-navy mb-6 flex items-center gap-2">
                  <span>🧠</span>
                  AI Extracted Information
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {extracted.people && extracted.people.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-secondary-navy uppercase tracking-wide mb-4">👥 People</h3>
                      <div className="flex flex-wrap gap-2">
                        {extracted.people.map((person, i) => (
                          <span key={i} className="px-3 py-2 bg-light-blue text-primary-blue text-sm font-medium rounded-full">
                            {person}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {extracted.places && extracted.places.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-secondary-navy uppercase tracking-wide mb-4">📍 Places</h3>
                      <div className="flex flex-wrap gap-2">
                        {extracted.places.map((place, i) => (
                          <span key={i} className="px-3 py-2 bg-light-blue text-primary-blue text-sm font-medium rounded-full">
                            {place}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {extracted.dates && extracted.dates.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-secondary-navy uppercase tracking-wide mb-4">📅 Dates</h3>
                      <div className="flex flex-wrap gap-2">
                        {extracted.dates.map((date, i) => (
                          <span key={i} className="px-3 py-2 bg-light-blue text-primary-blue text-sm font-medium rounded-full">
                            {date}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {extracted.tasks && extracted.tasks.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-secondary-navy uppercase tracking-wide mb-4">✓ Tasks</h3>
                      <div className="flex flex-wrap gap-2">
                        {extracted.tasks.map((task, i) => (
                          <span key={i} className="px-3 py-2 bg-light-blue text-primary-blue text-sm font-medium rounded-full">
                            {task}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {extracted.tags && extracted.tags.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-secondary-navy uppercase tracking-wide mb-4">🏷️ Tags</h3>
                      <div className="flex flex-wrap gap-2">
                        {extracted.tags.map((tag, i) => (
                          <span key={i} className="px-3 py-2 bg-very-light text-dark-navy text-sm font-medium rounded-full border border-border-color">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </section>
          )}

          {/* Actions */}
          <section className="mb-8">
            <div className="flex gap-3">
              <button
                onClick={() => navigate(`/memory/${id}/edit`)}
                className="btn-primary"
              >
                Edit Memory
              </button>
              <button
                onClick={() => setDeleteConfirm(true)}
                className="px-6 py-3 rounded-10 border border-red-200 text-red-600 font-semibold hover:bg-red-50 transition-colors"
              >
                Delete
              </button>
            </div>

            {deleteConfirm && (
              <div className="card p-6 bg-red-50 border border-red-200 mt-4">
                <p className="text-red-700 font-semibold mb-4">Are you sure you want to delete this memory? This action cannot be undone.</p>
                <div className="flex gap-3">
                  <button
                    onClick={handleDelete}
                    className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold transition-colors"
                  >
                    Yes, Delete
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(false)}
                    className="px-6 py-2 bg-white border border-red-200 text-dark-navy rounded-lg hover:bg-red-50 font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  )
}
