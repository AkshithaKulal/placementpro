"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Legend,
} from "recharts"

interface SkillGapData {
  selectedStudents: string[]
  skillFrequency: Record<string, number>
  currentStudentSkills: string[]
  missingSkills: string[]
}

export default function SkillGapPage() {
  const [selectedStudents, setSelectedStudents] = useState<string[]>([])
  const [allStudents, setAllStudents] = useState<
    { id: string; name: string; enrollmentNo: string }[]
  >([])
  const [skillGapData, setSkillGapData] = useState<SkillGapData | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchAllStudents()
  }, [])

  const fetchAllStudents = async () => {
    try {
      const response = await fetch("/api/student/all-students")
      const data = await response.json()
      if (response.ok) {
        setAllStudents(data)
      }
    } catch (error) {
      console.error("Failed to fetch students:", error)
    }
  }

  const analyzeSkillGap = async () => {
    if (selectedStudents.length === 0) {
      alert("Please select at least one student")
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/student/skill-gap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ selectedStudents }),
      })

      const data = await response.json()
      if (response.ok) {
        setSkillGapData(data)
      }
    } catch (error) {
      console.error("Failed to analyze skill gap:", error)
    } finally {
      setLoading(false)
    }
  }

  const toggleStudent = (studentId: string) => {
    setSelectedStudents((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId]
    )
  }

  const chartData =
    skillGapData?.skillFrequency
      ? Object.entries(skillGapData.skillFrequency)
          .map(([skill, count]) => ({
            skill,
            frequency: count,
            current: skillGapData.currentStudentSkills.includes(skill) ? 1 : 0,
          }))
          .sort((a, b) => b.frequency - a.frequency)
          .slice(0, 10)
      : []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Skill Gap Analysis</h1>
        <p className="text-gray-600">
          Compare your skills with selected students
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Select Students</CardTitle>
          <CardDescription>
            Choose students to compare skills with
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="max-h-64 overflow-y-auto border rounded-md p-4 space-y-2">
            {allStudents.length === 0 ? (
              <p className="text-gray-500">No students found</p>
            ) : (
              allStudents.map((student) => (
                <label
                  key={student.id}
                  className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                >
                  <input
                    type="checkbox"
                    checked={selectedStudents.includes(student.id)}
                    onChange={() => toggleStudent(student.id)}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm">
                    {student.name || student.enrollmentNo} ({student.enrollmentNo})
                  </span>
                </label>
              ))
            )}
          </div>
          <div className="mt-4">
            <Button onClick={analyzeSkillGap} disabled={loading || selectedStudents.length === 0}>
              {loading ? "Analyzing..." : "Analyze Skill Gap"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {skillGapData && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Skill Frequency Comparison</CardTitle>
              <CardDescription>
                Top skills among selected students vs your skills
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <RadarChart data={chartData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="skill" />
                  <PolarRadiusAxis angle={90} domain={[0, "dataMax"]} />
                  <Radar
                    name="Selected Students"
                    dataKey="frequency"
                    stroke="#0088FE"
                    fill="#0088FE"
                    fillOpacity={0.6}
                  />
                  <Radar
                    name="Your Skills"
                    dataKey="current"
                    stroke="#00C49F"
                    fill="#00C49F"
                    fillOpacity={0.6}
                  />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Missing Skills</CardTitle>
              <CardDescription>
                Skills you should consider learning
              </CardDescription>
            </CardHeader>
            <CardContent>
              {skillGapData.missingSkills.length === 0 ? (
                <p className="text-green-600">
                  Great! You have all the important skills.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {skillGapData.missingSkills.map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
