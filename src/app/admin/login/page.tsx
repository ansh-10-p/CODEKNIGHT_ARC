"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Shield, AlertCircle } from "lucide-react"
import { isAuthenticatedAdmin } from '@/lib/auth-middleware'

export default function AdminLoginPage() {
  const [credentials, setCredentials] = useState({ username: 'ADMIN1', password: 'Admin@123' })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    // Redirect if already authenticated as admin
    if (isAuthenticatedAdmin()) {
      window.location.href = '/admin/dashboard'
    }
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentials)
      })

      const data = await response.json()

      if (response.ok) {
        // Store admin session
        localStorage.setItem('isLoggedIn', 'true')
        localStorage.setItem('userRole', 'admin')
        localStorage.setItem('currentUser', JSON.stringify({
          id: 'admin1',
          username: 'ADMIN1',
          role: 'admin'
        }))

        window.location.href = '/admin/dashboard'
      } else {
        setError(data.error || 'Invalid credentials')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="bg-zinc-900/80 border-zinc-800 backdrop-blur-sm">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-[#e78a53]/10 rounded-full flex items-center justify-center mb-4">
              <Shield className="h-8 w-8 text-[#e78a53]" />
            </div>
            <CardTitle className="text-2xl font-bold text-white">Admin Login</CardTitle>
            <p className="text-zinc-400 mt-2">Access the admin dashboard</p>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert className="mb-6 border-red-500/30 bg-red-500/10">
                <AlertCircle className="h-4 w-4 text-red-400" />
                <AlertDescription className="text-red-400">
                  {error}
                </AlertDescription>
              </Alert>
            )}
            
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="username" className="text-zinc-300">Username</Label>
                <Input
                  id="username"
                  type="text"
                  value={credentials.username}
                  onChange={(e) => setCredentials({...credentials, username: e.target.value})}
                  className="mt-1 bg-zinc-800/50 border-zinc-700 text-white"
                  placeholder="Enter admin username"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="password" className="text-zinc-300">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={credentials.password}
                  onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                  className="mt-1 bg-zinc-800/50 border-zinc-700 text-white"
                  placeholder="Enter admin password"
                  required
                />
              </div>
              
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#e78a53] hover:bg-[#e78a53]/90 text-white"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  'Login as Admin'
                )}
              </Button>
            </form>
            
            <div className="mt-6 text-center">
              <a
                href="/"
                className="text-sm text-zinc-400 hover:text-[#e78a53] transition-colors"
              >
                ← Back to Home
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
