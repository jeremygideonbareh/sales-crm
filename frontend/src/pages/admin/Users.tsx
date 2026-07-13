import { useEffect, useState } from 'react'
import { Plus, Users as UsersIcon, UserCheck, UserX } from 'lucide-react'
import api from '@/api/client'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { PageHeader } from '@/components/layout/PageHeader'
import { Skeleton } from '@/components/ui/skeleton'
import { CreateUserDialog } from '@/components/users/CreateUserDialog'
import { toast } from '@/components/ui/toast'
import { useIsMobile } from '@/hooks/useMediaQuery'
import type { UserResponse } from '@/types'

export default function UsersPage() {
  const [users, setUsers] = useState<UserResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const isMobile = useIsMobile()

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/admin/users')
      setUsers(data)
    } catch {
      toast({ title: 'Failed to load users', variant: 'error' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchUsers() }, [])

  const toggleActive = async (userId: number, isActive: boolean) => {
    try {
      await api.put(`/admin/users/${userId}`, { is_active: !isActive })
      toast({ title: `User ${isActive ? 'deactivated' : 'activated'}`, variant: 'success' })
      fetchUsers()
    } catch {
      toast({ title: 'Failed to update user', variant: 'error' })
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Users" description="Manage agency team members">
        <Button onClick={() => setShowCreate(true)} size="sm">
          <Plus className="h-4 w-4" />
          Add User
        </Button>
      </PageHeader>

      <CreateUserDialog
        open={showCreate}
        onOpenChange={setShowCreate}
        onCreated={fetchUsers}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UsersIcon className="h-5 w-5 text-emerald-400" />
            Team Members ({users.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Loading */}
          {loading && (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <CardContent className="space-y-2 p-4">
                    {Array.from({ length: 3 }).map((_, j) => (
                      <Skeleton key={j} className="h-4 w-full" />
                    ))}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Empty */}
          {!loading && users.length === 0 && (
            <div className="py-12 text-center text-muted-foreground">
              No users found
            </div>
          )}

          {/* Mobile: Card View */}
          {!loading && users.length > 0 && isMobile && (
            <div className="space-y-3 md:hidden">
              {users.map((u) => (
                <Card key={u.id} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{u.full_name}</p>
                        <p className="text-xs text-muted-foreground truncate mt-0.5">{u.email}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="secondary" className="text-xs capitalize">{u.role}</Badge>
                          <Badge variant={u.is_active ? 'default' : 'secondary'} className={`text-xs ${u.is_active ? 'bg-emerald-900/20 text-emerald-400' : ''}`}>
                            {u.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => toggleActive(u.id, u.is_active)} className="ml-2 shrink-0">
                        {u.is_active ? <UserX className="h-4 w-4 text-red-400" /> : <UserCheck className="h-4 w-4 text-emerald-400" />}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Desktop: Table View */}
          {!loading && users.length > 0 && !isMobile && (
            <div className="hidden overflow-x-auto md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-24">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell className="font-medium">{u.full_name}</TableCell>
                      <TableCell>{u.email}</TableCell>
                      <TableCell className="capitalize">{u.role}</TableCell>
                      <TableCell>
                        <Badge variant={u.is_active ? 'default' : 'secondary'} className={u.is_active ? 'bg-emerald-900/20 text-emerald-400' : ''}>
                          {u.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" onClick={() => toggleActive(u.id, u.is_active)}>
                          {u.is_active ? <UserX className="h-4 w-4 text-red-400" /> : <UserCheck className="h-4 w-4 text-emerald-400" />}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
