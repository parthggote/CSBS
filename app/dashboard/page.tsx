"use client"

import { Navigation } from "@/components/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, BookOpen, Award, Bell, Download, Clock, CheckCircle, Play, Brain, Sparkles, Plus, Edit, Trash2 } from "lucide-react"
import { useEffect, useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import jsPDF from 'jspdf'
import Chatbot from '../components/Chatbot'

// Helper to decode JWT
function parseJwt(token: string | null) {
  if (!token) return null
  try {
    return JSON.parse(atob(token.split('.')[1]))
  } catch {
    return null
  }
}

export default function DashboardPage() {
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [registeredEvents, setRegisteredEvents] = useState<any[]>([])
  const [bookmarkedResources, setBookmarkedResources] = useState<any[]>([])
  const [certificates, setCertificates] = useState<any[]>([])
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [allResources, setAllResources] = useState<any[]>([])
  const [allUsers, setAllUsers] = useState<any[]>([])
  const [allEvents, setAllEvents] = useState<any[]>([])
  const [allQuizzes, setAllQuizzes] = useState<any[]>([])
  const router = useRouter()
  const [shouldRedirect, setShouldRedirect] = useState(false)
  const [showUploadDialog, setShowUploadDialog] = useState(false)
  const [uploadForm, setUploadForm] = useState({
    subject: '',
    difficulty: 'medium',
    questionCount: 10,
    timeLimit: 30,
    description: ''
  })
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [quizResults, setQuizResults] = useState<any[]>([])
  const [showFlashcardDialog, setShowFlashcardDialog] = useState(false)
  const [flashcardUploadForm, setFlashcardUploadForm] = useState({
    subject: '',
    description: '',
    cardCount: 10
  })
  const [isFlashcardUploading, setIsFlashcardUploading] = useState(false)
  const [flashcardUploadProgress, setFlashcardUploadProgress] = useState(0)
  const [flashcards, setFlashcards] = useState<any[]>([])
  const [flashcardSets, setFlashcardSets] = useState<any[]>([])
  const [selectedFlashcardSet, setSelectedFlashcardSet] = useState<any>(null)
  const [currentFlashcardIndex, setCurrentFlashcardIndex] = useState(0)
  const [showFlashcardAnswer, setShowFlashcardAnswer] = useState(false)
  const [activeTab, setActiveTab] = useState('events')
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [selectedQuiz, setSelectedQuiz] = useState<any>(null)
  const [isAssigning, setIsAssigning] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [notificationLoading, setNotificationLoading] = useState(false)
  const [editForm, setEditForm] = useState<any>({})
  const [editLoading, setEditLoading] = useState(false)
  const [editError, setEditError] = useState<string | null>(null)

  // Memoize quiz results map
  const quizResultsMap = useMemo(() => {
    const map: Record<string, any> = {}
    quizResults.forEach((r: any) => { map[r.quizId] = r })
    return map
  }, [quizResults])

  // When opening edit dialog, populate form
  useEffect(() => {
    if (showEditDialog && selectedQuiz) {
      setEditForm({
        title: selectedQuiz.title || '',
        description: selectedQuiz.description || '',
        subject: selectedQuiz.subject || '',
        difficulty: selectedQuiz.difficulty || 'medium',
        questionCount: selectedQuiz.questionCount || 10,
        timeLimit: selectedQuiz.timeLimit || 30
      })
    }
  }, [showEditDialog, selectedQuiz])

  useEffect(() => {
    async function fetchData() {
      try {
        const token = localStorage.getItem('token')
        if (!token) {
          setShouldRedirect(true)
          return
        }

        const userData = parseJwt(token)
        if (!userData) {
          setShouldRedirect(true)
          return
        }

        setCurrentUser(userData)

        // Fetch all data
        const [eventsRes, resourcesRes, certificatesRes, notificationsRes, usersRes, quizzesRes, quizResultsRes] = await Promise.all([
          fetch('/api/resources?type=events'),
          fetch('/api/resources'),
          fetch('/api/resources?type=certifications'),
          fetch('/api/notifications'),
          fetch('/api/users'),
          fetch('/api/quiz-generation'),
          fetch('/api/quiz-results')
        ])

        const [eventsData, resourcesData, certificatesData, notificationsData, usersData, quizzesData, quizResultsData] = await Promise.all([
          eventsRes.json(),
          resourcesRes.json(),
          certificatesRes.json(),
          notificationsRes.json(),
          usersRes.json(),
          quizzesRes.json(),
          quizResultsRes.json()
        ])

        setAllEvents(Array.isArray(eventsData) ? eventsData : [])
        setAllResources(Array.isArray(resourcesData) ? resourcesData : [])
        setCertificates(Array.isArray(certificatesData) ? certificatesData : [])
        setNotifications(Array.isArray(notificationsData) ? notificationsData : [])
        setAllUsers(Array.isArray(usersData) ? usersData : [])
        setAllQuizzes(Array.isArray(quizzesData) ? quizzesData : [])
        setQuizResults(Array.isArray(quizResultsData) ? quizResultsData : [])

        // Filter user-specific data
        const userEvents = Array.isArray(eventsData) ? eventsData.filter((event: any) => 
          event.registeredUsers && event.registeredUsers.includes(userData.id)
        ) : []
        setRegisteredEvents(userEvents)

        const userResources = Array.isArray(resourcesData) ? resourcesData.filter((resource: any) => 
          resource.bookmarkedBy && resource.bookmarkedBy.includes(userData.id)
        ) : []
        setBookmarkedResources(userResources)

      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  useEffect(() => {
    if (shouldRedirect) {
      router.push('/login')
    }
  }, [shouldRedirect, router])

  const handleQuizUpload = async () => {
    setIsUploading(true)
    setUploadProgress(0)

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 200)

      const response = await fetch('/api/quiz-generation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(uploadForm),
      })

      clearInterval(progressInterval)
      setUploadProgress(100)

      if (response.ok) {
        const newQuiz = await response.json()
        setAllQuizzes(prev => [...prev, newQuiz])
        setShowUploadDialog(false)
        setUploadForm({
          subject: '',
          difficulty: 'medium',
          questionCount: 10,
          timeLimit: 30,
          description: ''
        })
      } else {
        throw new Error('Failed to create quiz')
      }
    } catch (error) {
      console.error('Error uploading quiz:', error)
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const handleFlashcardUpload = async () => {
    setIsFlashcardUploading(true)
    setFlashcardUploadProgress(0)

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setFlashcardUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 200)

      const response = await fetch('/api/flashcard-generation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(flashcardUploadForm),
      })

      clearInterval(progressInterval)
      setFlashcardUploadProgress(100)

      if (response.ok) {
        const newFlashcardSet = await response.json()
        setFlashcardSets(prev => [...prev, newFlashcardSet])
        setShowFlashcardDialog(false)
        setFlashcardUploadForm({
          subject: '',
          description: '',
          cardCount: 10
        })
      } else {
        throw new Error('Failed to create flashcard set')
      }
    } catch (error) {
      console.error('Error uploading flashcard set:', error)
    } finally {
      setIsFlashcardUploading(false)
      setFlashcardUploadProgress(0)
    }
  }

  const handleAssignQuiz = async (quizId: string) => {
    setIsAssigning(true)
    try {
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'quiz-assign',
          title: 'New Quiz Assigned',
          message: `A new quiz has been assigned to you.`,
          quizId: quizId,
          recipients: allUsers.map(user => user._id)
        }),
      })

      if (response.ok) {
        const newNotification = await response.json()
        setNotifications(prev => [...prev, newNotification])
      } else {
        throw new Error('Failed to assign quiz')
      }
    } catch (error) {
      console.error('Error assigning quiz:', error)
    } finally {
      setIsAssigning(false)
    }
  }

  const handleDeleteQuiz = async (quizId: string) => {
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/quiz-generation/${quizId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setAllQuizzes(prev => prev.filter(quiz => quiz._id !== quizId))
      } else {
        throw new Error('Failed to delete quiz')
      }
    } catch (error) {
      console.error('Error deleting quiz:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleEditQuiz = async () => {
    setEditLoading(true)
    setEditError(null)

    try {
      const response = await fetch(`/api/quiz-generation/${selectedQuiz._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm),
      })

      if (response.ok) {
        const updatedQuiz = await response.json()
        setAllQuizzes(prev => prev.map(quiz => 
          quiz._id === selectedQuiz._id ? updatedQuiz : quiz
        ))
        setShowEditDialog(false)
        setSelectedQuiz(null)
      } else {
        throw new Error('Failed to update quiz')
      }
    } catch (error) {
      console.error('Error updating quiz:', error)
      setEditError('Failed to update quiz')
    } finally {
      setEditLoading(false)
    }
  }

  const generateCertificatePDF = (certificate: any) => {
    const doc = new jsPDF()
    
    // Add certificate content
    doc.setFontSize(24)
    doc.text('Certificate of Completion', 105, 40, { align: 'center' })
    
    doc.setFontSize(16)
    doc.text(`This is to certify that`, 105, 60, { align: 'center' })
    
    doc.setFontSize(20)
    doc.text(currentUser?.name || 'Student Name', 105, 80, { align: 'center' })
    
    doc.setFontSize(16)
    doc.text(`has successfully completed`, 105, 100, { align: 'center' })
    
    doc.setFontSize(18)
    doc.text(certificate.title, 105, 120, { align: 'center' })
    
    doc.setFontSize(12)
    doc.text(`Issued on: ${new Date(certificate.issuedDate).toLocaleDateString()}`, 105, 140, { align: 'center' })
    
    // Save the PDF
    doc.save(`${certificate.title}_certificate.pdf`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (shouldRedirect) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation currentUser={currentUser} />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Welcome back, {currentUser?.name}!</h1>
          <p className="text-muted-foreground">Here's what's happening with your academic journey</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
            <TabsTrigger value="quizzes">Quizzes</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>

          <TabsContent value="events" className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {registeredEvents.map((event) => (
                <Card key={event._id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg">{event.title}</CardTitle>
                    <CardDescription>{event.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="w-4 h-4 mr-2" />
                        {new Date(event.date).toLocaleDateString()}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="w-4 h-4 mr-2" />
                        {event.time}
                      </div>
                    </div>
                    <Badge variant="default">Registered</Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="resources" className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {bookmarkedResources.map((resource) => (
                <Card key={resource._id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg">{resource.title}</CardTitle>
                    <CardDescription>{resource.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <BookOpen className="w-4 h-4 mr-2" />
                        {resource.type}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Download className="w-4 h-4 mr-2" />
                        {resource.downloads || 0} downloads
                      </div>
                    </div>
                    <Button variant="outline" className="w-full">
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="quizzes" className="space-y-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold">Quiz Management</h2>
              <Button onClick={() => setShowUploadDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Quiz
              </Button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allQuizzes.map((quiz) => (
                <Card key={quiz._id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg">{quiz.title}</CardTitle>
                    <CardDescription>{quiz.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <BookOpen className="w-4 h-4 mr-2" />
                        {quiz.subject}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="w-4 h-4 mr-2" />
                        {quiz.timeLimit} minutes
                      </div>
                      {quizResultsMap[quiz._id] && (
                        <div className="flex items-center text-sm text-green-600">
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Completed
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => {
                          setSelectedQuiz(quiz)
                          setShowEditDialog(true)
                        }}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => handleAssignQuiz(quiz._id)}
                        disabled={isAssigning}
                      >
                        <Bell className="w-4 h-4 mr-2" />
                        Assign
                      </Button>
                      <Button 
                        variant="destructive" 
                        className="w-full"
                        onClick={() => handleDeleteQuiz(quiz._id)}
                        disabled={isDeleting}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <div className="grid gap-6">
              {notifications.map((notification) => (
                <Card key={notification._id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg">{notification.title}</CardTitle>
                    <CardDescription>{notification.message}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <Badge variant={notification.status === "pending" ? "secondary" : "default"}>
                        {notification.status}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        {new Date(notification.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {(activeTab === 'flashcards' || activeTab === 'quizzes') && <Chatbot />}
      </div>

      {/* Quiz Upload Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Quiz</DialogTitle>
            <DialogDescription>
              Generate a new quiz with AI assistance
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                value={uploadForm.subject}
                onChange={(e) => setUploadForm(prev => ({ ...prev, subject: e.target.value }))}
                placeholder="e.g., Data Structures"
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={uploadForm.description}
                onChange={(e) => setUploadForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description of the quiz"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="questionCount">Question Count</Label>
                <Input
                  id="questionCount"
                  type="number"
                  value={uploadForm.questionCount}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, questionCount: parseInt(e.target.value) }))}
                />
              </div>
              <div>
                <Label htmlFor="timeLimit">Time Limit (minutes)</Label>
                <Input
                  id="timeLimit"
                  type="number"
                  value={uploadForm.timeLimit}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, timeLimit: parseInt(e.target.value) }))}
                />
              </div>
            </div>
            {isUploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Generating quiz...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            )}
            <Button 
              onClick={handleQuizUpload} 
              disabled={isUploading || !uploadForm.subject}
              className="w-full"
            >
              {isUploading ? 'Generating...' : 'Generate Quiz'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Quiz Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Quiz</DialogTitle>
            <DialogDescription>
              Update quiz details
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                value={editForm.title}
                onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Input
                id="edit-description"
                value={editForm.description}
                onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="edit-subject">Subject</Label>
              <Input
                id="edit-subject"
                value={editForm.subject}
                onChange={(e) => setEditForm(prev => ({ ...prev, subject: e.target.value }))}
              />
            </div>
            {editError && (
              <p className="text-red-500 text-sm">{editError}</p>
            )}
            <Button 
              onClick={handleEditQuiz} 
              disabled={editLoading}
              className="w-full"
            >
              {editLoading ? 'Updating...' : 'Update Quiz'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
