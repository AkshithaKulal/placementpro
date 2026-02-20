"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus, Edit } from "lucide-react"
import { formatDate } from "@/lib/utils"

interface Referral {
  id: string
  company: string
  position: string
  description: string
  requirements: string[]
  link?: string
  isActive: boolean
  createdAt: string
}

export default function ReferralsPage() {
  const [referrals, setReferrals] = useState<Referral[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchReferrals()
  }, [])

  const fetchReferrals = async () => {
    try {
      const response = await fetch("/api/alumni/referrals")
      const data = await response.json()
      if (response.ok) {
        setReferrals(data)
      }
    } catch (error) {
      console.error("Failed to fetch referrals:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Job Referrals</h1>
          <p className="text-gray-600">Manage your job referrals</p>
        </div>
        <Link href="/dashboard/alumni/referrals/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Post Referral
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : referrals.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-gray-600 mb-4">No referrals posted yet</p>
            <Link href="/dashboard/alumni/referrals/new">
              <Button>Post Your First Referral</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {referrals.map((referral) => (
            <Card key={referral.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{referral.position}</CardTitle>
                    <CardDescription>{referral.company}</CardDescription>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      referral.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {referral.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700 mb-4">{referral.description}</p>
                {referral.requirements.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold mb-2">Requirements:</h4>
                    <ul className="list-disc list-inside text-sm text-gray-600">
                      {referral.requirements.map((req, idx) => (
                        <li key={idx}>{req}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {referral.link && (
                  <a
                    href={referral.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline"
                  >
                    View Job Posting →
                  </a>
                )}
                <div className="mt-4 flex gap-2">
                  <Link href={`/dashboard/alumni/referrals/${referral.id}/edit`}>
                    <Button variant="outline" size="sm">
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                  </Link>
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  Posted: {formatDate(referral.createdAt)}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
