"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import AdminLayout from '@/components/admin/AdminLayout';
import AdminPageLoader from '@/components/admin/AdminPageLoader';

interface UserWithRole {
  id: string;
  email: string;
  full_name: string | null;
  created_at: string;
  user_roles: { role: string }[];
}

export default function Settings() {
  const router = useRouter();
  const { user } = useAuth();
  const { isAdmin, loading } = useUserRole();
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const { toast } = useToast();
  const { user: currentUser } = useAuth();

  useEffect(() => {
    if (user && isAdmin) {
      fetchUsers();
    }
  }, [user, isAdmin]);

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.push('/auth');
    }
  }, [user, isAdmin, loading, router]);

  const fetchUsers = async () => {
    const { data: profilesData, error } = await supabase
      .from('profiles')
      .select('id, email, full_name, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      setDataLoading(false);
      return;
    }

    const userIds = profilesData?.map(p => p.id) || [];
    const { data: rolesData } = await supabase
      .from('user_roles')
      .select('user_id, role')
      .in('user_id', userIds);

    const usersWithRoles = profilesData?.map(profile => ({
      ...profile,
      user_roles: rolesData?.filter(r => r.user_id === profile.id).map(r => ({ role: r.role })) || []
    })) || [];

    setUsers(usersWithRoles);
    setDataLoading(false);
  };

  const handleDeleteUser = async (userId: string) => {
    if (userId === currentUser?.id) {
      toast({ title: 'Error', description: 'Cannot delete your own account', variant: 'destructive' });
      return;
    }

    if (!confirm('Are you sure you want to delete this user?')) return;

    const { error } = await supabase.from('user_roles').delete().eq('user_id', userId);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'User removed successfully' });
      fetchUsers();
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <AdminPageLoader />
      </AdminLayout>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <AdminLayout>
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Settings</h1>
          <p className="text-muted-foreground">Manage platform settings and users</p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>View and manage platform users</CardDescription>
            </CardHeader>
            <CardContent>
              {dataLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : users.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No users found</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Full Name</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.email}</TableCell>
                        <TableCell>{user.full_name || 'N/A'}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {user.user_roles.map((ur, idx) => (
                              <Badge key={idx} variant={ur.role === 'admin' ? 'default' : 'secondary'}>
                                {ur.role}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteUser(user.id)}
                            disabled={user.id === currentUser?.id}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Platform Information</CardTitle>
              <CardDescription>Current system status</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">Platform Version</span>
                <span className="font-medium">1.0.0</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">Total Users</span>
                <span className="font-medium">{users.length}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-muted-foreground">Backend Status</span>
                <Badge variant="default">Active</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
