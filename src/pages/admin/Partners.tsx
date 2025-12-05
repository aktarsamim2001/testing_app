"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import AdminLayout from '@/components/admin/AdminLayout';
import PartnerDialog from '@/components/admin/PartnerDialog';

interface Partner {
  id: string;
  name: string;
  email: string;
  channel_type: string;
  platform_handle: string | null;
  follower_count: number | null;
  engagement_rate: number | null;
  category: string[] | null;
  created_at: string;
}

export default function Partners() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);
  const { toast } = useToast();

  const fetchPartners = async () => {
    const { data, error } = await supabase
      .from('partners')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      setPartners(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPartners();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this partner?')) return;

    const { error } = await supabase.from('partners').delete().eq('id', id);
    
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Partner deleted successfully' });
      fetchPartners();
    }
  };

  const handleEdit = (partner: Partner) => {
    setEditingPartner(partner);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setEditingPartner(null);
    fetchPartners();
  };

  const getChannelColor = (channel: string) => {
    switch (channel) {
      case 'blogger': return 'bg-purple-500';
      case 'linkedin': return 'bg-blue-500';
      case 'youtube': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const formatNumber = (num: number | null) => {
    if (!num) return 'N/A';
    return num.toLocaleString();
  };

  return (
    <AdminLayout>
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Partners & Influencers</h1>
            <p className="text-muted-foreground">Manage your influencer network</p>
          </div>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Partner
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Partners</CardTitle>
            <CardDescription>View and manage influencer partnerships</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : partners.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No partners yet. Click "Add Partner" to get started.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Channel</TableHead>
                    <TableHead>Handle</TableHead>
                    <TableHead>Followers</TableHead>
                    <TableHead>Engagement</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {partners.map((partner) => (
                    <TableRow key={partner.id}>
                      <TableCell className="font-medium">{partner.name}</TableCell>
                      <TableCell>
                        <Badge className={getChannelColor(partner.channel_type)}>
                          {partner.channel_type}
                        </Badge>
                      </TableCell>
                      <TableCell>{partner.platform_handle || 'N/A'}</TableCell>
                      <TableCell>{formatNumber(partner.follower_count)}</TableCell>
                      <TableCell>{partner.engagement_rate ? `${partner.engagement_rate}%` : 'N/A'}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(partner)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(partner.id)}>
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

        <PartnerDialog
          open={dialogOpen}
          onOpenChange={handleDialogClose}
          partner={editingPartner}
        />
      </div>
    </AdminLayout>
  );
}
