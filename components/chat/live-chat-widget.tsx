"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { MessageCircle, X, Send, Minimize2, Phone, Calendar, CreditCard, AlertTriangle, Bot } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Message {
  id: string
  text: string
  sender: "user" | "agent" | "bot"
  timestamp: Date
  type?: "text" | "quick-action" | "system"
}

interface QuickAction {
  id: string
  label: string
  icon: React.ElementType
  action: string
  color: string
}

const quickActions: QuickAction[] = [
  {
    id: "book",
    label: "Book Appointment",
    icon: Calendar,
    action: "book_appointment",
    color: "bg-blue-500 hover:bg-blue-600",
  },
  {
    id: "pricing",
    label: "View Pricing",
    icon: CreditCard,
    action: "view_pricing",
    color: "bg-green-500 hover:bg-green-600",
  },
  {
    id: "support",
    label: "Get Support",
    icon: Phone,
    action: "get_support",
    color: "bg-purple-500 hover:bg-purple-600",
  },
  {
    id: "emergency",
    label: "Emergency Help",
    icon: AlertTriangle,
    action: "emergency_help",
    color: "bg-red-500 hover:bg-red-600",
  },
]

const initialMessages: Message[] = [
  {
    id: "1",
    text: "Hello! Welcome to Flexicure. How can I help you today?",
    sender: "bot",
    timestamp: new Date(),
    type: "text",
  },
]

export function LiveChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [agentStatus, setAgentStatus] = useState<"online" | "busy" | "offline">("online")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0)
      inputRef.current?.focus()
    }
  }, [isOpen])

  const handleSendMessage = () => {
    if (!inputValue.trim()) return

    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: "user",
      timestamp: new Date(),
      type: "text",
    }

    setMessages((prev) => [...prev, newMessage])
    setInputValue("")
    setIsTyping(true)

    // Simulate agent response
    setTimeout(() => {
      setIsTyping(false)
      const responses = [
        "Thank you for your message. Let me help you with that.",
        "I understand your concern. Let me connect you with the right specialist.",
        "That's a great question! Here's what I can tell you...",
        "I'd be happy to assist you with that. Let me gather some information.",
      ]

      const agentResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: responses[Math.floor(Math.random() * responses.length)],
        sender: "agent",
        timestamp: new Date(),
        type: "text",
      }

      setMessages((prev) => [...prev, agentResponse])

      if (!isOpen) {
        setUnreadCount((prev) => prev + 1)
      }
    }, 1500)
  }

  const handleQuickAction = (action: QuickAction) => {
    const actionMessage: Message = {
      id: Date.now().toString(),
      text: `I'd like to ${action.label.toLowerCase()}`,
      sender: "user",
      timestamp: new Date(),
      type: "quick-action",
    }

    setMessages((prev) => [...prev, actionMessage])

    // Simulate agent response based on action
    setTimeout(() => {
      let response = ""
      switch (action.action) {
        case "book_appointment":
          response = "I'll help you book an appointment. Let me show you available time slots..."
          break
        case "view_pricing":
          response = "Here are our current pricing plans. We offer flexible options to suit your needs..."
          break
        case "get_support":
          response = "I'm here to help! What specific issue are you experiencing?"
          break
        case "emergency_help":
          response =
            "For medical emergencies, please call 911 immediately. For urgent care, I can connect you with our on-call team."
          break
        default:
          response = "Let me help you with that request."
      }

      const agentResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: response,
        sender: "agent",
        timestamp: new Date(),
        type: "text",
      }

      setMessages((prev) => [...prev, agentResponse])
    }, 1000)
  }

  const getStatusColor = () => {
    switch (agentStatus) {
      case "online":
        return "bg-green-500"
      case "busy":
        return "bg-yellow-500"
      case "offline":
        return "bg-gray-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusText = () => {
    switch (agentStatus) {
      case "online":
        return "Online"
      case "busy":
        return "Busy"
      case "offline":
        return "Offline"
      default:
        return "Unknown"
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: 0.2 }}
            className={`mb-4 bg-white dark:bg-gray-800 rounded-lg shadow-2xl border ${
              isMinimized ? "w-80 h-16" : "w-80 h-96"
            } flex flex-col overflow-hidden`}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/placeholder.svg?height=32&width=32" />
                  <AvatarFallback>
                    <Bot className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-sm">Flexicure Support</h3>
                  <div className="flex items-center space-x-1">
                    <div className={`w-2 h-2 rounded-full ${getStatusColor()}`}></div>
                    <span className="text-xs opacity-90">{getStatusText()}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="text-white hover:bg-white/20 p-1 h-auto"
                >
                  <Minimize2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="text-white hover:bg-white/20 p-1 h-auto"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[80%] p-3 rounded-lg ${
                            message.sender === "user"
                              ? "bg-green-600 text-white"
                              : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                          }`}
                        >
                          <p className="text-sm">{message.text}</p>
                          <p className="text-xs opacity-70 mt-1">
                            {message.timestamp.toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                    ))}

                    {isTyping && (
                      <div className="flex justify-start">
                        <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div
                              className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                              style={{ animationDelay: "0.1s" }}
                            ></div>
                            <div
                              className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                              style={{ animationDelay: "0.2s" }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                {/* Quick Actions */}
                <div className="p-3 border-t border-gray-200 dark:border-gray-700">
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    {quickActions.map((action) => (
                      <Button
                        key={action.id}
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuickAction(action)}
                        className={`${action.color} text-white border-0 text-xs py-1 h-auto`}
                      >
                        <action.icon className="h-3 w-3 mr-1" />
                        {action.label}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Input */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex space-x-2">
                    <Input
                      ref={inputRef}
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                      placeholder="Type your message..."
                      className="flex-1 text-sm"
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!inputValue.trim()}
                      size="sm"
                      className="bg-green-600 hover:bg-green-700 text-white px-3"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 relative"
      >
        <MessageCircle className="h-6 w-6" />
        {unreadCount > 0 && (
          <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs min-w-[20px] h-5 flex items-center justify-center p-0">
            {unreadCount > 9 ? "9+" : unreadCount}
          </Badge>
        )}
      </motion.button>
    </div>
  )
}
