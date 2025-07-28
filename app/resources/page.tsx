"use client"

import { useState, useEffect } from "react"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  FileText,
  Award,
  Code,
  MessageSquare,
  Download,
  Search,
  Lock,
  ExternalLink,
  BookOpen,
  Trophy,
  HelpCircle,
  Calendar,
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export default function ResourcesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoggedIn, setIsLoggedIn] = useState(false) // This would come from auth context
  const [resources, setResources] = useState<{
    pyqs: any[];
    certifications: any[];
    hackathons: any[];
    interviews: any[];
  }>({ pyqs: [], certifications: [], hackathons: [], interviews: [] })
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    async function fetchResources() {
      setLoading(true)
      const types = ["pyqs", "certifications", "hackathons", "interviews"]
      const results: any = {}
      for (const type of types) {
        const res = await fetch(`/api/resources?type=${type}`)
        const data = await res.json()
        results[type] = Array.isArray(data) ? data : []
      }
      setResources(results)
      setLoading(false)
    }
    fetchResources()
  }, [])

  const filteredPyqs = (resources.pyqs as any[]).filter(
    (pyq) =>
      (pyq.subject?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (pyq.year || '').includes(searchTerm) ||
      (pyq.semester || '').includes(searchTerm)
  )

  const handleDownload = (type: string, resourceId: string, fileId?: string) => {
    if (!isLoggedIn) {
      toast({
        title: "Login to download",
        description: "Please login to download this resource.",
        variant: "destructive",
      })
      return
    }
    setResources((prev: any) => {
      const updated = { ...prev }
      updated[type] = updated[type].map((res: any) =>
        res._id === resourceId ? { ...res, downloads: (res.downloads || 0) + 1 } : res
      )
      return updated
    })
    if (fileId) {
      window.open(`/api/files/${fileId}?type=${type}&resourceId=${resourceId}`, '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <div className="relative min-h-screen bg-background overflow-hidden">
      {/* Decorative gradient blobs */}
      <div className="absolute -top-16 -left-16 w-[22rem] h-[18rem] bg-gradient-to-br from-blue-400 via-purple-400 to-transparent opacity-30 rounded-full blur-[80px] z-0" />
      <div className="absolute bottom-0 right-0 w-[16rem] h-[16rem] bg-gradient-to-tr from-purple-400 via-pink-400 to-transparent opacity-20 rounded-full blur-[50px] z-0" />
      <Navigation />

      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">Academic Resources</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Access previous year question papers, certifications, hackathons, and interview resources
          </p>
        </div>

        <Tabs defaultValue="pyqs" className="w-full">
          <TabsList className="grid w-full grid-cols-4 max-w-2xl mx-auto mb-8">
            <TabsTrigger value="pyqs">PYQs</TabsTrigger>
            <TabsTrigger value="certifications">Certifications</TabsTrigger>
            <TabsTrigger value="hackathons">Hackathons</TabsTrigger>
            <TabsTrigger value="interviews">Interviews</TabsTrigger>
          </TabsList>

          <TabsContent value="pyqs">
            <div className="mb-6">
              <div className="relative max-w-md mx-auto">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search by subject, year, or semester..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {loading ? (
                <p>Loading resources...</p>
              ) : filteredPyqs.length === 0 ? (
                <p>No resources found.</p>
              ) : (
                filteredPyqs.map((pyq) => (
                  <Card key={pyq._id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary">{pyq.subject}</Badge>
                        <Badge variant="outline">{pyq.semester}</Badge>
                      </div>
                      <CardTitle className="text-lg">{pyq.year}</CardTitle>
                      <CardDescription>{pyq.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center text-sm text-gray-600">
                          <FileText className="w-4 h-4 mr-2" />
                          {pyq.fileType} • {pyq.fileSize}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Download className="w-4 h-4 mr-2" />
                          {pyq.downloads || 0} downloads
                        </div>
                      </div>
                      <Button
                        onClick={() => handleDownload('pyqs', pyq._id, pyq.fileId)}
                        className="w-full"
                        disabled={!isLoggedIn}
                      >
                        {!isLoggedIn ? (
                          <>
                            <Lock className="w-4 h-4 mr-2" />
                            Login to Download
                          </>
                        ) : (
                          <>
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="certifications">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {loading ? (
                <p>Loading certifications...</p>
              ) : resources.certifications.length === 0 ? (
                <p>No certifications found.</p>
              ) : (
                resources.certifications.map((cert) => (
                  <Card key={cert._id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary">{cert.provider}</Badge>
                        <Badge variant="outline">{cert.level}</Badge>
                      </div>
                      <CardTitle className="text-lg">{cert.name}</CardTitle>
                      <CardDescription>{cert.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center text-sm text-gray-600">
                          <Award className="w-4 h-4 mr-2" />
                          {cert.duration} • {cert.price}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Trophy className="w-4 h-4 mr-2" />
                          {cert.rating}/5.0 rating
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Button
                          onClick={() => window.open(cert.link, '_blank')}
                          className="w-full"
                          variant="outline"
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          View Course
                        </Button>
                        <Button
                          onClick={() => handleDownload('certifications', cert._id)}
                          className="w-full"
                          disabled={!isLoggedIn}
                        >
                          {!isLoggedIn ? (
                            <>
                              <Lock className="w-4 h-4 mr-2" />
                              Login to Download
                            </>
                          ) : (
                            <>
                              <Download className="w-4 h-4 mr-2" />
                              Download Materials
                            </>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="hackathons">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {loading ? (
                <p>Loading hackathons...</p>
              ) : resources.hackathons.length === 0 ? (
                <p>No hackathons found.</p>
              ) : (
                resources.hackathons.map((hack) => (
                  <Card key={hack._id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary">{hack.platform}</Badge>
                        <Badge variant="outline">{hack.status}</Badge>
                      </div>
                      <CardTitle className="text-lg">{hack.name}</CardTitle>
                      <CardDescription>{hack.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="w-4 h-4 mr-2" />
                          {hack.startDate} - {hack.endDate}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Trophy className="w-4 h-4 mr-2" />
                          Prize Pool: {hack.prizePool}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Button
                          onClick={() => window.open(hack.link, '_blank')}
                          className="w-full"
                          variant="outline"
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Register Now
                        </Button>
                        <Button
                          onClick={() => handleDownload('hackathons', hack._id)}
                          className="w-full"
                          disabled={!isLoggedIn}
                        >
                          {!isLoggedIn ? (
                            <>
                              <Lock className="w-4 h-4 mr-2" />
                              Login to Download
                            </>
                          ) : (
                            <>
                              <Download className="w-4 h-4 mr-2" />
                              Download Resources
                            </>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="interviews">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {loading ? (
                <p>Loading interview resources...</p>
              ) : resources.interviews.length === 0 ? (
                <p>No interview resources found.</p>
              ) : (
                resources.interviews.map((interview) => (
                  <Card key={interview._id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary">{interview.company}</Badge>
                        <Badge variant="outline">{interview.role}</Badge>
                      </div>
                      <CardTitle className="text-lg">{interview.title}</CardTitle>
                      <CardDescription>{interview.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center text-sm text-gray-600">
                          <MessageSquare className="w-4 h-4 mr-2" />
                          {interview.questionCount} questions
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <BookOpen className="w-4 h-4 mr-2" />
                          {interview.difficulty} level
                        </div>
                      </div>
                      <Button
                        onClick={() => handleDownload('interviews', interview._id)}
                        className="w-full"
                        disabled={!isLoggedIn}
                      >
                        {!isLoggedIn ? (
                          <>
                            <Lock className="w-4 h-4 mr-2" />
                            Login to Download
                          </>
                        ) : (
                          <>
                            <Download className="w-4 h-4 mr-2" />
                            Download Questions
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>

        {!isLoggedIn && (
          <Alert className="mt-8">
            <Lock className="h-4 w-4" />
            <AlertDescription>
              Login to access all resources and download materials. Some resources require authentication.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  )
}
