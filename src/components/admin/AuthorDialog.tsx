import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { AppDispatch } from '@/store';
import { createAuthorThunk, updateAuthorThunk } from '@/store/slices/authors';
import { uploadAuthorImage } from '@/services/s3-upload';
import toast from 'react-hot-toast';

interface Author {
  id: string;
  name: string;
  image: string;
  about: string | null;
}

interface AuthorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  author?: Author | null;
}

export default function AuthorDialog({ open, onOpenChange, author }: AuthorDialogProps) {
  const dispatch = useDispatch<AppDispatch>();
  const [formData, setFormData] = useState({
    name: '',
    about: ''
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (author) {
      setFormData({
        name: author.name || '',
        about: author.about || ''
      });
      setImagePreview(author.image || '');
      setImageFile(null);
    } else {
      setFormData({
        name: '',
        about: ''
      });
      setImagePreview('');
      setImageFile(null);
    }
  }, [author, open]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (author) {
        // Update author
        const payload: any = {
          id: author.id,
          name: formData.name,
          about: formData.about || null
        };

        // Upload new image if selected
        if (imageFile) {
          try {
            const imageUrl = await uploadAuthorImage(imageFile);
            payload.image = imageUrl;
          } catch (error: any) {
            toast.error(`Image upload failed: ${error.message}`);
            setLoading(false);
            return;
          }
        }

        await dispatch(updateAuthorThunk(payload));
      } else {
        // Create author
        if (!imageFile) {
          throw new Error('Image is required for creating a new author');
        }

        let imageUrl: string;
        try {
          imageUrl = await uploadAuthorImage(imageFile);
        } catch (error: any) {
          toast.error(`Image upload failed: ${error.message}`);
          setLoading(false);
          return;
        }

        await dispatch(createAuthorThunk({
          name: formData.name,
          image: imageUrl,
          about: formData.about || null
        }));
      }
      onOpenChange(false);
    } catch (error) {
      console.error('Error submitting author:', error);
    } finally {
      setLoading(false);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{author ? 'Edit Author' : 'Add New Author'}</DialogTitle>
          <DialogDescription>
            {author ? 'Update author information' : 'Add a new content author'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Author Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              placeholder="Enter author name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="image">Author Image {!author && '*'}</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
              {imagePreview && (
                <div className="mb-4">
                  <img 
                    src={imagePreview} 
                    alt="Preview"
                    className="w-32 h-32 rounded-lg object-cover mx-auto"
                  />
                </div>
              )}
              <input
                id="image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                required={!author}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100"
              />
              <p className="text-sm text-gray-500 mt-2">
                {imageFile ? `Selected: ${imageFile.name}` : 'Click to select an image or drag and drop'}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="about">About</Label>
            <Textarea
              id="about"
              value={formData.about}
              onChange={(e) => setFormData({ ...formData, about: e.target.value })}
              placeholder="Short bio or description about the author"
              rows={4}
            />
          </div>

          <div className="flex gap-2 justify-end pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading || (!author && !imageFile)}
            >
              {loading ? (author ? 'Updating...' : 'Creating...') : (author ? 'Update Author' : 'Create Author')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
