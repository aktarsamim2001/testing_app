import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Author {
  id: string;
  name: string;
  avatar_url: string;
  status: 'active' | 'inactive';
}

interface AuthorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAuthorSelect?: (authorId: string) => void;
  author?: Author | null;
  mode?: 'create-edit' | 'select';
}

export default function AuthorDialog({ open, onOpenChange, onAuthorSelect, author, mode = 'create-edit' }: AuthorDialogProps) {
  const [authors, setAuthors] = useState<Author[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedAuthor, setSelectedAuthor] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    status: 'active' as 'active' | 'inactive'
  });

  const isEditMode = !!author;
  const isCreateEditMode = mode === 'create-edit';

  useEffect(() => {
    if (open) {
      if (isCreateEditMode) {
        // Create/Edit mode
        if (isEditMode && author) {
          // Edit mode - populate form with author data
          setFormData({
            name: author.name || '',
            status: author.status || 'active'
          });
        } else {
          // Create mode - empty form
          setFormData({
            name: '',
            status: 'active'
          });
        }
        setShowForm(true);
      } else {
        // Selection mode - fetch authors list
        setShowForm(false);
        fetchAuthors();
      }
    }
  }, [open, author, isEditMode, isCreateEditMode]);

  const fetchAuthors = async () => {
    const { data, error } = await supabase
      .from('authors' as any)
      .select('*')
      .order('name');

    if (!error && data) setAuthors(data as unknown as Author[]);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = {
        name: formData.name,
        status: formData.status
      };

      if (isEditMode && author) {
        // Update existing author
        const { error } = await supabase
          .from('authors' as any)
          .update(data)
          .eq('id', author.id);

        if (error) throw error;

        toast({
          title: 'Success',
          description: 'Author updated successfully'
        });
      } else {
        // Create new author
        const { data: newAuthor, error } = await supabase
          .from('authors' as any)
          .insert([data])
          .select()
          .single();

        if (error) throw error;

        toast({
          title: 'Success',
          description: 'Author created successfully'
        });

        if (onAuthorSelect && newAuthor) {
          onAuthorSelect((newAuthor as any).id);
        }
      }

      setFormData({ name: '', status: 'active' });
      setShowForm(false);
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = () => {
    if (selectedAuthor && onAuthorSelect) {
      onAuthorSelect(selectedAuthor);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isCreateEditMode ? (isEditMode ? 'Edit Author' : 'Add New Author') : 'Select or Create Author'}
          </DialogTitle>
          {isCreateEditMode && isEditMode && <DialogDescription>Update author information</DialogDescription>}
          {isCreateEditMode && !isEditMode && <DialogDescription>Add a new content author</DialogDescription>}
        </DialogHeader>

        {isCreateEditMode ? (
          // Create/Edit mode form
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value as 'active' | 'inactive' })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 pt-4">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? (isEditMode ? 'Saving...' : 'Creating...') : (isEditMode ? 'Save Changes' : 'Create')}
              </Button>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
                Cancel
              </Button>
            </div>
          </form>
        ) : !showForm ? (
          // Selection mode
          <div className="space-y-4">
            <div>
              <Label>Existing Authors</Label>
              <Select value={selectedAuthor} onValueChange={setSelectedAuthor}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an author" />
                </SelectTrigger>
                <SelectContent>
                  {authors.map((author) => (
                    <SelectItem key={author.id} value={author.id}>
                      {author.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSelect} disabled={!selectedAuthor} className="flex-1">
                Select Author
              </Button>
              <Button variant="outline" onClick={() => setShowForm(true)} className="flex-1">
                Create New
              </Button>
            </div>
          </div>
        ) : (
          // Create new author form in selection mode
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value as 'active' | 'inactive' })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? 'Creating...' : 'Create Author'}
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="flex-1">
                Cancel
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
