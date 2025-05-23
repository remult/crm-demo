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
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(false)
  const [sessionId, setSessionId] = useState<string>('')
  const [thinkingMessage, setThinkingMessage] = useState<string>('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const thinkingIntervalRef = useRef<NodeJS.Timeout>()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    createNewSession()
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, thinkingMessage])

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
            height: '60vh',
            overflow: 'auto',
            mb: 2,
            p: 2,
            backgroundColor: 'background.default',
            borderRadius: 1
          }}
        >
          {messages.length === 0 ? (
            <Typography color="text.secondary" align="center">
              Start a conversation by typing a message below
            </Typography>
          ) : (
            <List>
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
                        maxWidth: '70%',
                        backgroundColor: 'grey.100',
                        borderRadius: 2,
                        p: 1.5,
                        px: 2,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                      }}
                    >
                      {msg.id === messages[messages.length - 1].id &&
                      thinkingMessage ? (
                        <>
                          <CircularProgress size={16} />
                          <Typography variant="body1">
                            {thinkingMessage}
                          </Typography>
                        </>
                      ) : (
                        <Typography variant="body1">{msg.response}</Typography>
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
