// app/(dashboard)/admin/page.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardStats } from "@/components/admin/dashboard-stats"
import { QuickActions } from "@/components/admin/quick-actions"
import { RecentMatches } from "@/components/admin/recent-matches"
import { UpcomingMatches } from "@/components/admin/upcoming-matches"

export default function AdminDashboard() {
  return (
    <div className="container p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
      </div>

      <DashboardStats />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4">
          <QuickActions />
        </div>
        <div className="col-span-3">
          <UpcomingMatches />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4">
          <RecentMatches />
        </div>
        <div className="col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Tournament Progress</CardTitle>
              <CardDescription>Current stage and statistics</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Tournament progress content */}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}