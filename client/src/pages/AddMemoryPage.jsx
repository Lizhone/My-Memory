import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import Sidebar from '../components/Sidebar'

export default function AddMemoryPage() {
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [extracted, setExtracted] = useState(null)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSave = async (e) => {
    e.preventDefault()
    if (!text.trim()) return

    setLoading(true)
    setError('')

    try {
      const response = await api.post('/memories', { text })

      setExtracted(response.data.extracted)
      
      // Show success message after 2 seconds
      setTimeout(() => {
        navigate('/memories')
      }, 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save memory. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (extracted) {
    return (
      <div className="flex h-screen bg-very-light overflow-hidden">
        <Sidebar />
        
        <div className="flex-1 overflow-auto flex items-center justify-center p-6 md:p-8">
          <div className="w-full max-w-2xl">
            <div className="text-center mb-10">
              <div className="text-6xl mb-4">✨</div>
              <h1 className="text-3xl md:text-4xl font-bold text-dark-navy mb-3">Memory Saved!</h1>
              <p className="text-secondary-navy text-lg">
                AI extracted and organized your memory
              </p>
            </div>

            {/* Extracted Information */}
            <div className="card p-8 mb-8 bg-white">
              <h2 className="text-lg font-semibold text-dark-navy mb-6 flex items-center">
                <span className="text-xl mr-2">🧠</span>
                What We Found
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {extracted.title && (
                  <div className="pb-4 border-b border-border-color md:border-b-0">
                    <p className="text-xs font-semibold text-secondary-navy uppercase tracking-wide mb-2">Title</p>
                    <p className="text-dark-navy font-medium">{extracted.title}</p>
                  </div>
                )}
                {extracted.category && (
                  <div className="pb-4 border-b border-border-color md:border-b-0">
                    <p className="text-xs font-semibold text-secondary-navy uppercase tracking-wide mb-2">Category</p>
                    <span className="inline-block px-4 py-2 bg-light-blue text-primary-blue text-sm font-semibold rounded-full">
                      {extracted.category}
                    </span>
                  </div>
                )}
                {extracted.people && extracted.people.length > 0 && (
                  <div className="pb-4 border-b border-border-color md:border-b-0">
                    <p className="text-xs font-semibold text-secondary-navy uppercase tracking-wide mb-3">People</p>
                    <div className="flex flex-wrap gap-2">
                      {extracted.people.map((person, i) => (
                        <span key={i} className="px-3 py-1 bg-very-light text-dark-navy text-sm font-medium rounded-full border border-border-color">
                          {person}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {extracted.places && extracted.places.length > 0 && (
                  <div className="pb-4 border-b border-border-color md:border-b-0">
                    <p className="text-xs font-semibold text-secondary-navy uppercase tracking-wide mb-3">Places</p>
                    <div className="flex flex-wrap gap-2">
                      {extracted.places.map((place, i) => (
                        <span key={i} className="px-3 py-1 bg-very-light text-dark-navy text-sm font-medium rounded-full border border-border-color">
                          📍 {place}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {extracted.dates && extracted.dates.length > 0 && (
                  <div className="pb-4 border-b border-border-color md:border-b-0">
                    <p className="text-xs font-semibold text-secondary-navy uppercase tracking-wide mb-3">Dates</p>
                    <div className="flex flex-wrap gap-2">
                      {extracted.dates.map((date, i) => (
                        <span key={i} className="px-3 py-1 bg-very-light text-dark-navy text-sm font-medium rounded-full border border-border-color">
                          📅 {date}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {extracted.tasks && extracted.tasks.length > 0 && (
                  <div className="pb-4 border-b border-border-color md:border-b-0">
                    <p className="text-xs font-semibold text-secondary-navy uppercase tracking-wide mb-3">Tasks</p>
                    <div className="flex flex-wrap gap-2">
                      {extracted.tasks.map((task, i) => (
                        <span key={i} className="px-3 py-1 bg-very-light text-dark-navy text-sm font-medium rounded-full border border-border-color">
                          ✓ {task}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {extracted.tags && extracted.tags.length > 0 && (
                  <div className="pb-4 border-b border-border-color md:border-b-0">
                    <p className="text-xs font-semibold text-secondary-navy uppercase tracking-wide mb-3">Tags</p>
                    <div className="flex flex-wrap gap-2">
                      {extracted.tags.map((tag, i) => (
                        <span key={i} className="px-3 py-1 bg-light-blue text-primary-blue text-sm font-medium rounded-full">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="text-center">
              <p className="text-secondary-navy text-sm">
                Redirecting to your memories in a moment...
              </p>
              <div className="mt-4">
                <button
                  onClick={() => navigate('/memories')}
                  className="text-primary-blue font-semibold hover:text-blue-700 transition-colors"
                >
                  Go to All Memories →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-very-light overflow-hidden">
      <Sidebar />
      
      <div className="flex-1 overflow-auto">
        <div className="bg-white border-b border-border-color sticky top-0 z-10">
          <div className="px-6 md:px-10 py-8">
            <h1 className="text-3xl md:text-4xl font-bold text-dark-navy mb-2">Add a Memory</h1>
            <p className="text-secondary-navy">
              Write naturally. AI will understand and organize it for you.
            </p>
          </div>
        </div>

        <main className="px-6 md:px-10 py-8 max-w-3xl mx-auto">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-12 text-red-700 flex items-start gap-3">
              <span className="text-xl flex-shrink-0">⚠️</span>
              <span className="text-sm">{error}</span>
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-6">
            <div>
              <label className="block text-dark-navy font-semibold mb-4 text-lg">Your Memory</label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Write anything you want to remember...

For example: I met Sarah today at the coffee shop downtown. She recommended a restaurant called Burma Burma, said their tea leaf salad is incredible. I should try it next week when I have time."
                className="card w-full px-6 py-5 border border-border-color rounded-12 focus:outline-none focus:ring-2 focus:ring-primary-blue focus:ring-offset-2 focus:ring-offset-very-light resize-none text-dark-navy placeholder-gray-400"
                rows="10"
                required
              />
              <div className="flex items-center justify-between mt-3">
                <p className="text-sm text-secondary-navy">
                  {text.length} characters
                </p>
                <p className="text-xs text-secondary-navy">
                  {text.length > 10 ? '✓ Ready to save' : 'Add more details'}
                </p>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={loading || !text.trim()}
                className="btn-primary"
              >
                {loading ? (
                  <>
                    <span className="inline-block animate-spin mr-2">⏳</span>
                    Processing...
                  </>
                ) : (
                  'Save Memory'
                )}
              </button>
              <button
                type="button"
                onClick={() => navigate('/')}
                className="px-6 py-3 rounded-10 border border-border-color text-dark-navy font-semibold hover:bg-very-light transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  )
}
