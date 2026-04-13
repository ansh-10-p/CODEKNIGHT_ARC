export const getCurrentUser = () => {
  if (typeof window === "undefined") return null
  try {
    const isLoggedIn  = localStorage.getItem("isLoggedIn")
    const userRole    = localStorage.getItem("userRole")
    const currentUser = localStorage.getItem("currentUser")
    if (!isLoggedIn || !userRole || !currentUser) return null
    return {
      isLoggedIn: isLoggedIn === "true",
      role: userRole,
      user: JSON.parse(currentUser),
    }
  } catch (error) {
    console.error("Error getting current user:", error)
    return null
  }
}

export const isAuthenticatedTeacher = () => {
  const auth = getCurrentUser()
  return auth && auth.isLoggedIn && auth.role === "teacher"
}

export const redirectIfNotAuthenticated = () => {
  if (!isAuthenticatedTeacher()) {
    window.location.href = "/login"
    return false
  }
  return true
}

export const getCurrentTeacherId = () => {
  const auth = getCurrentUser()
  return auth?.user?.id || null
}

export const getCurrentTeacherInfo = () => {
  const auth = getCurrentUser()
  return auth?.user || null
}

export const isAuthenticatedAdmin = () => {
  const auth = getCurrentUser()
  return auth && auth.isLoggedIn && auth.role === "admin"
}

export const redirectIfNotAuthenticatedAdmin = () => {
  if (!isAuthenticatedAdmin()) {
    window.location.href = "/admin/login"
    return false
  }
  return true
}

export const getCurrentAdminInfo = () => {
  const auth = getCurrentUser()
  return auth?.user || null
}