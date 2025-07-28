"use client"

import { useState, useEffect, useRef } from "react"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Plus, Edit, Trash2, Users, Settings, FileText, Eye, Download, Save } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import Chatbot from '../components/Chatbot'

interface RegistrationField {
  id: string
  label: string
  type: "text" | "email" | "number" | "select" | "textarea"
  required: boolean
  options?: string[]
  placeholder?: string
}

interface Event {
  _id?: string
  id?: number
  title: string
  date: string
  time: string
  location: string
  description: string
  fullDescription: string
  speaker: string
  capacity: number
  registered: number
  category: string
  image: string
  registrationFields: RegistrationField[]
  isActive: boolean
  registeredUsers?: string[]
  registrations?: any[]
}

function safeJson(res: Response) {
  return res.text().then((text) => {
    try {
      return text ? JSON.parse(text) : []
    } catch {
      return []
    }
  })
}

function exportRegistrationsToCSV(event: Event, allUsers: any[]) {
  if (!Array.isArray(event.registeredUsers) || event.registeredUsers.length === 0) return
  
  let allFields: string[] = []
  if (Array.isArray(event.registrations)) {
    event.registrations.forEach((reg: any) => {
      if (reg.data) {
        Object.keys(reg.data).forEach((field) => {
          if (!allFields.includes(field)) allFields.push(field)
        })
      }
    })
  }
  
  const header = ['Name', 'Email', ...allFields]
  const rows = event.registeredUsers.map((userId) => {
    const userObj = allUsers.find((u) => u._id === userId)
    const reg = Array.isArray(event.registrations)
      ? event.registrations.find((r: any) => r.userId === userId)
      : null
    const row = [userObj ? userObj.name : userId, userObj ? userObj.email : '']
    allFields.forEach((field) => {
      row.push(reg && reg.data && reg.data[field] !== undefined ? reg.data[field] : '')
    })
    return row
  })
  
  const csvContent = [header, ...rows].map((row) => row.map((v) => `"${v}"`).join(',')).join('\n')
  const blob = new Blob([csvContent], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${event.title}_registrations.csv`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("events")
  const [events, setEvents] = useState<Event[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [quizzes, setQuizzes] = useState<any[]>([])
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const [editingUser, setEditingUser] = useState<any>(null)
  const [editingQuiz, setEditingQuiz] = useState<any>(null)
  const [showCreateEvent, setShowCreateEvent] = useState(false)
  const [showCreateUser, setShowCreateUser] = useState(false)
  const [showCreateQuiz, setShowCreateQuiz] = useState(false)
  const [allUsers, setAllUsers] = useState<any[]>([])
  const { toast } = useToast()

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      try {
        const [eventsRes, usersRes, quizzesRes, notificationsRes, allUsersRes] = await Promise.all([
          fetch("/api/resources?type=events"),
          fetch("/api/users"),
          fetch("/api/quiz-generation"),
          fetch("/api/notifications"),
          fetch("/api/users")
        ])
        
        const [eventsData, usersData, quizzesData, notificationsData, allUsersData] = await Promise.all([
          safeJson(eventsRes),
          safeJson(usersRes),
          safeJson(quizzesRes),
          safeJson(notificationsRes),
          safeJson(allUsersRes)
        ])
        
        setEvents(Array.isArray(eventsData) ? eventsData : [])
        setUsers(Array.isArray(usersData) ? usersData : [])
        setQuizzes(Array.isArray(quizzesData) ? quizzesData : [])
        setNotifications(Array.isArray(notificationsData) ? notificationsData : [])
        setAllUsers(Array.isArray(allUsersData) ? allUsersData : [])
      } catch (error) {
        console.error("Error fetching data:", error)
        toast({
          title: "Error",
          description: "Failed to load data",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [toast])

  const handleCreateEvent = async (eventData: Event) => {
    try {
      const res = await fetch("/api/resources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...eventData, type: "events" }),
      })
      
      if (res.ok) {
        const newEvent = await res.json()
        setEvents(prev => [...prev, newEvent])
        setShowCreateEvent(false)
        toast({
          title: "Success",
          description: "Event created successfully",
        })
      } else {
        throw new Error("Failed to create event")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create event",
        variant: "destructive",
      })
    }
  }

  const handleUpdateEvent = async (eventData: Event) => {
    try {
      const res = await fetch(`/api/resources/${eventData._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(eventData),
      })
      
      if (res.ok) {
        setEvents(prev => prev.map(e => e._id === eventData._id ? eventData : e))
        setEditingEvent(null)
        toast({
          title: "Success",
          description: "Event updated successfully",
        })
      } else {
        throw new Error("Failed to update event")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update event",
        variant: "destructive",
      })
    }
  }

  const handleDeleteEvent = async (eventId: string) => {
    try {
      const res = await fetch(`/api/resources/${eventId}`, {
        method: "DELETE",
      })
      
      if (res.ok) {
        setEvents(prev => prev.filter(e => e._id !== eventId))
        toast({
          title: "Success",
          description: "Event deleted successfully",
        })
      } else {
        throw new Error("Failed to delete event")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete event",
        variant: "destructive",
      })
    }
  }

  const handleToggleEventStatus = async (eventId: string) => {
    try {
      const event = events.find(e => e._id === eventId)
      if (!event) return
      
      const updatedEvent = { ...event, isActive: !event.isActive }
      const res = await fetch(`/api/resources/${eventId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedEvent),
      })
      
      if (res.ok) {
        setEvents(prev => prev.map(e => e._id === eventId ? updatedEvent : e))
        toast({
          title: "Success",
          description: `Event ${updatedEvent.isActive ? 'activated' : 'deactivated'} successfully`,
        })
      } else {
        throw new Error("Failed to update event status")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update event status",
        variant: "destructive",
      })
    }
  }

  const updateRegistrationField = (
    eventData: Partial<Event> | Event,
    setEventData: any,
    fieldId: string,
    updates: Partial<RegistrationField>,
  ) => {
    setEventData({
      ...eventData,
      registrationFields: eventData.registrationFields?.map(field =>
        field.id === fieldId ? { ...field, ...updates } : field
      ) || [],
    })
  }

  const removeRegistrationField = (eventData: Partial<Event> | Event, setEventData: any, fieldId: string) => {
    setEventData({
      ...eventData,
      registrationFields: eventData.registrationFields?.filter(field => field.id !== fieldId) || [],
    })
  }

  const RegistrationFieldEditor = ({
    eventData,
    setEventData,
    isEditing = false,
  }: {
    eventData: Partial<Event> | Event
    setEventData: any
    isEditing?: boolean
  }) => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Registration Fields</h3>
        <Button
          type="button"
          onClick={() => {
            const newField: RegistrationField = {
              id: Date.now().toString(),
              label: "",
              type: "text",
              required: false,
            }
            setEventData({
              ...eventData,
              registrationFields: [...(eventData.registrationFields || []), newField],
            })
          }}
          size="sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Field
        </Button>
      </div>
      
      {(eventData.registrationFields || []).map((field, index) => (
        <Card key={field.id} className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor={`field-label-${field.id}`}>Field Label</Label>
              <Input
                id={`field-label-${field.id}`}
                value={field.label}
                onChange={(e) => updateRegistrationField(eventData, setEventData, field.id, { label: e.target.value })}
                placeholder="e.g., Phone Number"
              />
            </div>
            
            <div>
              <Label htmlFor={`field-type-${field.id}`}>Field Type</Label>
              <Select
                value={field.type}
                onValueChange={(value: any) => updateRegistrationField(eventData, setEventData, field.id, { type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Text</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="number">Number</SelectItem>
                  <SelectItem value="select">Select</SelectItem>
                  <SelectItem value="textarea">Textarea</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id={`field-required-${field.id}`}
                checked={field.required}
                onCheckedChange={(checked) => updateRegistrationField(eventData, setEventData, field.id, { required: checked })}
              />
              <Label htmlFor={`field-required-${field.id}`}>Required</Label>
            </div>
          </div>
          
          {field.type === "select" && (
            <div className="mt-4">
              <Label htmlFor={`field-options-${field.id}`}>Options (comma-separated)</Label>
              <Input
                id={`field-options-${field.id}`}
                value={field.options?.join(", ") || ""}
                onChange={(e) => updateRegistrationField(eventData, setEventData, field.id, { options: e.target.value.split(", ").filter(Boolean) })}
                placeholder="Option 1, Option 2, Option 3"
              />
            </div>
          )}
          
          <div className="mt-4">
            <Label htmlFor={`field-placeholder-${field.id}`}>Placeholder</Label>
            <Input
              id={`field-placeholder-${field.id}`}
              value={field.placeholder || ""}
              onChange={(e) => updateRegistrationField(eventData, setEventData, field.id, { placeholder: e.target.value })}
              placeholder="Enter placeholder text"
            />
          </div>
          
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={() => removeRegistrationField(eventData, setEventData, field.id)}
            className="mt-2"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Remove Field
          </Button>
        </Card>
      ))}
    </div>
  )

  const handleCreateUser = async (user: any) => {
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user),
      })
      
      if (res.ok) {
        const newUser = await res.json()
        setUsers(prev => [...prev, newUser])
        setShowCreateUser(false)
        toast({
          title: "Success",
          description: "User created successfully",
        })
      } else {
        throw new Error("Failed to create user")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create user",
        variant: "destructive",
      })
    }
  }

  const handleUpdateUser = async (user: any) => {
    try {
      const res = await fetch(`/api/users/${user._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user),
      })
      
      if (res.ok) {
        setUsers(prev => prev.map(u => u._id === user._id ? user : u))
        setEditingUser(null)
        toast({
          title: "Success",
          description: "User updated successfully",
        })
      } else {
        throw new Error("Failed to update user")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update user",
        variant: "destructive",
      })
    }
  }

  const handleDeleteUser = async (id: string) => {
    try {
      const res = await fetch(`/api/users/${id}`, {
        method: "DELETE",
      })
      
      if (res.ok) {
        setUsers(prev => prev.filter(u => u._id !== id))
        toast({
          title: "Success",
          description: "User deleted successfully",
        })
      } else {
        throw new Error("Failed to delete user")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive",
      })
    }
  }

  const handleCreateQuiz = async (quiz: any) => {
    try {
      const res = await fetch("/api/quiz-generation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(quiz),
      })
      
      if (res.ok) {
        const newQuiz = await res.json()
        setQuizzes(prev => [...prev, newQuiz])
        setShowCreateQuiz(false)
        toast({
          title: "Success",
          description: "Quiz created successfully",
        })
      } else {
        throw new Error("Failed to create quiz")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create quiz",
        variant: "destructive",
      })
    }
  }

  const handleUpdateQuiz = async (quiz: any) => {
    try {
      const res = await fetch(`/api/quiz-generation/${quiz._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(quiz),
      })
      
      if (res.ok) {
        setQuizzes(prev => prev.map(q => q._id === quiz._id ? quiz : q))
        setEditingQuiz(null)
        toast({
          title: "Success",
          description: "Quiz updated successfully",
        })
      } else {
        throw new Error("Failed to update quiz")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update quiz",
        variant: "destructive",
      })
    }
  }

  const handleDeleteQuiz = async (id: string) => {
    try {
      const res = await fetch(`/api/quiz-generation/${id}`, {
        method: "DELETE",
      })
      
      if (res.ok) {
        setQuizzes(prev => prev.filter(q => q._id !== id))
        toast({
          title: "Success",
          description: "Quiz deleted successfully",
        })
      } else {
        throw new Error("Failed to delete quiz")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete quiz",
        variant: "destructive",
      })
    }
  }

  async function handleApproveNotification(notification: any) {
    try {
      const res = await fetch(`/api/notifications/${notification._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...notification, status: "approved" }),
      })
      
      if (res.ok) {
        setNotifications(prev => prev.map(n => n._id === notification._id ? { ...notification, status: "approved" } : n))
        toast({
          title: "Success",
          description: "Notification approved successfully",
        })
      } else {
        throw new Error("Failed to approve notification")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to approve notification",
        variant: "destructive",
      })
    }
  }

  async function handleRejectNotification(notification: any) {
    try {
      const res = await fetch(`/api/notifications/${notification._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...notification, status: "rejected" }),
      })
      
      if (res.ok) {
        setNotifications(prev => prev.map(n => n._id === notification._id ? { ...notification, status: "rejected" } : n))
        toast({
          title: "Success",
          description: "Notification rejected successfully",
        })
      } else {
        throw new Error("Failed to reject notification")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reject notification",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage events, users, quizzes, and notifications</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="quizzes">Quizzes</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>

          <TabsContent value="events" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Event Management</h2>
              <Button onClick={() => setShowCreateEvent(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Event
              </Button>
            </div>

            {loading ? (
              <div className="text-center py-8">Loading events...</div>
            ) : (
              <div className="grid gap-6">
                {events.map((event) => (
                  <Card key={event._id} className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-semibold">{event.title}</h3>
                        <p className="text-muted-foreground">{event.description}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={event.isActive ? "default" : "secondary"}>
                          {event.isActive ? "Active" : "Inactive"}
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingEvent(event)}
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleEventStatus(event._id!)}
                        >
                          {event.isActive ? "Deactivate" : "Activate"}
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteEvent(event._id!)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Date:</span> {event.date}
                      </div>
                      <div>
                        <span className="font-medium">Time:</span> {event.time}
                      </div>
                      <div>
                        <span className="font-medium">Location:</span> {event.location}
                      </div>
                      <div>
                        <span className="font-medium">Capacity:</span> {event.registered}/{event.capacity}
                      </div>
                    </div>
                    
                    {event.registeredUsers && event.registeredUsers.length > 0 && (
                      <div className="mt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => exportRegistrationsToCSV(event, allUsers)}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Export Registrations
                        </Button>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">User Management</h2>
              <Button onClick={() => setShowCreateUser(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create User
              </Button>
            </div>

            {loading ? (
              <div className="text-center py-8">Loading users...</div>
            ) : (
              <div className="grid gap-6">
                {users.map((user) => (
                  <Card key={user._id} className="p-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-xl font-semibold">{user.name}</h3>
                        <p className="text-muted-foreground">{user.email}</p>
                        <Badge variant="outline">{user.role}</Badge>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingUser(user)}
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteUser(user._id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="quizzes" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Quiz Management</h2>
              <Button onClick={() => setShowCreateQuiz(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Quiz
              </Button>
            </div>

            {loading ? (
              <div className="text-center py-8">Loading quizzes...</div>
            ) : (
              <div className="grid gap-6">
                {quizzes.map((quiz) => (
                  <Card key={quiz._id} className="p-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-xl font-semibold">{quiz.title}</h3>
                        <p className="text-muted-foreground">{quiz.description}</p>
                        <Badge variant="outline">{quiz.subject}</Badge>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingQuiz(quiz)}
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteQuiz(quiz._id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Notification Management</h2>
            </div>

            {loading ? (
              <div className="text-center py-8">Loading notifications...</div>
            ) : (
              <div className="grid gap-6">
                {notifications.map((notification) => (
                  <Card key={notification._id} className="p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-semibold">{notification.title}</h3>
                        <p className="text-muted-foreground">{notification.message}</p>
                        <Badge variant={notification.status === "pending" ? "secondary" : notification.status === "approved" ? "default" : "destructive"}>
                          {notification.status}
                        </Badge>
                      </div>
                      {notification.status === "pending" && (
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleApproveNotification(notification)}
                          >
                            Approve
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleRejectNotification(notification)}
                          >
                            Reject
                          </Button>
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {(activeTab === 'flashcards' || activeTab === 'quizzes') && <Chatbot />}
      </div>
    </div>
  )
}
