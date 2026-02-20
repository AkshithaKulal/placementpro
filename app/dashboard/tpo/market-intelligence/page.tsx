"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts"
import {
  TrendingUp,
  Target,
  Users,
  AlertCircle,
  CheckCircle2,
  BarChart3,
} from "lucide-react"

interface MarketOverview {
  totalPlacedStudents: number
  topSkills: { skill: string; count: number; percentage: number }[]
  mostHiredRoles: { role: string; count: number; percentage: number }[]
}

interface SkillGapData {
  studentId: string
  studentName: string
  targetRole: string
  topSkills: { skill: string; count: number; percentage: number }[]
  missingSkills: string[]
  gapScore: number
  recommendation: string
  totalPlacedStudents: number
  currentStudentSkills: string[]
}

interface Student {
  id: string
  name: string
  email: string
  enrollmentNo: string
  branch: string
  year: number
  CGPA: number
}

const COMMON_ROLES = [
  "Software Engineer",
  "Data Analyst",
  "Data Scientist",
  "Full Stack Developer",
  "Frontend Developer",
  "Backend Developer",
  "DevOps Engineer",
  "Machine Learning Engineer",
  "Product Manager",
  "Business Analyst",
  "QA Engineer",
  "UI/UX Designer",
  "Cybersecurity Analyst",
  "Cloud Engineer",
  "Mobile Developer",
]

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884D8",
  "#82CA9D",
  "#FFC658",
  "#FF7C7C",
  "#8DD1E1",
  "#D084D0",
]

export default function MarketIntelligencePage() {
  const [marketOverview, setMarketOverview] = useState<MarketOverview | null>(null)
  const [students, setStudents] = useState<Student[]>([])
  const [selectedStudentId, setSelectedStudentId] = useState<string>("")
  const [selectedRole, setSelectedRole] = useState<string>("all")
  const [skillGapData, setSkillGapData] = useState<SkillGapData | null>(null)
  const [loadingOverview, setLoadingOverview] = useState(true)
  const [loadingStudents, setLoadingStudents] = useState(true)
  const [loadingGap, setLoadingGap] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchMarketOverview()
    fetchStudents()
  }, [])

  const fetchMarketOverview = async () => {
    try {
      const response = await fetch("/api/tpo/market-intelligence")
      const data = await response.json()
      if (response.ok) {
        setMarketOverview(data)
      }
    } catch (error) {
      console.error("Failed to fetch market overview:", error)
    } finally {
      setLoadingOverview(false)
    }
  }

  const fetchStudents = async () => {
    try {
      const response = await fetch("/api/tpo/students")
      const data = await response.json()
      if (response.ok) {
        setStudents(data)
      }
    } catch (error) {
      console.error("Failed to fetch students:", error)
    } finally {
      setLoadingStudents(false)
    }
  }

  const analyzeSkillGap = async () => {
    if (!selectedStudentId) {
      setError("Please select a student")
      return
    }

    setLoadingGap(true)
    setError(null)
    setSkillGapData(null)

    try {
      const response = await fetch("/api/tpo/skill-gap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: selectedStudentId,
          role: selectedRole === "all" ? undefined : selectedRole,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to analyze skill gap")
      }

      setSkillGapData(data)
    } catch (err: any) {
      setError(err.message || "Something went wrong")
      console.error("Error analyzing skill gap:", err)
    } finally {
      setLoadingGap(false)
    }
  }

  // Prepare chart data
  const skillGapChartData =
    skillGapData?.topSkills.map((skill) => ({
      skill: skill.skill,
      "Placed Students": skill.percentage,
      "Student Skills": skillGapData.currentStudentSkills
        .map((s) => s.trim().toLowerCase())
        .includes(skill.skill.trim().toLowerCase())
        ? skill.percentage
        : 0,
    })) || []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Market Intelligence & Analytics</h1>
        <p className="text-gray-600">
          Data-driven insights about student placements and skill demand trends
        </p>
      </div>

      {/* Market Overview Section */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <BarChart3 className="h-6 w-6" />
          Market Overview
        </h2>

        {loadingOverview ? (
          <Card>
            <CardContent className="py-12 text-center">
              <div className="flex flex-col items-center gap-2">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <p className="text-gray-600">Loading market data...</p>
              </div>
            </CardContent>
          </Card>
        ) : marketOverview ? (
          <>
            {/* Summary Cards */}
            <div className="grid md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Placed Students</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{marketOverview.totalPlacedStudents}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Top Skills Tracked</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{marketOverview.topSkills.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Roles</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{marketOverview.mostHiredRoles.length}</div>
                </CardContent>
              </Card>
            </div>

            {/* Top Skills Chart */}
            {marketOverview.topSkills.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Top 10 Most Common Skills</CardTitle>
                  <CardDescription>
                    Skills frequency among placed students
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={marketOverview.topSkills}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="skill"
                        angle={-45}
                        textAnchor="end"
                        height={100}
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="percentage" fill="#3b82f6" name="Percentage (%)" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {/* Most Hired Roles Chart */}
            {marketOverview.mostHiredRoles.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Most Hired Job Roles</CardTitle>
                  <CardDescription>
                    Distribution of placements by role
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={marketOverview.mostHiredRoles}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="role" angle={-45} textAnchor="end" height={100} />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="count" fill="#10b981" name="Placements" />
                      </BarChart>
                    </ResponsiveContainer>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={marketOverview.mostHiredRoles}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ role, percentage }) => `${role}: ${percentage}%`}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="count"
                        >
                          {marketOverview.mostHiredRoles.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}

            {marketOverview.totalPlacedStudents === 0 && (
              <Card>
                <CardContent className="py-12 text-center">
                  <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No placement data available yet.</p>
                </CardContent>
              </Card>
            )}
          </>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-600">Failed to load market overview</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Skill Gap Analysis Section */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <Target className="h-6 w-6" />
          Skill Gap Analysis
        </h2>

        <Card>
          <CardHeader>
            <CardTitle>Analyze Student Skill Gap</CardTitle>
            <CardDescription>
              Compare a student's skills with successfully placed students
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="student">Select Student</Label>
                <Select
                  value={selectedStudentId}
                  onValueChange={setSelectedStudentId}
                  disabled={loadingStudents}
                >
                  <SelectTrigger id="student">
                    <SelectValue placeholder="Select a student" />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map((student) => (
                      <SelectItem key={student.id} value={student.id}>
                        {student.name} ({student.enrollmentNo}) - {student.branch}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Target Role (Optional)</Label>
                <Select value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger id="role">
                    <SelectValue placeholder="All roles" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    {COMMON_ROLES.map((role) => (
                      <SelectItem key={role} value={role}>
                        {role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button onClick={analyzeSkillGap} disabled={loadingGap || !selectedStudentId}>
              {loadingGap ? "Analyzing..." : "Analyze Skill Gap"}
            </Button>
          </CardContent>
        </Card>

        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-red-800">
                <AlertCircle className="h-5 w-5" />
                <p>{error}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {loadingGap && (
          <Card>
            <CardContent className="py-12 text-center">
              <div className="flex flex-col items-center gap-2">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <p className="text-gray-600">Analyzing skill gap...</p>
              </div>
            </CardContent>
          </Card>
        )}

        {skillGapData && (
          <>
            {/* Summary Card */}
            <Card>
              <CardHeader>
                <CardTitle>Analysis Results</CardTitle>
                <CardDescription>
                  Skill gap analysis for {skillGapData.studentName}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-4 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="text-sm text-gray-600">Target Role</div>
                    <div className="text-xl font-bold">{skillGapData.targetRole}</div>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="text-sm text-gray-600">Gap Score</div>
                    <div className="text-xl font-bold">{skillGapData.gapScore}%</div>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <div className="text-sm text-gray-600">Missing Skills</div>
                    <div className="text-xl font-bold">
                      {skillGapData.missingSkills.length}
                    </div>
                  </div>
                  <div className="p-4 bg-orange-50 rounded-lg">
                    <div className="text-sm text-gray-600">Data Points</div>
                    <div className="text-xl font-bold">
                      {skillGapData.totalPlacedStudents}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Radar Chart */}
            {skillGapChartData.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Skill Comparison Radar Chart</CardTitle>
                  <CardDescription>
                    Student skills vs. top skills of placed students
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <RadarChart data={skillGapChartData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="skill" tick={{ fontSize: 12 }} />
                      <PolarRadiusAxis angle={90} domain={[0, 100]} />
                      <Radar
                        name="Placed Students"
                        dataKey="Placed Students"
                        stroke="#3b82f6"
                        fill="#3b82f6"
                        fillOpacity={0.6}
                      />
                      <Radar
                        name="Student Skills"
                        dataKey="Student Skills"
                        stroke="#10b981"
                        fill="#10b981"
                        fillOpacity={0.6}
                      />
                      <Legend />
                    </RadarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {/* Missing Skills */}
            {skillGapData.missingSkills.length > 0 && (
              <Card className="border-orange-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-orange-800">
                    <AlertCircle className="h-5 w-5" />
                    Missing Skills
                  </CardTitle>
                  <CardDescription>
                    Skills that are highly valued but missing from the student's profile
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {skillGapData.missingSkills.map((skill) => {
                      const skillData = skillGapData.topSkills.find((s) => s.skill === skill)
                      return (
                        <div
                          key={skill}
                          className="px-4 py-2 bg-orange-100 text-orange-800 rounded-lg border border-orange-200"
                        >
                          <div className="font-semibold">{skill}</div>
                          {skillData && (
                            <div className="text-xs text-orange-600">
                              {skillData.percentage}% of placed students
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recommendation */}
            <Card className="border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-blue-600" />
                  Recommendation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">{skillGapData.recommendation}</p>
              </CardContent>
            </Card>

            {/* Top Skills Table */}
            {skillGapData.topSkills.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Top Skills Breakdown</CardTitle>
                  <CardDescription>
                    Most common skills among placed students for {skillGapData.targetRole}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {skillGapData.topSkills.map((skill, index) => {
                      const hasSkill = skillGapData.currentStudentSkills
                        .map((s) => s.trim().toLowerCase())
                        .includes(skill.skill.trim().toLowerCase())
                      return (
                        <div
                          key={skill.skill}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-medium text-gray-500">
                              #{index + 1}
                            </span>
                            <span className="font-semibold">{skill.skill}</span>
                            {hasSkill && <CheckCircle2 className="h-4 w-4 text-green-600" />}
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-sm text-gray-600">
                              {skill.count} students ({skill.percentage}%)
                            </div>
                            <div className="w-32 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ width: `${skill.percentage}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  )
}
