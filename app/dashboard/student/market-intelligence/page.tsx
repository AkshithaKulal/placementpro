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
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Legend,
} from "recharts"
import { TrendingUp, Target, AlertCircle, CheckCircle2 } from "lucide-react"

interface SkillFrequency {
  skill: string
  percentage: number
  count: number
}

interface SkillGapData {
  targetRole: string
  totalPlacedStudents: number
  topSkills: SkillFrequency[]
  missingSkills: string[]
  recommendation: string
  currentStudentSkills: string[]
}

// Common roles for dropdown - can be extended
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

export default function MarketIntelligencePage() {
  const [targetRole, setTargetRole] = useState<string>("")
  const [skillGapData, setSkillGapData] = useState<SkillGapData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchSkillGapAnalysis = async () => {
    if (!targetRole) {
      setError("Please select a target role")
      return
    }

    setLoading(true)
    setError(null)
    setSkillGapData(null)

    try {
      const response = await fetch(
        `/api/analytics/skill-gap?targetRole=${encodeURIComponent(targetRole)}`
      )
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch skill gap analysis")
      }

      setSkillGapData(data)
    } catch (err: any) {
      setError(err.message || "Something went wrong")
      console.error("Error fetching skill gap analysis:", err)
    } finally {
      setLoading(false)
    }
  }

  // Prepare chart data
  const chartData =
    skillGapData?.topSkills.map((skill) => ({
      skill: skill.skill,
      "Placed Students": skill.percentage,
      "Your Skills": skillGapData.currentStudentSkills
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
          Compare your skills with placed students and get actionable recommendations
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Select Target Role
          </CardTitle>
          <CardDescription>
            Choose a role to analyze skill requirements based on placement data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="targetRole">Target Role</Label>
            <Select value={targetRole} onValueChange={setTargetRole}>
              <SelectTrigger id="targetRole">
                <SelectValue placeholder="Select a target role" />
              </SelectTrigger>
              <SelectContent>
                {COMMON_ROLES.map((role) => (
                  <SelectItem key={role} value={role}>
                    {role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={fetchSkillGapAnalysis} disabled={loading || !targetRole}>
            {loading ? "Analyzing..." : "Analyze Skill Gap"}
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

      {loading && (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="flex flex-col items-center gap-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="text-gray-600">Analyzing placement data...</p>
            </div>
          </CardContent>
        </Card>
      )}

      {skillGapData && (
        <>
          {/* Summary Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Analysis Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="text-sm text-gray-600">Target Role</div>
                  <div className="text-2xl font-bold">{skillGapData.targetRole}</div>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="text-sm text-gray-600">Placed Students Analyzed</div>
                  <div className="text-2xl font-bold">
                    {skillGapData.totalPlacedStudents}
                  </div>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <div className="text-sm text-gray-600">Missing Skills</div>
                  <div className="text-2xl font-bold">
                    {skillGapData.missingSkills.length}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Radar Chart */}
          {chartData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Skill Comparison Radar Chart</CardTitle>
                <CardDescription>
                  Your skills vs. top skills of placed students in {skillGapData.targetRole} roles
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <RadarChart data={chartData}>
                    <PolarGrid />
                    <PolarAngleAxis
                      dataKey="skill"
                      tick={{ fontSize: 12 }}
                      className="text-xs"
                    />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} />
                    <Radar
                      name="Placed Students"
                      dataKey="Placed Students"
                      stroke="#3b82f6"
                      fill="#3b82f6"
                      fillOpacity={0.6}
                    />
                    <Radar
                      name="Your Skills"
                      dataKey="Your Skills"
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
                  Skills that are highly valued but missing from your profile
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

          {/* Recommendation Card */}
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-blue-600" />
                Recommended Action
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
                  Most common skills among placed {skillGapData.targetRole} students
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
                          {hasSkill && (
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                          )}
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

          {/* No Data Fallback */}
          {skillGapData.totalPlacedStudents === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">
                  No placement data found for "{skillGapData.targetRole}" roles.
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Try selecting a different role or check back later when more students are placed.
                </p>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
