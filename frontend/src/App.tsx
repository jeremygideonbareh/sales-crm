import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider, useAuth } from "@/context/AuthContext"
import { AppShell } from "@/components/layout/AppShell"
import { ToastContainer } from "@/components/ui/toast"
import { ErrorBoundary } from "@/components/ui/error-boundary"
import Login from "@/pages/Login"
import Settings from "@/pages/Settings"
import AdminUsers from "@/pages/admin/Users"
import ManagerDashboard from "@/pages/manager/Dashboard"
import ManagerLeads from "@/pages/manager/Leads"
import RepCallingView from "@/pages/rep/CallingView"
import RepDashboard from "@/pages/rep/Dashboard"
import RepDemoRequests from "@/pages/rep/DemoRequests"
import RepHandovers from "@/pages/rep/Handovers"
import ManagerLeaderboard from "@/pages/manager/Leaderboard"
import EmailSequences from "@/pages/manager/EmailSequences"

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading)
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}

function AppLayout() {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />

  return (
    <AppShell>
      <Routes>
        <Route path="/manager/dashboard" element={<ErrorBoundary><ManagerDashboard /></ErrorBoundary>} />
        <Route path="/manager/leads" element={<ErrorBoundary><ManagerLeads /></ErrorBoundary>} />
        <Route path="/manager/leaderboard" element={<ErrorBoundary><ManagerLeaderboard /></ErrorBoundary>} />
        <Route path="/manager/sequences" element={<ErrorBoundary><EmailSequences /></ErrorBoundary>} />
        <Route path="/rep/dashboard" element={<ErrorBoundary><RepDashboard /></ErrorBoundary>} />
        <Route path="/rep/calling" element={<ErrorBoundary><RepCallingView /></ErrorBoundary>} />
        <Route path="/rep/demos" element={<ErrorBoundary><RepDemoRequests /></ErrorBoundary>} />
        <Route path="/rep/handovers" element={<ErrorBoundary><RepHandovers /></ErrorBoundary>} />
        <Route path="/settings" element={<ErrorBoundary><Settings /></ErrorBoundary>} />
        <Route path="/admin/users" element={<ErrorBoundary><AdminUsers /></ErrorBoundary>} />
        <Route
          path="*"
          element={
            <Navigate
              to={
                user.role === "manager"
                  ? "/manager/dashboard"
                  : "/rep/dashboard"
              }
              replace
            />
          }
        />
      </Routes>
    </AppShell>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<ErrorBoundary><Login /></ErrorBoundary>} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          />
        </Routes>
        <ToastContainer />
      </AuthProvider>
    </BrowserRouter>
  )
}
