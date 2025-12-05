import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Author {
  id: string;
  name: string;
  bio: string;
  email: string;
  avatar_url: string;
  social_links: any;
}

interface AuthorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAuthorSelect: (authorId: string) => void;
}

export default function AuthorDialog({ open, onOpenChange, onAuthorSelect }: AuthorDialogProps) {
  const [authors, setAuthors] = useState<Author[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedAuthor, setSelectedAuthor] = useState('');
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    email: '',
    twitter: '',
    linkedin: ''
  });

  useEffect(() => {
    if (open) fetchAuthors();
  }, [open]);

  const fetchAuthors = async () => {
    const { data, error } = await supabase
      .from('authors' as any)
      .select('*')
      .order('name');

    if (!error && data) setAuthors(data as unknown as Author[]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { data, error } = await supabase
        .from('authors' as any)
        .insert([{
          name: formData.name,
          bio: formData.bio || null,
          email: formData.email || null,
          social_links: {
            twitter: formData.twitter || null,
            linkedin: formData.linkedin || null
          }
        }])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Author created successfully'
      });

      setFormData({ name: '', bio: '', email: '', twitter: '', linkedin: '' });
      setShowForm(false);
      fetchAuthors();
      
      if (data) {
        onAuthorSelect((data as any).id);
        onOpenChange(false);
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const handleSelect = () => {
    if (selectedAuthor) {
      onAuthorSelect(selectedAuthor);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Select or Create Author</DialogTitle>
        </DialogHeader>

        {!showForm ? (
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
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="twitter">Twitter Handle</Label>
              <Input
                id="twitter"
                value={formData.twitter}
                onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
                placeholder="@username"
              />
            </div>
            <div>
              <Label htmlFor="linkedin">LinkedIn URL</Label>
              <Input
                id="linkedin"
                value={formData.linkedin}
                onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                placeholder="https://linkedin.com/in/..."
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" className="flex-1">Create Author</Button>
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
