"use client"

import { useEffect } from 'react'
import { isAuthenticatedAdmin } from '@/lib/auth-middleware'

export default function AdminPage() {
  useEffect(() => {
    // Check if admin is already authenticated
    if (isAuthenticatedAdmin()) {
      window.location.href = '/admin/dashboard'
    } else {
      window.location.href = '/admin/login'
    }
  }, [])

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <p className="text-white">Redirecting...</p>
      </div>
    </div>
  )
}
