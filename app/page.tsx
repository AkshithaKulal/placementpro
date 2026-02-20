import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Toaster } from "@/components/ui/toaster"

export default function HomePage() {
  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              PlacementPro
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Integrated Campus Career Suite
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/auth/signin">
                <Button size="lg">Sign In</Button>
              </Link>
              <Link href="/auth/signup">
                <Button size="lg" variant="outline">Sign Up</Button>
              </Link>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mt-16">
            <Card>
              <CardHeader>
                <CardTitle>For TPO</CardTitle>
                <CardDescription>Manage placement drives efficiently</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>✓ Create and manage drives</li>
                  <li>✓ Smart eligibility filtering</li>
                  <li>✓ Real-time analytics</li>
                  <li>✓ Interview scheduling</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>For Students</CardTitle>
                <CardDescription>Track your placement journey</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>✓ View eligible drives</li>
                  <li>✓ Application tracking</li>
                  <li>✓ Skill gap analysis</li>
                  <li>✓ Resume builder</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>For Alumni</CardTitle>
                <CardDescription>Give back to your campus</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>✓ Post job referrals</li>
                  <li>✓ Mentorship sessions</li>
                  <li>✓ Connect with students</li>
                  <li>✓ Career guidance</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Toaster />
    </>
  )
}
