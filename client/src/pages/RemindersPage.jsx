import { useState, useEffect } from 'react'
import api from '../services/api'
import Sidebar from '../components/Sidebar'

export default function RemindersPage() {
  const [reminders, setReminders] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    reminder_date: ''
  })

  useEffect(() => {
    fetchReminders()
  }, [])

  const fetchReminders = async () => {
    try {
      const response = await api.get('/reminders')
      setReminders(response.data)
    } catch (err) {
      console.error('Failed to fetch reminders:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.title.trim() || !formData.reminder_date) return

    try {
      await api.post('/reminders', formData)
      setFormData({ title: '', description: '', reminder_date: '' })
      setShowForm(false)
      fetchReminders()
    } catch (err) {
      console.error('Failed to create reminder:', err)
    }
  }

  const handleDelete = async (id) => {
    try {
      await api.delete(`/reminders/${id}`)
      fetchReminders()
    } catch (err) {
      console.error('Failed to delete reminder:', err)
    }
  }

  const handleComplete = async (id, completed) => {
    try {
      await api.put(`/reminders/${id}`, { completed: !completed })
      fetchReminders()
    } catch (err) {
      console.error('Failed to update reminder:', err)
    }
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const upcomingReminders = reminders.filter(r => !r.completed)
  const completedReminders = reminders.filter(r => r.completed)

  return (
    <div className="flex h-screen bg-very-light overflow-hidden">
      <Sidebar />
      
      <div className="flex-1 overflow-auto">
        <div className="bg-white border-b border-border-color sticky top-0 z-10">
          <div className="px-6 md:px-10 py-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-dark-navy mb-2">Reminders</h1>
              <p className="text-secondary-navy">Never miss what matters</p>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="btn-primary"
            >
              {showForm ? '✕ Cancel' : '+ New Reminder'}
            </button>
          </div>
        </div>

        <main className="px-6 md:px-10 py-8 max-w-4xl">
          {/* Form */}
          {showForm && (
            <div className="card p-8 mb-12 bg-white">
              <h2 className="text-xl font-semibold text-dark-navy mb-6">Create a New Reminder</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-dark-navy font-semibold mb-3 text-sm">Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="card w-full px-4 py-3 border border-border-color rounded-10 focus:outline-none focus:ring-2 focus:ring-primary-blue focus:ring-offset-2 focus:ring-offset-very-light text-dark-navy placeholder-gray-400"
                    placeholder="e.g., Call Mom"
                    required
                  />
                </div>

                <div>
                  <label className="block text-dark-navy font-semibold mb-3 text-sm">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="card w-full px-4 py-3 border border-border-color rounded-10 focus:outline-none focus:ring-2 focus:ring-primary-blue focus:ring-offset-2 focus:ring-offset-very-light resize-none text-dark-navy placeholder-gray-400"
                    rows="3"
                    placeholder="Add optional details..."
                  />
                </div>

                <div>
                  <label className="block text-dark-navy font-semibold mb-3 text-sm">Date & Time *</label>
                  <input
                    type="datetime-local"
                    value={formData.reminder_date}
                    onChange={(e) => setFormData({ ...formData, reminder_date: e.target.value })}
                    className="card w-full px-4 py-3 border border-border-color rounded-10 focus:outline-none focus:ring-2 focus:ring-primary-blue focus:ring-offset-2 focus:ring-offset-very-light text-dark-navy"
                    required
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button type="submit" className="btn-primary">
                    Create Reminder
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-6 py-3 rounded-10 border border-border-color text-dark-navy font-semibold hover:bg-very-light transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-blue"></div>
            </div>
          ) : (
            <>
              {/* Upcoming */}
              <section className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <h2 className="text-2xl font-bold text-dark-navy">Upcoming</h2>
                  {upcomingReminders.length > 0 && (
                    <span className="text-sm bg-primary-blue text-white px-3 py-1 rounded-full font-semibold">
                      {upcomingReminders.length}
                    </span>
                  )}
                </div>
                {upcomingReminders.length === 0 ? (
                  <div className="card p-12 text-center bg-white">
                    <div className="text-4xl mb-4">✓</div>
                    <p className="text-secondary-navy font-medium">No upcoming reminders</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {upcomingReminders.map((reminder) => (
                      <div key={reminder.id} className="card p-6 bg-white hover:shadow-md hover:border-primary-blue/30 transition-all duration-200">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-dark-navy mb-2">
                              {reminder.title}
                            </h3>
                            {reminder.description && (
                              <p className="text-secondary-navy text-sm mb-3 line-clamp-2">
                                {reminder.description}
                              </p>
                            )}
                            <div className="flex items-center gap-2 text-sm text-secondary-navy">
                              <span>🕐</span>
                              <span>{formatDate(reminder.reminder_date)}</span>
                            </div>
                          </div>
                          <div className="flex gap-2 flex-shrink-0">
                            <button
                              onClick={() => handleComplete(reminder.id, reminder.completed)}
                              className="px-4 py-2 text-sm font-semibold rounded-lg bg-light-blue text-primary-blue hover:bg-blue-200 transition-colors"
                              title="Mark as complete"
                            >
                              ✓
                            </button>
                            <button
                              onClick={() => handleDelete(reminder.id)}
                              className="px-4 py-2 text-sm font-semibold rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                              title="Delete reminder"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* Completed */}
              {completedReminders.length > 0 && (
                <section>
                  <div className="flex items-center gap-3 mb-6">
                    <h2 className="text-2xl font-bold text-dark-navy">Completed</h2>
                    <span className="text-sm bg-very-light text-secondary-navy px-3 py-1 rounded-full font-semibold">
                      {completedReminders.length}
                    </span>
                  </div>
                  <div className="space-y-3">
                    {completedReminders.map((reminder) => (
                      <div key={reminder.id} className="card p-6 bg-white opacity-70 hover:opacity-100 transition-opacity">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-dark-navy mb-2 line-through">
                              {reminder.title}
                            </h3>
                            {reminder.description && (
                              <p className="text-secondary-navy text-sm mb-3 line-clamp-2">
                                {reminder.description}
                              </p>
                            )}
                            <div className="flex items-center gap-2 text-sm text-secondary-navy">
                              <span>🕐</span>
                              <span>{formatDate(reminder.reminder_date)}</span>
                            </div>
                          </div>
                          <div className="flex-shrink-0">
                            <button
                              onClick={() => handleDelete(reminder.id)}
                              className="px-4 py-2 text-sm font-semibold rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                              title="Delete reminder"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  )
}
