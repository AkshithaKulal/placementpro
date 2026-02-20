"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer"
import { Textarea } from "@/components/ui/textarea"

const COLLEGE_NAME = process.env.NEXT_PUBLIC_COLLEGE_NAME || "PlacementPro College"
const COLLEGE_LOGO_URL = process.env.NEXT_PUBLIC_COLLEGE_LOGO_URL || ""

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 12,
    fontFamily: "Helvetica",
  },
  collegeHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    paddingBottom: 12,
    borderBottom: "2 solid #1e40af",
  },
  collegeName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1e40af",
  },
  header: {
    marginBottom: 20,
    borderBottom: "1 solid #ccc",
    paddingBottom: 10,
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 5,
  },
  contact: {
    fontSize: 10,
    marginTop: 5,
  },
  section: {
    marginTop: 15,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
    borderBottom: "1 solid #ccc",
    paddingBottom: 3,
  },
  item: {
    marginBottom: 5,
  },
  skill: {
    marginRight: 5,
  },
})

interface ResumeData {
  name: string
  email: string
  phone: string
  address: string
  linkedin: string
  github: string
  objective: string
  education: {
    degree: string
    institution: string
    year: string
    cgpa: string
  }[]
  skills: string[]
  projects: {
    title: string
    description: string
    tech: string
  }[]
  experience: {
    company: string
    role: string
    duration: string
    description: string
  }[]
}

const ResumePDF = ({ data }: { data: ResumeData }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.collegeHeader}>
        <Text style={styles.collegeName}>{COLLEGE_NAME}</Text>
      </View>
      <View style={styles.header}>
        <Text style={styles.name}>{data.name}</Text>
        <Text style={styles.contact}>
          {data.email} | {data.phone}
        </Text>
        {data.address && <Text style={styles.contact}>{data.address}</Text>}
        {(data.linkedin || data.github) && (
          <Text style={styles.contact}>
            {data.linkedin && `LinkedIn: ${data.linkedin}`}
            {data.linkedin && data.github && " | "}
            {data.github && `GitHub: ${data.github}`}
          </Text>
        )}
      </View>

      {data.objective && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Objective</Text>
          <Text>{data.objective}</Text>
        </View>
      )}

      {data.education.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Education</Text>
          {data.education.map((edu, idx) => (
            <View key={idx} style={styles.item}>
              <Text>
                <Text style={{ fontWeight: "bold" }}>{edu.degree}</Text> - {edu.institution} ({edu.year})
              </Text>
              {edu.cgpa && <Text>CGPA: {edu.cgpa}</Text>}
            </View>
          ))}
        </View>
      )}

      {data.skills.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Skills</Text>
          <Text>{data.skills.join(", ")}</Text>
        </View>
      )}

      {data.projects.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Projects</Text>
          {data.projects.map((proj, idx) => (
            <View key={idx} style={styles.item}>
              <Text style={{ fontWeight: "bold" }}>{proj.title}</Text>
              <Text>{proj.description}</Text>
              {proj.tech && <Text>Tech: {proj.tech}</Text>}
            </View>
          ))}
        </View>
      )}

      {data.experience.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Experience</Text>
          {data.experience.map((exp, idx) => (
            <View key={idx} style={styles.item}>
              <Text style={{ fontWeight: "bold" }}>
                {exp.role} at {exp.company}
              </Text>
              <Text>{exp.duration}</Text>
              <Text>{exp.description}</Text>
            </View>
          ))}
        </View>
      )}
    </Page>
  </Document>
)

export default function ResumePage() {
  const [step, setStep] = useState(1)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [resumeData, setResumeData] = useState<ResumeData>({
    name: "",
    email: "",
    phone: "",
    address: "",
    linkedin: "",
    github: "",
    objective: "",
    education: [{ degree: "", institution: "", year: "", cgpa: "" }],
    skills: [],
    projects: [{ title: "", description: "", tech: "" }],
    experience: [{ company: "", role: "", duration: "", description: "" }],
  })

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      const response = await fetch("/api/student/profile")
      const data = await response.json()
      if (response.ok) {
        setResumeData((prev) => ({
          ...prev,
          name: data.enrollmentNo || "",
          email: "",
          phone: data.phone || "",
          address: data.address || "",
          linkedin: data.linkedin || "",
          github: data.github || "",
          skills: data.skills || [],
        }))
      }
    } catch (error) {
      console.error("Failed to load profile:", error)
    }
  }

  const addEducation = () => {
    setResumeData({
      ...resumeData,
      education: [
        ...resumeData.education,
        { degree: "", institution: "", year: "", cgpa: "" },
      ],
    })
  }

  const addProject = () => {
    setResumeData({
      ...resumeData,
      projects: [
        ...resumeData.projects,
        { title: "", description: "", tech: "" },
      ],
    })
  }

  const addExperience = () => {
    setResumeData({
      ...resumeData,
      experience: [
        ...resumeData.experience,
        { company: "", role: "", duration: "", description: "" },
      ],
    })
  }

  const validateStep1 = (): boolean => {
    const newErrors: Record<string, string> = {}
    
    if (!resumeData.name.trim()) {
      newErrors.name = "Full Name is required"
    }
    if (!resumeData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(resumeData.email)) {
      newErrors.email = "Please enter a valid email address"
    }
    if (!resumeData.phone.trim()) {
      newErrors.phone = "Phone number is required"
    } else if (!/^[\d\s\-\+\(\)]+$/.test(resumeData.phone)) {
      newErrors.phone = "Please enter a valid phone number"
    }
    if (!resumeData.objective.trim()) {
      newErrors.objective = "Objective is required"
    } else if (resumeData.objective.trim().length < 50) {
      newErrors.objective = "Objective must be at least 50 characters"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateStep2 = (): boolean => {
    const newErrors: Record<string, string> = {}
    
    // Validate at least one education entry with required fields
    const hasValidEducation = resumeData.education.some(
      (edu) => edu.degree.trim() && edu.institution.trim() && edu.year.trim()
    )
    
    if (!hasValidEducation) {
      newErrors.education = "At least one education entry with Degree, Institution, and Year is required"
    } else {
      // Validate each education entry
      resumeData.education.forEach((edu, idx) => {
        if (edu.degree.trim() || edu.institution.trim() || edu.year.trim()) {
          if (!edu.degree.trim()) {
            newErrors[`education_${idx}_degree`] = "Degree is required"
          }
          if (!edu.institution.trim()) {
            newErrors[`education_${idx}_institution`] = "Institution is required"
          }
          if (!edu.year.trim()) {
            newErrors[`education_${idx}_year`] = "Year is required"
          }
        }
      })
    }

    if (resumeData.skills.length === 0 || resumeData.skills.every(s => !s.trim())) {
      newErrors.skills = "At least one skill is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (step === 1 && !validateStep1()) {
      return
    }
    if (step === 2 && !validateStep2()) {
      return
    }
    setStep(Math.min(4, step + 1))
    setErrors({})
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Resume Wizard</h1>
        <p className="text-gray-600">Multi-step form to build your professional resume</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Step {step} of 4</CardTitle>
          <CardDescription>
            {step === 1 && "Personal details (Name, Email, Phone, LinkedIn, GitHub)"}
            {step === 2 && "Education (Degree, College, CGPA) & Skills"}
            {step === 3 && "Projects & Internships (optional)"}
            {step === 4 && "Review & Download PDF"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={resumeData.name}
                  onChange={(e) => {
                    setResumeData({ ...resumeData, name: e.target.value })
                    if (errors.name) setErrors({ ...errors, name: "" })
                  }}
                  required
                  className={errors.name ? "border-red-500" : ""}
                />
                {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={resumeData.email}
                  onChange={(e) => {
                    setResumeData({ ...resumeData, email: e.target.value })
                    if (errors.email) setErrors({ ...errors, email: "" })
                  }}
                  required
                  className={errors.email ? "border-red-500" : ""}
                />
                {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone *</Label>
                  <Input
                    id="phone"
                    value={resumeData.phone}
                    onChange={(e) => {
                      setResumeData({ ...resumeData, phone: e.target.value })
                      if (errors.phone) setErrors({ ...errors, phone: "" })
                    }}
                    required
                    placeholder="+1 (555) 123-4567"
                    className={errors.phone ? "border-red-500" : ""}
                  />
                  {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={resumeData.address}
                    onChange={(e) =>
                      setResumeData({ ...resumeData, address: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="linkedin">LinkedIn</Label>
                  <Input
                    id="linkedin"
                    value={resumeData.linkedin}
                    onChange={(e) =>
                      setResumeData({ ...resumeData, linkedin: e.target.value })
                    }
                    placeholder="linkedin.com/in/yourprofile"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="github">GitHub</Label>
                  <Input
                    id="github"
                    value={resumeData.github}
                    onChange={(e) =>
                      setResumeData({ ...resumeData, github: e.target.value })
                    }
                    placeholder="github.com/yourusername"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="objective">Objective *</Label>
                <Textarea
                  id="objective"
                  value={resumeData.objective}
                  onChange={(e) => {
                    setResumeData({ ...resumeData, objective: e.target.value })
                    if (errors.objective) setErrors({ ...errors, objective: "" })
                  }}
                  rows={4}
                  required
                  placeholder="Write a brief professional objective (minimum 50 characters)"
                  className={errors.objective ? "border-red-500" : ""}
                />
                {errors.objective && <p className="text-sm text-red-500">{errors.objective}</p>}
                <p className="text-xs text-gray-500">
                  {resumeData.objective.length} / 50 characters minimum
                </p>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <Label>Education *</Label>
                  <Button type="button" size="sm" onClick={addEducation}>
                    Add Education
                  </Button>
                </div>
                {errors.education && (
                  <p className="text-sm text-red-500 mb-2">{errors.education}</p>
                )}
                {resumeData.education.map((edu, idx) => (
                  <div key={idx} className="grid grid-cols-2 gap-4 mb-4 p-4 border rounded">
                    <div className="space-y-2">
                      <Label>Degree *</Label>
                      <Input
                        value={edu.degree}
                        onChange={(e) => {
                          const newEdu = [...resumeData.education]
                          newEdu[idx].degree = e.target.value
                          setResumeData({ ...resumeData, education: newEdu })
                          if (errors[`education_${idx}_degree`]) {
                            const newErrors = { ...errors }
                            delete newErrors[`education_${idx}_degree`]
                            setErrors(newErrors)
                          }
                        }}
                        required
                        placeholder="e.g., B.Tech Computer Science"
                        className={errors[`education_${idx}_degree`] ? "border-red-500" : ""}
                      />
                      {errors[`education_${idx}_degree`] && (
                        <p className="text-xs text-red-500">{errors[`education_${idx}_degree`]}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label>Institution *</Label>
                      <Input
                        value={edu.institution}
                        onChange={(e) => {
                          const newEdu = [...resumeData.education]
                          newEdu[idx].institution = e.target.value
                          setResumeData({ ...resumeData, education: newEdu })
                          if (errors[`education_${idx}_institution`]) {
                            const newErrors = { ...errors }
                            delete newErrors[`education_${idx}_institution`]
                            setErrors(newErrors)
                          }
                        }}
                        required
                        placeholder="e.g., University Name"
                        className={errors[`education_${idx}_institution`] ? "border-red-500" : ""}
                      />
                      {errors[`education_${idx}_institution`] && (
                        <p className="text-xs text-red-500">{errors[`education_${idx}_institution`]}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label>Year *</Label>
                      <Input
                        value={edu.year}
                        onChange={(e) => {
                          const newEdu = [...resumeData.education]
                          newEdu[idx].year = e.target.value
                          setResumeData({ ...resumeData, education: newEdu })
                          if (errors[`education_${idx}_year`]) {
                            const newErrors = { ...errors }
                            delete newErrors[`education_${idx}_year`]
                            setErrors(newErrors)
                          }
                        }}
                        required
                        placeholder="e.g., 2020-2024"
                        className={errors[`education_${idx}_year`] ? "border-red-500" : ""}
                      />
                      {errors[`education_${idx}_year`] && (
                        <p className="text-xs text-red-500">{errors[`education_${idx}_year`]}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label>CGPA</Label>
                      <Input
                        value={edu.cgpa}
                        onChange={(e) => {
                          const newEdu = [...resumeData.education]
                          newEdu[idx].cgpa = e.target.value
                          setResumeData({ ...resumeData, education: newEdu })
                        }}
                        placeholder="e.g., 8.5"
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                <Label>Skills (comma-separated) *</Label>
                <Input
                  value={resumeData.skills.join(", ")}
                  onChange={(e) => {
                    setResumeData({
                      ...resumeData,
                      skills: e.target.value.split(",").map((s) => s.trim()).filter(s => s),
                    })
                    if (errors.skills) setErrors({ ...errors, skills: "" })
                  }}
                  placeholder="e.g., JavaScript, React, Node.js, Python"
                  required
                  className={errors.skills ? "border-red-500" : ""}
                />
                {errors.skills && <p className="text-sm text-red-500">{errors.skills}</p>}
                <p className="text-xs text-gray-500">
                  {resumeData.skills.filter(s => s.trim()).length} skill(s) added
                </p>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <Label>Projects</Label>
                  <Button type="button" size="sm" onClick={addProject}>
                    Add
                  </Button>
                </div>
                {resumeData.projects.map((proj, idx) => (
                  <div key={idx} className="mb-4 p-4 border rounded space-y-2">
                    <Input
                      placeholder="Project Title"
                      value={proj.title}
                      onChange={(e) => {
                        const newProj = [...resumeData.projects]
                        newProj[idx].title = e.target.value
                        setResumeData({ ...resumeData, projects: newProj })
                      }}
                    />
                    <textarea
                      className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      placeholder="Description"
                      value={proj.description}
                      onChange={(e) => {
                        const newProj = [...resumeData.projects]
                        newProj[idx].description = e.target.value
                        setResumeData({ ...resumeData, projects: newProj })
                      }}
                    />
                    <Input
                      placeholder="Technologies used"
                      value={proj.tech}
                      onChange={(e) => {
                        const newProj = [...resumeData.projects]
                        newProj[idx].tech = e.target.value
                        setResumeData({ ...resumeData, projects: newProj })
                      }}
                    />
                  </div>
                ))}
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <Label>Internships (Optional)</Label>
                  <Button type="button" size="sm" onClick={addExperience}>
                    Add
                  </Button>
                </div>
                {resumeData.experience.map((exp, idx) => (
                  <div key={idx} className="mb-4 p-4 border rounded space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        placeholder="Role"
                        value={exp.role}
                        onChange={(e) => {
                          const newExp = [...resumeData.experience]
                          newExp[idx].role = e.target.value
                          setResumeData({ ...resumeData, experience: newExp })
                        }}
                      />
                      <Input
                        placeholder="Company"
                        value={exp.company}
                        onChange={(e) => {
                          const newExp = [...resumeData.experience]
                          newExp[idx].company = e.target.value
                          setResumeData({ ...resumeData, experience: newExp })
                        }}
                      />
                    </div>
                    <Input
                      placeholder="Duration"
                      value={exp.duration}
                      onChange={(e) => {
                        const newExp = [...resumeData.experience]
                        newExp[idx].duration = e.target.value
                        setResumeData({ ...resumeData, experience: newExp })
                      }}
                    />
                    <textarea
                      className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      placeholder="Description"
                      value={exp.description}
                      onChange={(e) => {
                        const newExp = [...resumeData.experience]
                        newExp[idx].description = e.target.value
                        setResumeData({ ...resumeData, experience: newExp })
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <div className="text-center space-y-4">
                <div>
                  <h3 className="text-xl font-bold mb-2">Your Resume is Ready!</h3>
                  <p className="text-gray-600">Download your resume as a PDF file</p>
                </div>
                <PDFDownloadLink
                  document={<ResumePDF data={resumeData} />}
                  fileName={`${resumeData.name.replace(/\s+/g, '_')}_Resume.pdf`}
                  className="inline-block"
                >
                  <Button size="lg" className="min-w-[200px]">
                    Download Resume PDF
                  </Button>
                </PDFDownloadLink>
              </div>
              <div className="border rounded p-6 space-y-4 bg-gray-50">
                <div className="border-b pb-3">
                  <h3 className="font-bold text-lg">{resumeData.name}</h3>
                  <p className="text-sm text-gray-600">
                    {resumeData.email} | {resumeData.phone}
                  </p>
                  {resumeData.address && (
                    <p className="text-sm text-gray-600">{resumeData.address}</p>
                  )}
                  {(resumeData.linkedin || resumeData.github) && (
                    <p className="text-sm text-gray-600">
                      {resumeData.linkedin && `LinkedIn: ${resumeData.linkedin}`}
                      {resumeData.linkedin && resumeData.github && " | "}
                      {resumeData.github && `GitHub: ${resumeData.github}`}
                    </p>
                  )}
                </div>
                {resumeData.objective && (
                  <div>
                    <h4 className="font-semibold mb-1">Objective</h4>
                    <p className="text-sm">{resumeData.objective}</p>
                  </div>
                )}
                {resumeData.education.length > 0 && resumeData.education.some(e => e.degree || e.institution) && (
                  <div>
                    <h4 className="font-semibold mb-2">Education</h4>
                    {resumeData.education.map((edu, idx) => (
                      <div key={idx} className="mb-2">
                        <p className="text-sm font-medium">
                          {edu.degree} - {edu.institution} ({edu.year})
                        </p>
                        {edu.cgpa && <p className="text-sm text-gray-600">CGPA: {edu.cgpa}</p>}
                      </div>
                    ))}
                  </div>
                )}
                {resumeData.skills.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-1">Skills</h4>
                    <p className="text-sm">{resumeData.skills.filter(s => s.trim()).join(", ")}</p>
                  </div>
                )}
                {resumeData.projects.length > 0 && resumeData.projects.some(p => p.title) && (
                  <div>
                    <h4 className="font-semibold mb-2">Projects</h4>
                    {resumeData.projects.map((proj, idx) => (
                      proj.title && (
                        <div key={idx} className="mb-2">
                          <p className="text-sm font-medium">{proj.title}</p>
                          {proj.description && <p className="text-sm text-gray-600">{proj.description}</p>}
                          {proj.tech && <p className="text-sm text-gray-500">Tech: {proj.tech}</p>}
                        </div>
                      )
                    ))}
                  </div>
                )}
                {resumeData.experience.length > 0 && resumeData.experience.some(e => e.company || e.role) && (
                  <div>
                    <h4 className="font-semibold mb-2">Experience</h4>
                    {resumeData.experience.map((exp, idx) => (
                      (exp.company || exp.role) && (
                        <div key={idx} className="mb-2">
                          <p className="text-sm font-medium">
                            {exp.role} at {exp.company}
                          </p>
                          {exp.duration && <p className="text-sm text-gray-600">{exp.duration}</p>}
                          {exp.description && <p className="text-sm text-gray-600">{exp.description}</p>}
                        </div>
                      )
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex justify-between mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setStep(Math.max(1, step - 1))
                setErrors({})
              }}
              disabled={step === 1}
            >
              Previous
            </Button>
            {step < 4 ? (
              <Button
                type="button"
                onClick={handleNext}
              >
                Next
              </Button>
            ) : (
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(1)}
              >
                Edit Resume
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
