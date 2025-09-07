"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useStaffMembers, useActiveShifts } from "@/lib/api/queries"
import { Users, Clock, DollarSign } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

export function StaffManagement() {
  const { data: staff = [], isLoading } = useStaffMembers()
  const { data: activeShifts = [] } = useActiveShifts()

  const getRoleBadge = (role: string) => {
    const variants = {
      admin: "destructive",
      manager: "default",
      barista: "secondary",
      kitchen: "outline",
    } as const

    return <Badge variant={variants[role as keyof typeof variants] || "outline"}>{role}</Badge>
  }

  if (isLoading) {
    return <div className="text-center py-8">Loading staff data...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="font-heading text-2xl font-bold">Staff Management</h2>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Users className="h-8 w-8 text-blue-500" />
            <div>
              <p className="text-sm text-muted-foreground">Total Staff</p>
              <p className="text-2xl font-bold">{staff.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Clock className="h-8 w-8 text-green-500" />
            <div>
              <p className="text-sm text-muted-foreground">Active Shifts</p>
              <p className="text-2xl font-bold">{activeShifts.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <DollarSign className="h-8 w-8 text-purple-500" />
            <div>
              <p className="text-sm text-muted-foreground">Avg Hourly Rate</p>
              <p className="text-2xl font-bold">
                ${(staff.reduce((sum, s) => sum + s.hourlyRate, 0) / staff.length).toFixed(2)}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Staff List */}
      <Card className="p-6">
        <h3 className="font-semibold text-lg mb-4">Staff Members</h3>
        <div className="space-y-4">
          {staff.map((member) => {
            const activeShift = activeShifts.find((shift) => shift.staffId === member.id)

            return (
              <div key={member.id} className="flex justify-between items-center p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center text-white font-semibold">
                    {member.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <div>
                    <h4 className="font-medium">{member.name}</h4>
                    <p className="text-sm text-muted-foreground">{member.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-medium">${member.hourlyRate}/hr</p>
                    <p className="text-xs text-muted-foreground">
                      Joined {formatDistanceToNow(new Date(member.createdAt), { addSuffix: true })}
                    </p>
                  </div>

                  <div className="flex flex-col gap-2">
                    {getRoleBadge(member.role)}
                    {activeShift ? (
                      <Badge className="bg-green-500 text-white text-xs">
                        Active ({Math.floor((Date.now() - new Date(activeShift.clockIn).getTime()) / (1000 * 60 * 60))}
                        h)
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs">
                        Off duty
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </Card>
    </div>
  )
}
