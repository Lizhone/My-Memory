import { useState, useRef, useEffect } from 'react'
import api from '../services/api'
import Sidebar from '../components/Sidebar'

export default function AskAIPage() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleAsk = async (e) => {
    e.preventDefault()

    if (!input.trim()) return

    const userMessage = input

    setInput('')

    setMessages((prev) => [
      ...prev,
      {
        role: 'user',
        content: userMessage
      }
    ])

    setLoading(true)

    try {
      const response = await api.post('/ai/ask', {
        question: userMessage
      })

      setMessages((prev) => [
        ...prev,
        {
          role: 'ai',
          content: response.data.answer,
          sources: response.data.sources
        }
      ])
    } catch (err) {
      console.error('Ask AI error:', err)

      setMessages((prev) => [
        ...prev,
        {
          role: 'ai',
          content:
            "I couldn't find anything about that in your memories. Try asking something different!",
          error: true
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-screen bg-very-light overflow-hidden">
      <Sidebar />

      <div className="flex-1 overflow-hidden flex flex-col">
        {/* Header */}
        {messages.length === 0 && (
          <div className="bg-white border-b border-border-color">
            <div className="px-6 md:px-10 py-8">
              <h1 className="text-3xl md:text-4xl font-bold text-dark-navy mb-2">
                Ask My Memories
              </h1>

              <p className="text-secondary-navy">
                Ask anything about your saved information and I'll find the
                answers.
              </p>
            </div>
          </div>
        )}

        {/* Chat Area */}
        <div className="flex-1 overflow-auto">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center p-8">
              <div className="text-center max-w-2xl">
                {/* Brain illustration */}
                <div className="flex justify-center mb-7">
                  <div
                    className="
                      w-20
                      h-20
                      rounded-3xl
                      bg-gradient-to-br
                      from-blue-50
                      to-purple-100
                      flex
                      items-center
                      justify-center
                      shadow-sm
                    "
                  >
                    <BrainIcon
                      size={52}
                      color="#2563EB"
                    />
                  </div>
                </div>

                <h2 className="text-2xl font-bold text-dark-navy mb-3">
                  Start a Conversation
                </h2>

                <p className="text-secondary-navy max-w-lg mx-auto leading-relaxed">
                  Ask questions about your memories. Use natural language and
                  I'll search through everything you've saved.
                </p>

                {/* Example Questions */}
                <div className="mt-8 space-y-3">
                  <p className="text-sm text-secondary-navy font-semibold">
                    Example questions:
                  </p>

                  <div className="flex flex-wrap gap-2 justify-center">
                    {[
                      'Where did I meet Sarah?',
                      'What restaurants were recommended?',
                      'What tasks did I note?'
                    ].map((example, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          setInput(example)
                        }}
                        className="
                          px-4
                          py-2.5
                          bg-white
                          border
                          border-border-color
                          text-dark-navy
                          rounded-xl
                          hover:border-primary-blue
                          hover:bg-light-blue
                          transition-all
                          text-sm
                          font-medium
                        "
                      >
                        {example}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="px-6 md:px-10 py-8 max-w-3xl mx-auto w-full">
              <div className="space-y-6">
                {messages.map((msg, idx) => (
                  <div key={idx}>
                    {/* Message */}
                    <div
                      className={`mb-4 flex ${
                        msg.role === 'user'
                          ? 'justify-end'
                          : 'justify-start'
                      }`}
                    >
                      {msg.role === 'ai' ? (
                        /* AI message with brain icon */
                        <div className="flex items-start gap-3 max-w-2xl">
                          <div
                            className="
                              w-9
                              h-9
                              rounded-xl
                              bg-blue-50
                              flex
                              items-center
                              justify-center
                              flex-shrink-0
                              mt-1
                            "
                          >
                            <BrainIcon
                              size={24}
                              color="#2563EB"
                            />
                          </div>

                          <div
                            className={`
                              max-w-lg
                              px-6
                              py-4
                              rounded-2xl
                              card
                              bg-white
                              text-dark-navy
                              rounded-bl-none
                              ${
                                msg.error
                                  ? 'border-red-200'
                                  : ''
                              }
                            `}
                          >
                            <p className="text-base leading-relaxed whitespace-pre-wrap">
                              {msg.content}
                            </p>
                          </div>
                        </div>
                      ) : (
                        /* User message */
                        <div
                          className="
                            max-w-lg
                            px-6
                            py-4
                            rounded-2xl
                            bg-primary-blue
                            text-white
                            rounded-br-none
                            shadow-sm
                          "
                        >
                          <p className="text-base leading-relaxed whitespace-pre-wrap">
                            {msg.content}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Source Memories */}
                    {msg.sources && msg.sources.length > 0 && (
                      <div className="mb-6 ml-4 md:ml-12">
                        <p
                          className="
                            text-sm
                            font-semibold
                            text-secondary-navy
                            mb-3
                            flex
                            items-center
                            gap-2
                          "
                        >
                          <SourceIcon
                            size={17}
                            color="#2563EB"
                          />

                          Source Memories ({msg.sources.length})
                        </p>

                        <div className="space-y-3">
                          {msg.sources.map((source, i) => (
                            <div
                              key={i}
                              className="
                                card
                                p-4
                                bg-white
                                hover:shadow-md
                                transition-shadow
                                border
                                border-border-color
                                cursor-pointer
                              "
                            >
                              <p
                                className="
                                  text-sm
                                  font-semibold
                                  text-dark-navy
                                  mb-1
                                "
                              >
                                {source.title ||
                                  source.original_text?.substring(
                                    0,
                                    60
                                  )}
                              </p>

                              <p
                                className="
                                  text-xs
                                  text-secondary-navy
                                  line-clamp-2
                                "
                              >
                                {source.summary ||
                                  source.original_text?.substring(
                                    0,
                                    100
                                  )}
                              </p>

                              {source.category && (
                                <span
                                  className="
                                    inline-block
                                    mt-2
                                    px-2
                                    py-1
                                    text-xs
                                    font-semibold
                                    bg-light-blue
                                    text-primary-blue
                                    rounded-full
                                  "
                                >
                                  {source.category}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {/* Loading */}
                {loading && (
                  <div className="flex justify-start">
                    <div className="flex items-start gap-3">
                      <div
                        className="
                          w-9
                          h-9
                          rounded-xl
                          bg-blue-50
                          flex
                          items-center
                          justify-center
                          flex-shrink-0
                          mt-1
                        "
                      >
                        <BrainIcon
                          size={24}
                          color="#2563EB"
                        />
                      </div>

                      <div
                        className="
                          card
                          bg-white
                          px-6
                          py-4
                          rounded-2xl
                          rounded-bl-none
                        "
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className="
                              w-2
                              h-2
                              bg-primary-blue
                              rounded-full
                              animate-bounce
                            "
                          />

                          <span
                            className="
                              w-2
                              h-2
                              bg-primary-blue
                              rounded-full
                              animate-bounce
                            "
                            style={{
                              animationDelay: '0.1s'
                            }}
                          />

                          <span
                            className="
                              w-2
                              h-2
                              bg-primary-blue
                              rounded-full
                              animate-bounce
                            "
                            style={{
                              animationDelay: '0.2s'
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div
          className="
            bg-white
            border-t
            border-border-color
            p-6
            md:p-8
          "
        >
          <form
            onSubmit={handleAsk}
            className="max-w-3xl mx-auto flex gap-3"
          >
            <div className="flex-1 relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  messages.length === 0
                    ? 'Ask a question about your memories...'
                    : 'Ask another question...'
                }
                className="
                  card
                  w-full
                  px-4
                  py-3
                  border
                  border-border-color
                  rounded-xl
                  focus:outline-none
                  focus:ring-2
                  focus:ring-primary-blue
                  focus:ring-offset-2
                  focus:ring-offset-very-light
                  text-dark-navy
                  placeholder-gray-400
                "
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="
                btn-primary
                px-6
                flex-shrink-0
                rounded-xl
                flex
                items-center
                justify-center
              "
              aria-label="Ask question"
            >
              {loading ? (
                <LoadingIcon size={20} />
              ) : (
                <ArrowIcon
                  size={20}
                  color="currentColor"
                />
              )}
            </button>
          </form>

          <p
            className="
              text-xs
              text-secondary-navy
              text-center
              mt-3
            "
          >
            Searching your{' '}
            {messages.length > 0
              ? 'memories for context'
              : 'saved memories...'}
          </p>
        </div>
      </div>
    </div>
  )
}

/* ==================================================
   Brain SVG
================================================== */

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

/* ==================================================
   Source SVG
================================================== */

function SourceIcon({ size = 20, color = '#2563EB' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="
          M8.5 12.5
          L13.7 7.3
          C15 6 17.1 6 18.4 7.3
          C19.7 8.6 19.7 10.7 18.4 12
          L11 19.4
          C8.8 21.6 5.2 21.6 3 19.4
          C0.8 17.2 0.8 13.6 3 11.4
          L10.4 4
          C12.3 2.1 15.4 2.1 17.3 4
        "
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M7 15L14.5 7.5"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  )
}

/* ==================================================
   Arrow SVG
================================================== */

function ArrowIcon({ size = 20, color = 'currentColor' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M5 12H18"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />

      <path
        d="M13 7L18 12L13 17"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/* ==================================================
   Loading SVG
================================================== */

function LoadingIcon({ size = 20 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className="animate-spin"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="currentColor"
        strokeWidth="2"
        strokeDasharray="32"
        strokeLinecap="round"
      />
    </svg>
  )
}