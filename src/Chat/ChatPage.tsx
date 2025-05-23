import React, { useState, useEffect, useRef } from 'react'
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Divider,
  Avatar,
  CircularProgress
} from '@mui/material'
import { ChatMessage } from './ChatMessage.entity'
import { remult } from 'remult'
import RefreshIcon from '@mui/icons-material/Refresh'
import SmartToyIcon from '@mui/icons-material/SmartToy'
import PersonIcon from '@mui/icons-material/Person'
import MicIcon from '@mui/icons-material/Mic'
import MicOffIcon from '@mui/icons-material/MicOff'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

// Add complete type definitions for Web Speech API
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList
  resultIndex: number
  interpretation: any
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string
  message: string
}

interface SpeechRecognitionResultList {
  length: number
  item(index: number): SpeechRecognitionResult
  [index: number]: SpeechRecognitionResult
}

interface SpeechRecognitionResult {
  isFinal: boolean
  length: number
  item(index: number): SpeechRecognitionAlternative
  [index: number]: SpeechRecognitionAlternative
}

interface SpeechRecognitionAlternative {
  transcript: string
  confidence: number
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  start(): void
  stop(): void
  abort(): void
  onresult: (event: SpeechRecognitionEvent) => void
  onerror: (event: SpeechRecognitionErrorEvent) => void
  onend: () => void
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition
    webkitSpeechRecognition: new () => SpeechRecognition
  }
}

const thinkingMessages = [
  'Processing your request... 🤔',
  'Analyzing the best response... 🧠',
  'Consulting my neural networks... 🤖',
  'Gathering insights from the data... 📊',
  'Connecting the dots... 🔄',
  'Running advanced algorithms... ⚡',
  'Thinking like a human... 🤔',
  'Accessing my knowledge base... 📚',
  'Calculating probabilities... 🎯',
  'Optimizing response parameters... ⚙️'
]

export const ChatPage: React.FC = () => {
  // const [message, setMessage] = useState('Give me the list of managers')
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(false)
  const [sessionId, setSessionId] = useState<string>('')
  const [thinkingMessage, setThinkingMessage] = useState<string>('')
  const [isListening, setIsListening] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const thinkingIntervalRef = useRef<NodeJS.Timeout>()
  const recognitionRef = useRef<SpeechRecognition | null>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    createNewSession()
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, thinkingMessage])

  useEffect(() => {
    // Initialize speech recognition
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = false
      recognitionRef.current.interimResults = false
      recognitionRef.current.lang = 'en-US'

      recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0][0].transcript
        setMessage(transcript)
        handleSubmit()
      }

      recognitionRef.current.onend = () => {
        setIsListening(false)
      }

      recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error:', event.error)
        setIsListening(false)
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [])

  const getRandomThinkingMessage = () => {
    return thinkingMessages[Math.floor(Math.random() * thinkingMessages.length)]
  }

  const startThinking = () => {
    setThinkingMessage(getRandomThinkingMessage())
    thinkingIntervalRef.current = setInterval(() => {
      setThinkingMessage(getRandomThinkingMessage())
    }, 2000)
  }

  const stopThinking = () => {
    if (thinkingIntervalRef.current) {
      clearInterval(thinkingIntervalRef.current)
    }
    setThinkingMessage('')
  }

  const createNewSession = async () => {
    const newSessionId = await ChatMessage.createNewSession()
    setSessionId(newSessionId)
    setMessages([])
  }

  const handleSubmit = async () => {
    if (!message.trim() || !sessionId) return

    setLoading(true)
    const userMessage = message
    setMessage('')

    // Add user message immediately
    const tempUserMessage = {
      id: 'temp-user-' + Date.now(),
      message: userMessage,
      response: '',
      sessionId,
      accountManagerId: remult.user?.id || '',
      createdAt: new Date()
    } as ChatMessage

    setMessages((prev) => [...prev, tempUserMessage])
    startThinking()

    try {
      const response = await ChatMessage.llmsChat(userMessage, sessionId)

      // Save the message to the database
      const savedMessage = await remult.repo(ChatMessage).insert({
        message: userMessage,
        response,
        sessionId,
        accountManagerId: remult.user?.id || ''
      })

      // Replace the temporary message with the saved one
      setMessages((prev) =>
        prev.map((msg) => (msg.id === tempUserMessage.id ? savedMessage : msg))
      )
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setLoading(false)
      stopThinking()
    }
  }

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.ctrlKey && event.key === 'Enter') {
      event.preventDefault()
      handleSubmit()
    }
  }

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in your browser.')
      return
    }

    if (isListening) {
      recognitionRef.current.stop()
    } else {
      recognitionRef.current.start()
      setIsListening(true)
    }
  }

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Paper sx={{ p: 2 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 2
          }}
        >
          <Typography variant="h5">Chat with CRM</Typography>
          <IconButton
            onClick={createNewSession}
            title="Start new session"
            color="primary"
          >
            <RefreshIcon />
          </IconButton>
        </Box>

        <Box
          sx={{
            height: '50vh',
            overflow: 'auto',
            mb: 2,
            p: 2,
            backgroundColor: 'background.default',
            borderRadius: 1,
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {messages.length === 0 ? (
            <Typography color="text.secondary" align="center">
              Start a conversation by typing a message below
            </Typography>
          ) : (
            <List sx={{ width: '100%' }}>
              {messages.map((msg) => (
                <React.Fragment key={msg.id}>
                  {/* User Message */}
                  <ListItem
                    alignItems="flex-start"
                    sx={{
                      justifyContent: 'flex-end',
                      px: 1
                    }}
                  >
                    <Box
                      sx={{
                        maxWidth: '70%',
                        backgroundColor: 'primary.main',
                        color: 'primary.contrastText',
                        borderRadius: 2,
                        p: 1.5,
                        px: 2
                      }}
                    >
                      <Typography variant="body1">{msg.message}</Typography>
                    </Box>
                    <Avatar
                      sx={{ ml: 1 }}
                      alt={remult.user?.name}
                      src={remult.user!.avatar}
                    ></Avatar>
                  </ListItem>

                  {/* Assistant Message or Thinking State */}
                  <ListItem
                    alignItems="flex-start"
                    sx={{
                      justifyContent: 'flex-start',
                      px: 1
                    }}
                  >
                    <Avatar sx={{ mr: 1, bgcolor: 'grey.500' }}>
                      <SmartToyIcon />
                    </Avatar>
                    <Box
                      sx={{
                        maxWidth: '90%',
                        backgroundColor: 'grey.100',
                        borderRadius: 2,
                        p: 1.5,
                        px: 2,
                        display: 'flex',
                        // alignItems: 'center',
                        flexDirection: 'column',
                        gap: 1,
                        '& pre': {
                          backgroundColor: 'grey.200',
                          padding: 2,
                          borderRadius: 1,
                          overflowX: 'auto',
                          margin: '8px 0'
                        },
                        '& code': {
                          backgroundColor: 'grey.200',
                          padding: '2px 4px',
                          borderRadius: 1,
                          fontFamily: 'monospace'
                        }
                      }}
                    >
                      {msg.id === messages[messages.length - 1].id &&
                      thinkingMessage ? (
                        <Box
                          sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                        >
                          <CircularProgress size={16} />
                          <Typography variant="body1">
                            {thinkingMessage}
                          </Typography>
                        </Box>
                      ) : (
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            p: ({ children }) => (
                              <Typography variant="body1" component="div">
                                {children}
                              </Typography>
                            ),
                            code: ({
                              node,
                              inline,
                              className,
                              children
                            }: any) => {
                              const match = /language-(\w+)/.exec(
                                className || ''
                              )
                              return !inline ? (
                                <pre>
                                  <code
                                    className={
                                      match ? `language-${match[1]}` : ''
                                    }
                                  >
                                    {String(children).replace(/\n$/, '')}
                                  </code>
                                </pre>
                              ) : (
                                <code className={className}>{children}</code>
                              )
                            }
                          }}
                        >
                          {msg.response}
                        </ReactMarkdown>
                      )}
                    </Box>
                  </ListItem>
                </React.Fragment>
              ))}
              <div ref={messagesEndRef} />
            </List>
          )}
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ position: 'relative' }}>
          <TextField
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            placeholder="Type your message here... (Ctrl + Enter to send)"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            sx={{ mb: 2 }}
          />
          <IconButton
            onClick={toggleListening}
            sx={{
              position: 'absolute',
              right: 8,
              bottom: 16,
              backgroundColor: isListening ? 'error.main' : 'primary.main',
              color: 'white',
              '&:hover': {
                backgroundColor: isListening ? 'error.dark' : 'primary.dark'
              }
            }}
          >
            {isListening ? <MicOffIcon /> : <MicIcon />}
          </IconButton>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            disabled={!message.trim() || loading || !sessionId}
          >
            {loading ? 'Sending...' : 'Ask to CRM'}
          </Button>
        </Box>
      </Paper>
    </Box>
  )
}
