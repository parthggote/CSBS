"use client"

import { Navigation } from "@/components/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
<<<<<<< HEAD
import { Calendar, BookOpen, Award, Bell, Download, Clock, CheckCircle, Play, Brain, Sparkles } from "lucide-react"
import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import jsPDF from 'jspdf';
import Chatbot from '../components/Chatbot';
=======
import { Calendar, BookOpen, Award, Bell, Download, Clock, CheckCircle } from "lucide-react"
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
>>>>>>> 768d7e3437f156c7a323f951ce4c1510fcaf47d8

// Helper to decode JWT
function parseJwt(token: string | null) {
  if (!token) return null;
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return null;
  }
}

export default function DashboardPage() {
<<<<<<< HEAD
  // All hooks at the top
=======
>>>>>>> 768d7e3437f156c7a323f951ce4c1510fcaf47d8
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [registeredEvents, setRegisteredEvents] = useState<any[]>([]);
  const [bookmarkedResources, setBookmarkedResources] = useState<any[]>([]);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [allResources, setAllResources] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [allEvents, setAllEvents] = useState<any[]>([]);
<<<<<<< HEAD
  const [allQuizzes, setAllQuizzes] = useState<any[]>([]);
  const router = useRouter();
  const [shouldRedirect, setShouldRedirect] = useState(false);
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
  const [quizResults, setQuizResults] = useState<any[]>([]);
  const [showFlashcardDialog, setShowFlashcardDialog] = useState(false);
  const [flashcardUploadForm, setFlashcardUploadForm] = useState({
    subject: '',
    description: '',
    cardCount: 10
  });
  const [isFlashcardUploading, setIsFlashcardUploading] = useState(false);
  const [flashcardUploadProgress, setFlashcardUploadProgress] = useState(0);
  const [flashcards, setFlashcards] = useState<any[]>([]);
  const [flashcardSets, setFlashcardSets] = useState<any[]>([]);
  const [selectedFlashcardSet, setSelectedFlashcardSet] = useState<any>(null);
  const [currentFlashcardIndex, setCurrentFlashcardIndex] = useState(0);
  const [showFlashcardAnswer, setShowFlashcardAnswer] = useState(false);
  const [activeTab, setActiveTab] = useState('events');
  // Add state for edit dialog and selected quiz
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState<any>(null);
  const [isAssigning, setIsAssigning] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  // Add state for notification loading
  const [notificationLoading, setNotificationLoading] = useState(false);
  // Add state for edit form fields and loading
  const [editForm, setEditForm] = useState<any>({});
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  // Memoize quiz results map (move above early returns)
  const quizResultsMap = useMemo(() => {
    const map: Record<string, any> = {};
    quizResults.forEach((r: any) => { map[r.quizId] = r });
    return map;
  }, [quizResults]);

  // When opening edit dialog, populate form
  useEffect(() => {
    if (showEditDialog && selectedQuiz) {
      setEditForm({
        title: selectedQuiz.title || '',
        description: selectedQuiz.description || '',
        subject: selectedQuiz.subject || '',
        difficulty: selectedQuiz.difficulty || 'medium',
        questionCount: selectedQuiz.questionCount || 10,
        timeLimit: selectedQuiz.timeLimit || 30,
      });
      setEditError(null);
    }
  }, [showEditDialog, selectedQuiz]);
=======
  const router = useRouter();
  const [shouldRedirect, setShouldRedirect] = useState(false);
>>>>>>> 768d7e3437f156c7a323f951ce4c1510fcaf47d8

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      // Fetch current user from /api/users/me
      let user = null;
      try {
        const res = await fetch('/api/users/me', { credentials: 'include' });
        if (res.ok) {
          user = await res.json();
        }
      } catch {}
      setCurrentUser(user);
      // Fetch all users for event registration display
      let users: any[] = [];
      try {
        const res = await fetch('/api/users', { credentials: 'include' });
        users = await res.json();
      } catch {}
      setAllUsers(users);
      // Fetch events
      let events: any[] = [];
      try {
        const res = await fetch('/api/resources?type=events', { credentials: 'include' });
        events = await res.json();
      } catch {}
      setAllEvents(events);
      // Filter events where the user is registered (if such a field exists)
      setRegisteredEvents(events.filter((e: any) => Array.isArray(e.registeredUsers) && user && e.registeredUsers.includes(user._id)));
      // Fetch resources (all types)
      let allRes: any[] = [];
      const types = ['pyqs', 'certifications', 'hackathons', 'interviews'];
      for (const type of types) {
        try {
          const res = await fetch(`/api/resources?type=${type}`, { credentials: 'include' });
          const data = await res.json();
          allRes = allRes.concat(Array.isArray(data) ? data : []);
        } catch {}
      }
      setAllResources(allRes);
      setBookmarkedResources(allRes.filter((r: any) => Array.isArray(r.bookmarkedBy) && user && r.bookmarkedBy.includes(user._id)));
      // Fetch certificates (filter by user if possible)
      setCertificates(allRes.filter((r: any) => r.type === 'certifications' && Array.isArray(r.issuedTo) && user && r.issuedTo.includes(user._id)));
<<<<<<< HEAD
      // Fetch quizzes
      let quizzes: any[] = [];
      try {
        const res = await fetch('/api/resources?type=quizzes', { credentials: 'include' });
        quizzes = await res.json();
      } catch {}
      setAllQuizzes(Array.isArray(quizzes) ? quizzes : []);
      // Fetch quiz results for the user
      let results: any[] = [];
      try {
        const res = await fetch('/api/quiz-results', { credentials: 'include' });
        if (res.ok) results = await res.json();
      } catch {}
      setQuizResults(Array.isArray(results) ? results : []);
=======
>>>>>>> 768d7e3437f156c7a323f951ce4c1510fcaf47d8
      // Fetch notifications (if implemented)
      setNotifications([]); // Placeholder, implement if you have notifications
      setLoading(false);
    }
    fetchData();
  }, []);

  useEffect(() => {
    if (!loading && !currentUser) {
      setShouldRedirect(true);
    }
  }, [loading, currentUser]);

  useEffect(() => {
    if (shouldRedirect) {
      router.push('/login');
    }
  }, [shouldRedirect, router]);

<<<<<<< HEAD
  useEffect(() => {
    if (activeTab === 'notifications') {
      fetchNotifications();
    }
    // eslint-disable-next-line
  }, [activeTab]);

=======
>>>>>>> 768d7e3437f156c7a323f951ce4c1510fcaf47d8
  // Edge case: loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <span className="text-lg text-gray-600">Loading dashboard...</span>
      </div>
    );
  }

  if (shouldRedirect) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <span className="text-lg text-gray-600">Redirecting to login...</span>
      </div>
    );
  }

  // Helper to determine if event is upcoming or completed
  function getEventStatus(event: any) {
    const now = new Date();
    const eventDate = new Date(event.date);
    return eventDate >= now ? 'upcoming' : 'completed';
  }

<<<<<<< HEAD
  function handleDownloadResultPDF(quiz: any, result: any) {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(`Quiz: ${quiz.title}`, 10, 20);
    doc.setFontSize(12);
    doc.text(`Subject: ${quiz.subject || ''}`, 10, 30);
    doc.text(`Score: ${result.score}%`, 10, 40);
    let y = 55;
    const questions = quiz.questions || [];
    questions.forEach((q: any, i: number) => {
      doc.setFontSize(12);
      doc.text(`Q${i + 1}: ${q.question}`, 10, y);
      y += 8;
      doc.setFontSize(11);
      doc.text(`Your Answer: ${result.answers[i] || 'Not answered'}`, 12, y);
      y += 7;
      doc.text(`Correct Answer: ${q.correctAnswer}`, 12, y);
      y += 7;
      if (q.explanation) {
        doc.text(`Explanation: ${q.explanation}`, 12, y);
        y += 7;
      }
      y += 4;
      if (y > 270) { doc.addPage(); y = 20; }
    });
    doc.save(`${quiz.title.replace(/\s+/g, '_')}_Result.pdf`);
  }

  // Handler for edit
  function handleEditQuiz(quiz: any) {
    setSelectedQuiz(quiz);
    setShowEditDialog(true);
  }

  // Handler for delete
  async function handleDeleteQuiz(quiz: any) {
    if (!window.confirm('Are you sure you want to delete this quiz?')) return;
    setIsDeleting(true);
    try {
      await fetch(`/api/resources?type=quizzes`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: quiz._id })
      });
      setAllQuizzes((prev: any[]) => prev.filter(q => q._id !== quiz._id));
    } finally {
      setIsDeleting(false);
    }
  }

  // Handler for assign to all (send notification)
  async function handleAssignToAll(quiz: any) {
    setIsAssigning(true);
    try {
      await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'quiz-assign',
          message: `Request to assign quiz "${quiz.title}" to all users`,
          quizId: quiz._id
        })
      });
      alert('Assignment request sent to admin for approval.');
    } finally {
      setIsAssigning(false);
    }
  }

  // Fetch notifications from API
  async function fetchNotifications() {
    setNotificationLoading(true);
    try {
      const res = await fetch('/api/notifications', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } finally {
      setNotificationLoading(false);
    }
  }

  // Handler for admin approval
  async function handleApproveNotification(notification: any) {
    if (!window.confirm('Approve this quiz assignment?')) return;
    setNotificationLoading(true);
    try {
      await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: notification._id, status: 'approved' })
      });
      // Placeholder: assign quiz to all users (implement actual logic as needed)
      if (notification.type === 'quiz-assign' && notification.quizId) {
        // TODO: Implement backend logic to assign quiz to all users
        alert('Quiz assigned to all users (placeholder).');
      }
      fetchNotifications();
    } finally {
      setNotificationLoading(false);
    }
  }

  // Helper to get user ID
  function getCurrentUserId(user: any) {
    return user?._id || user?.id || user?.email || null;
  }

  // Filter quizzes for students: only show assigned quizzes
  const visibleQuizzes = allQuizzes.filter((quiz: any) => {
    if (currentUser?.role === 'admin') return true;
    if (Array.isArray(quiz.assignedTo)) {
      return quiz.assignedTo.some((id: any) => id == getCurrentUserId(currentUser));
    }
    // If no assignedTo array, show to all
    return true;
  });

  // Handler for edit form change
  function handleEditFormChange(e: any) {
    const { name, value } = e.target;
    setEditForm((prev: any) => ({ ...prev, [name]: value }));
  }

  // Handler for save
  async function handleSaveEdit() {
    if (!selectedQuiz) return;
    setEditLoading(true);
    setEditError(null);
    try {
      const res = await fetch(`/api/resources?type=quizzes`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedQuiz._id,
          ...editForm,
        })
      });
      if (!res.ok) throw new Error('Failed to update quiz');
      // Update quiz in state
      setAllQuizzes((prev: any[]) => prev.map(q => q._id === selectedQuiz._id ? { ...q, ...editForm } : q));
      setShowEditDialog(false);
    } catch (err: any) {
      setEditError(err.message || 'Error updating quiz');
    } finally {
      setEditLoading(false);
    }
  }

=======
>>>>>>> 768d7e3437f156c7a323f951ce4c1510fcaf47d8
  return (
    <div className="min-h-screen bg-background">
      <Navigation currentUser={currentUser} />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Welcome back, {currentUser?.name || currentUser?.email || "Student"}!
          </h1>
          <p className="text-muted-foreground">
            {currentUser?.semester} Semester • Roll No: {currentUser?.rollNumber}
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Registered Events</p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-300">
                    {registeredEvents.filter((e) => getEventStatus(e) === "upcoming").length}
                  </p>
                </div>
                <Calendar className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Bookmarked Resources</p>
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-300">{bookmarkedResources.length}</p>
                </div>
                <BookOpen className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Certificates</p>
                  <p className="text-2xl font-bold text-green-600">{certificates.length}</p>
                </div>
                <Award className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Notifications</p>
                  <p className="text-2xl font-bold text-orange-600">{notifications.filter((n) => !n.read).length}</p>
                </div>
                <Bell className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

<<<<<<< HEAD
        <Tabs defaultValue="events" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-6 max-w-4xl mx-auto mb-8">
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
            <TabsTrigger value="quizzes">Quizzes</TabsTrigger>
            <TabsTrigger value="flashcards">Flash Cards</TabsTrigger>
=======
        <Tabs defaultValue="events" className="w-full">
          <TabsList className="grid w-full grid-cols-4 max-w-2xl mx-auto mb-8">
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
>>>>>>> 768d7e3437f156c7a323f951ce4c1510fcaf47d8
            <TabsTrigger value="certificates">Certificates</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>

          <TabsContent value="events">
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-4">Upcoming Events</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {allEvents
                    .filter((event) => getEventStatus(event) === 'upcoming')
                    .map((event) => {
                      const isRegistered = Array.isArray(event.registeredUsers) && currentUser && event.registeredUsers.includes(currentUser._id);
                      return (
                        <Card key={event._id}>
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="text-lg">{event.title}</CardTitle>
                              <CardDescription>{event.location}</CardDescription>
                            </div>
                              {isRegistered ? (
                            <Badge className="bg-blue-100 text-blue-800">Registered</Badge>
                              ) : null}
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              {new Date(event.date).toLocaleDateString()}
                            </div>
                            <div className="flex items-center">
                              <Clock className="w-4 h-4 mr-1" />
                              {event.time}
                            </div>
                          </div>
                            <div className="mt-2 text-sm text-gray-500">
                              Registered Users: {Array.isArray(event.registeredUsers) ? event.registeredUsers.length : 0}
                              {Array.isArray(event.registeredUsers) && event.registeredUsers.length > 0 && (
                                <ul className="ml-2 mt-1 list-disc text-xs">
                                  {event.registeredUsers.map((userId: string) => {
                                    const userObj = allUsers.find((u) => u._id === userId);
                                    return userObj ? (
                                      <li key={userId}>{userObj.name} ({userObj.email})</li>
                                    ) : null;
                                  })}
                                </ul>
                              )}
                            </div>
                            {!isRegistered && currentUser && (
                              <Button className="mt-2" size="sm" onClick={() => {
                                router.push(`/events/${event._id}/register`);
                              }}>
                                Register
                              </Button>
                            )}
                        </CardContent>
                      </Card>
                      );
                    })}
                </div>
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-4">Completed Events (Registered)</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {allEvents
                    .filter((event) => getEventStatus(event) === 'completed')
                    .filter((event) => Array.isArray(event.registeredUsers) && currentUser && event.registeredUsers.includes(currentUser._id))
                    .map((event) => (
                      <Card key={event._id}>
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="text-lg">{event.title}</CardTitle>
                              <CardDescription>{event.location}</CardDescription>
                            </div>
                            <div className="flex items-center space-x-2">
                              <CheckCircle className="w-5 h-5 text-green-500" />
                              {event.certificate && (
                                <Badge className="bg-green-100 text-green-800">Certificate Available</Badge>
                              )}
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                              <div className="flex items-center">
                                <Calendar className="w-4 h-4 mr-1" />
                                {new Date(event.date).toLocaleDateString()}
                              </div>
                            </div>
                            {event.certificate && (
                              <Button size="sm" variant="outline">
                                <Download className="w-4 h-4 mr-1" />
                                Certificate
                              </Button>
                            )}
                          </div>
                          <div className="mt-2 text-sm text-gray-500">
                            Registered Users: {Array.isArray(event.registeredUsers) ? event.registeredUsers.length : 0}
                            {Array.isArray(event.registeredUsers) && event.registeredUsers.length > 0 && (
                              <ul className="ml-2 mt-1 list-disc text-xs">
                                {event.registeredUsers.map((userId: string) => {
                                  const userObj = allUsers.find((u) => u._id === userId);
                                  return userObj ? (
                                    <li key={userId}>{userObj.name} ({userObj.email})</li>
                                  ) : null;
                                })}
                              </ul>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="resources">
            <div>
              <h2 className="text-xl font-semibold mb-4">All Resources</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {allResources.map((resource) => (
                  <Card key={resource._id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{resource.title}</CardTitle>
                          <CardDescription>{resource.description}</CardDescription>
                        </div>
                        <Badge variant="outline">{resource.type || resource.category}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">
                          Downloads: {resource.downloads || 0}
                        </span>
                        {resource.fileId && (
                          <a href={`/api/files/${resource.fileId}`} target="_blank" rel="noopener noreferrer">
                            <Button size="sm">Download</Button>
                          </a>
                        )}
                      </div>
                      {resource.year && <div className="text-xs text-gray-500 mt-1">Year: {resource.year}</div>}
                      {resource.semester && <div className="text-xs text-gray-500">Semester: {resource.semester}</div>}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

<<<<<<< HEAD
          <TabsContent value="quizzes">
            <div>
              <h2 className="text-xl font-semibold mb-4">Available Quizzes</h2>
              {currentUser?.role === 'student' && (
                <div className="mb-6 flex justify-end">
                  <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
                    <DialogTrigger asChild>
                      <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                        Generate Quiz
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle className="flex items-center space-x-2">
                          <span>Generate AI Quiz</span>
                        </DialogTitle>
                        <DialogDescription>
                          Upload a PDF and configure your quiz settings
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium">Subject/Topic</label>
                          <Input
                            placeholder="e.g., Data Structures, Algorithms"
                            value={uploadForm.subject}
                            onChange={(e) => setUploadForm({...uploadForm, subject: e.target.value})}
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Difficulty</label>
                          <select 
                            className="w-full p-2 border rounded-md"
                            value={uploadForm.difficulty}
                            onChange={(e) => setUploadForm({...uploadForm, difficulty: e.target.value})}
                          >
                            <option value="easy">Easy</option>
                            <option value="medium">Medium</option>
                            <option value="hard">Hard</option>
                          </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium">Questions</label>
                            <Input
                              type="number"
                              min="5"
                              max="50"
                              value={uploadForm.questionCount}
                              onChange={(e) => setUploadForm({...uploadForm, questionCount: parseInt(e.target.value)})}
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium">Time (min)</label>
                            <Input
                              type="number"
                              min="5"
                              max="180"
                              value={uploadForm.timeLimit}
                              onChange={(e) => setUploadForm({...uploadForm, timeLimit: parseInt(e.target.value)})}
                            />
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium">Description (optional)</label>
                          <Input
                            placeholder="Brief description of the quiz"
                            value={uploadForm.description}
                            onChange={(e) => setUploadForm({...uploadForm, description: e.target.value})}
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Upload PDF</label>
                          <Input
                            type="file"
                            accept=".pdf"
                            onChange={async (event) => {
                              const file = event.target.files?.[0]
                              if (!file) return
                              if (file.type !== 'application/pdf') {
                                alert('Please upload a PDF file')
                                return
                              }
                              if (file.size > 10 * 1024 * 1024) {
                                alert('File size should be less than 10MB')
                                return
                              }
                              setIsUploading(true)
                              setUploadProgress(0)
                              try {
                                const formData = new FormData()
                                formData.append('file', file)
                                formData.append('type', 'quiz-generation')
                                const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData })
                                if (!uploadRes.ok) throw new Error('Failed to upload file')
                                const uploadData = await uploadRes.json()
                                setUploadProgress(50)
                                const quizRes = await fetch('/api/quiz-generation', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({
                                    fileId: uploadData.fileId,
                                    filename: uploadData.filename,
                                    ...uploadForm
                                  })
                                })
                                if (!quizRes.ok) throw new Error('Failed to generate quiz')
                                setUploadProgress(100)
                                setTimeout(() => {
                                  setShowUploadDialog(false)
                                  setIsUploading(false)
                                  setUploadProgress(0)
                                  setUploadForm({
                                    subject: '',
                                    difficulty: 'medium',
                                    questionCount: 10,
                                    timeLimit: 30,
                                    description: ''
                                  })
                                }, 1000)
                              } catch (error) {
                                alert('Failed to generate quiz. Please try again.')
                                setIsUploading(false)
                                setUploadProgress(0)
                              }
                            }}
                            disabled={isUploading}
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Maximum file size: 10MB. Supported: PDF files only.
                          </p>
                        </div>
                        {isUploading && (
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <span className="text-sm">Generating quiz from PDF...</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${uploadProgress}%` }}
                              ></div>
                            </div>
                            <p className="text-xs text-gray-500">
                              {uploadProgress < 50 ? 'Uploading file...' : 'Processing content and generating questions...'}
                            </p>
                          </div>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              )}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {visibleQuizzes.filter(quiz => quiz.isActive).map((quiz) => (
                  <Card key={quiz._id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{quiz.title}</CardTitle>
                          <CardDescription>{quiz.description}</CardDescription>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <Badge className={
                            quiz.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                            quiz.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }>
                            {quiz.difficulty}
                          </Badge>
                          {Array.isArray(quiz.assignedTo) && quiz.assignedTo.some((id: any) => id == getCurrentUserId(currentUser)) && (
                            <Badge className="bg-blue-100 text-blue-800 mt-1">Assigned to You</Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Subject:</span>
                          <span className="font-medium">{quiz.subject}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Questions:</span>
                          <span className="font-medium">{quiz.questionCount}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Time Limit:</span>
                          <span className="font-medium">{quiz.timeLimit} min</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Participants:</span>
                          <span className="font-medium">{quiz.participants || 0}</span>
                        </div>
                      </div>
                      <Button 
                        className="w-full" 
                        onClick={() => router.push(`/quizzes/${quiz._id}/take`)}
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Take Quiz
                      </Button>
                      <div className="flex gap-2 mt-2">
                        <Button size="sm" variant="outline" onClick={() => handleEditQuiz(quiz)} disabled={isDeleting || isAssigning}>Edit</Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDeleteQuiz(quiz)} disabled={isDeleting}>Delete</Button>
                        <Button size="sm" variant="default" onClick={() => handleAssignToAll(quiz)} disabled={isAssigning}>Assign to All</Button>
                      </div>
                      {quizResultsMap[quiz._id] && (
                        <div className="flex flex-col space-y-2 mt-2">
                          <Badge className="bg-green-100 text-green-800 text-base px-3 py-1">Attempted</Badge>
                          <span className="text-sm text-gray-700 font-semibold">Score: {quizResultsMap[quiz._id].score}%</span>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={() => handleDownloadResultPDF(quiz, quizResultsMap[quiz._id])}
                          >
                            Download Result (PDF)
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
              {visibleQuizzes.filter(quiz => quiz.isActive).length === 0 && (
                <div className="text-center py-8">
                  <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No active quizzes available.</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="flashcards">
            <div>
              <h2 className="text-xl font-semibold mb-4">AI-Powered Flash Cards</h2>
              {currentUser?.role === 'student' && (
                <div className="mb-6 flex justify-end">
                  <Dialog open={showFlashcardDialog} onOpenChange={setShowFlashcardDialog}>
                    <DialogTrigger asChild>
                      <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                        <Sparkles className="w-4 h-4 mr-2" />
                        Generate Flash Cards
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle className="flex items-center space-x-2">
                          <span>Generate AI Flash Cards</span>
                        </DialogTitle>
                        <DialogDescription>
                          Upload a PDF or notes to generate flash cards
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium">Number of Cards</label>
                            <Input
                              type="number"
                              min="5"
                              max="50"
                              value={flashcardUploadForm.cardCount}
                              onChange={(e) => setFlashcardUploadForm({ ...flashcardUploadForm, cardCount: parseInt(e.target.value) })}
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium">Subject/Topic</label>
                            <Input
                              placeholder="e.g., Data Structures, Algorithms"
                              value={flashcardUploadForm.subject}
                              onChange={(e) => setFlashcardUploadForm({ ...flashcardUploadForm, subject: e.target.value })}
                            />
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium">Description (optional)</label>
                          <Input
                            placeholder="Brief description of the flash cards"
                            value={flashcardUploadForm.description}
                            onChange={(e) => setFlashcardUploadForm({ ...flashcardUploadForm, description: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Upload PDF or Notes</label>
                          <Input
                            type="file"
                            accept=".pdf,.txt,.md"
                            onChange={async (event) => {
                              const file = event.target.files?.[0];
                              if (!file) return;
                              if (!(file.type === 'application/pdf' || file.type === 'text/plain' || file.name.endsWith('.md'))) {
                                alert('Please upload a PDF, TXT, or Markdown file');
                                return;
                              }
                              if (file.size > 10 * 1024 * 1024) {
                                alert('File size should be less than 10MB');
                                return;
                              }
                              setIsFlashcardUploading(true);
                              setFlashcardUploadProgress(0);
                              try {
                                // Upload file first
                                const formData = new FormData();
                                formData.append('file', file);
                                formData.append('type', 'flashcard-generation');
                                const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData });
                                if (!uploadRes.ok) throw new Error('Failed to upload file');
                                const uploadData = await uploadRes.json();
                                setFlashcardUploadProgress(50);

                                // Generate flash cards using AI
                                const flashcardRes = await fetch('/api/flashcard-generation', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({
                                    fileId: uploadData.fileId,
                                    filename: uploadData.filename,
                                    ...flashcardUploadForm
                                  })
                                });
                                if (!flashcardRes.ok) throw new Error('Failed to generate flash cards');
                                const flashcardData = await flashcardRes.json();
                                
                                if (flashcardData.success) {
                                  const newSet = {
                                    id: flashcardData.flashcardSet._id,
                                    title: flashcardData.flashcardSet.title,
                                    description: flashcardData.flashcardSet.description,
                                    sourceFile: file.name,
                                    cardCount: flashcardData.flashcardSet.cardCount,
                                    cards: flashcardData.flashcardSet.cards,
                                    createdAt: flashcardData.flashcardSet.createdAt
                                  };
                                  setFlashcardSets(prev => [newSet, ...prev]);
                                } else {
                                  throw new Error(flashcardData.error || 'Failed to generate flash cards');
                                }
                                
                                setIsFlashcardUploading(false);
                                setFlashcardUploadProgress(100);
                                setShowFlashcardDialog(false);
                                setFlashcardUploadForm({ subject: '', description: '', cardCount: 10 });
                                setTimeout(() => setFlashcardUploadProgress(0), 1000);
                              } catch (error) {
                                console.error('Error generating flash cards:', error);
                                alert('Failed to generate flash cards. Please try again.');
                                setIsFlashcardUploading(false);
                                setFlashcardUploadProgress(0);
                              }
                            }}
                            disabled={isFlashcardUploading}
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Maximum file size: 10MB. Supported: PDF, TXT, and Markdown files.
                          </p>
                        </div>
                        {isFlashcardUploading && (
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <span className="text-sm">Generating flash cards from your file...</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${flashcardUploadProgress}%` }}
                              ></div>
                            </div>
                            <p className="text-xs text-gray-500">
                              {flashcardUploadProgress < 50 ? 'Uploading file...' : 'Processing content and generating flash cards...'}
                            </p>
                          </div>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              )}

              {!selectedFlashcardSet ? (
                // Flash Card Sets List
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {flashcardSets.length === 0 ? (
                    <div className="col-span-full text-center py-8">
                      <Sparkles className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No flash card sets created yet. Upload your notes to get started!</p>
                    </div>
                  ) : (
                    flashcardSets.map((set) => (
                      <Card key={set.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => {
                        setSelectedFlashcardSet(set);
                        setCurrentFlashcardIndex(0);
                        setShowFlashcardAnswer(false);
                      }}>
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="text-lg">{set.title}</CardTitle>
                              <CardDescription>{set.description || 'No description'}</CardDescription>
                            </div>
                            <Badge variant="outline">{set.cards.length} cards</Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center justify-between">
                              <span className="text-gray-600">Source:</span>
                              <span className="font-medium truncate max-w-32">{set.sourceFile}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-gray-600">Created:</span>
                              <span className="font-medium">{new Date(set.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <Button className="w-full mt-4" variant="outline">
                            Study Set
                          </Button>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              ) : (
                // Study Mode for Selected Set
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <Button variant="outline" onClick={() => {
                        setSelectedFlashcardSet(null);
                        setCurrentFlashcardIndex(0);
                        setShowFlashcardAnswer(false);
                      }}>
                        ← Back to Sets
                      </Button>
                      <h3 className="text-lg font-semibold mt-2">{selectedFlashcardSet.title}</h3>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">
                        Card {currentFlashcardIndex + 1} of {selectedFlashcardSet.cards.length}
                      </span>
                    </div>
                  </div>
                  <div className="max-w-2xl mx-auto">
                    <Card className="min-h-[300px] flex flex-col">
                      <CardHeader className="flex-1">
                        <CardTitle className="text-xl text-center">
                          {selectedFlashcardSet.cards[currentFlashcardIndex]?.question}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="flex-1 flex flex-col justify-center">
                        {showFlashcardAnswer ? (
                          <div className="text-center">
                            <p className="text-lg font-semibold text-gray-700 mb-4">
                              {selectedFlashcardSet.cards[currentFlashcardIndex]?.answer}
                            </p>
                            <div className="flex justify-center space-x-4">
                              <Button
                                variant="outline"
                                onClick={() => {
                                  setShowFlashcardAnswer(false);
                                  if (currentFlashcardIndex < selectedFlashcardSet.cards.length - 1) {
                                    setCurrentFlashcardIndex(currentFlashcardIndex + 1);
                                  }
                                }}
                              >
                                Next Card
                              </Button>
                              <Button
                                variant="outline"
                                onClick={() => {
                                  setShowFlashcardAnswer(false);
                                  setCurrentFlashcardIndex(0);
                                }}
                              >
                                Start Over
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center">
                            <Button
                              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                              onClick={() => setShowFlashcardAnswer(true)}
                            >
                              Reveal Answer
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

=======
>>>>>>> 768d7e3437f156c7a323f951ce4c1510fcaf47d8
          <TabsContent value="certificates">
            <div>
              <h2 className="text-xl font-semibold mb-4">Your Certificates</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {certificates.map((certificate) => (
                  <Card key={certificate.id}>
                    <CardHeader>
                      <CardTitle className="text-lg">{certificate.title}</CardTitle>
                      <CardDescription>
                        Issued on {new Date(certificate.issueDate).toLocaleDateString()}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-green-600">
                          <Award className="w-4 h-4 mr-1" />
                          <span className="text-sm font-medium">Verified</span>
                        </div>
                        <Button size="sm">
                          <Download className="w-4 h-4 mr-1" />
                          Download
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="notifications">
            <div>
              <h2 className="text-xl font-semibold mb-4">Recent Notifications</h2>
<<<<<<< HEAD
              {notificationLoading && <div className="text-gray-500 mb-2">Loading notifications...</div>}
              <div className="space-y-4">
                {notifications.map((notification) => (
                  <Card key={notification._id} className={!notification.read ? "border-blue-200 bg-blue-50" : ""}>
=======
              <div className="space-y-4">
                {notifications.map((notification) => (
                  <Card key={notification.id} className={!notification.read ? "border-blue-200 bg-blue-50" : ""}>
>>>>>>> 768d7e3437f156c7a323f951ce4c1510fcaf47d8
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <div
                            className={`w-2 h-2 rounded-full mt-2 ${!notification.read ? "bg-blue-500" : "bg-gray-300"}`}
                          />
                          <div>
<<<<<<< HEAD
                            <h3 className="font-medium">{notification.type === 'quiz-assign' ? 'Quiz Assignment' : notification.type}</h3>
                            <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                            <p className="text-xs text-gray-500 mt-2">{notification.createdAt ? new Date(notification.createdAt).toLocaleString() : ''}</p>
                            {currentUser?.role === 'admin' && notification.status === 'pending' && notification.type === 'quiz-assign' && (
                              <Button size="sm" className="mt-2" onClick={() => handleApproveNotification(notification)} disabled={notificationLoading}>
                                Approve & Assign
                              </Button>
                            )}
                            {notification.status === 'approved' && (
                              <span className="text-green-600 text-xs font-semibold ml-2">Approved</span>
                            )}
                          </div>
                        </div>
=======
                            <h3 className="font-medium">{notification.title}</h3>
                            <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                            <p className="text-xs text-gray-500 mt-2">{notification.time}</p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          {notification.type === "event" && <Calendar className="w-4 h-4 text-blue-500" />}
                          {notification.type === "resource" && <BookOpen className="w-4 h-4 text-purple-500" />}
                          {notification.type === "certificate" && <Award className="w-4 h-4 text-green-500" />}
                        </div>
>>>>>>> 768d7e3437f156c7a323f951ce4c1510fcaf47d8
                      </div>
                    </CardContent>
                  </Card>
                ))}
<<<<<<< HEAD
                {notifications.length === 0 && !notificationLoading && (
                  <div className="text-gray-500 text-center py-8">No notifications found.</div>
                )}
=======
>>>>>>> 768d7e3437f156c7a323f951ce4c1510fcaf47d8
              </div>
            </div>
          </TabsContent>
        </Tabs>
<<<<<<< HEAD
        {(activeTab === 'flashcards' || activeTab === 'quizzes') && <Chatbot />}
        {/* Add a Dialog for editing (placeholder for now) */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Quiz</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Title</label>
                <Input name="title" value={editForm.title || ''} onChange={handleEditFormChange} />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Input name="description" value={editForm.description || ''} onChange={handleEditFormChange} />
              </div>
              <div>
                <label className="text-sm font-medium">Subject</label>
                <Input name="subject" value={editForm.subject || ''} onChange={handleEditFormChange} />
              </div>
              <div>
                <label className="text-sm font-medium">Difficulty</label>
                <select name="difficulty" className="w-full p-2 border rounded-md" value={editForm.difficulty || 'medium'} onChange={handleEditFormChange}>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Questions</label>
                  <Input name="questionCount" type="number" min="1" value={editForm.questionCount || 10} onChange={handleEditFormChange} />
                </div>
                <div>
                  <label className="text-sm font-medium">Time Limit (min)</label>
                  <Input name="timeLimit" type="number" min="1" value={editForm.timeLimit || 30} onChange={handleEditFormChange} />
                </div>
              </div>
              {editError && <div className="text-red-600 text-sm">{editError}</div>}
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowEditDialog(false)} disabled={editLoading}>Cancel</Button>
                <Button onClick={handleSaveEdit} disabled={editLoading}>{editLoading ? 'Saving...' : 'Save'}</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
=======
>>>>>>> 768d7e3437f156c7a323f951ce4c1510fcaf47d8
      </div>
    </div>
  )
}
