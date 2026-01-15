import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { AppDispatch, RootState } from '@/store';
import { createAuthorThunk, updateAuthorThunk, fetchAuthorDetailsThunk, selectSelectedAuthor, selectSelectedAuthorLoading, fetchAuthors } from '@/store/slices/authors';
// import { uploadAuthorImage } from '@/services/s3-upload';
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
  const selectedAuthor = useSelector((state: RootState) => selectSelectedAuthor(state));
  const selectedAuthorLoading = useSelector((state: RootState) => selectSelectedAuthorLoading(state));
  const [formData, setFormData] = useState({
    name: '',
    about: ''
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string;
    image?: string;
    about?: string;
  }>({});

  useEffect(() => {
    setErrors({});
    
    // If dialog is open and in edit mode (author has id), fetch full details
    if (open && author?.id) {
      dispatch(fetchAuthorDetailsThunk(author.id));
    } else if (open) {
      // Create mode - reset form
      setFormData({
        name: '',
        about: ''
      });
      setImagePreview('');
      setImageFile(null);
    }
  }, [author?.id, open, dispatch]);

  // Populate form from selectedAuthor when details are fetched
  useEffect(() => {
    if (selectedAuthor && author?.id) {
      setFormData({
        name: selectedAuthor.name || '',
        about: selectedAuthor.about || ''
      });
      setImagePreview(selectedAuthor.image || '');
      setImageFile(null);
    }
  }, [selectedAuthor, author?.id]);

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

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Author name is required.';
    }
    if (!author && !imageFile) {
      newErrors.image = 'Image is required for creating a new author.';
    }
    // About: allow empty, but if not empty, must not be only spaces
    if (formData.about && !formData.about.trim()) {
      newErrors.about = 'About cannot be only spaces.';
    }
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      setLoading(false);
      return;
    }
    setLoading(true);

    try {
      let result;
      if (author?.id) {
        // Update author
        const payload: any = {
          id: author.id,
          name: formData.name,
          about: formData.about || null
        };

        // Upload new image if selected
        if (imageFile) {
          try {
            // Send file path instead of base64
            payload.image = `development/author/profile/${imageFile.name}`;
          } catch (error: any) {
            toast.error(`Image upload failed: ${error.message}`);
            setLoading(false);
            return;
          }
        }

        result = await dispatch(updateAuthorThunk(payload));
        
        // Refresh the author list after update and close dialog
        dispatch(fetchAuthors(1, 10, ''));
        toast.success('Author updated successfully!');
        onOpenChange(false);
      } else {
        // Create author
        let imageUrl: string = '';
        try {
          // Send file path instead of base64
          imageUrl = `development/author/profile/${imageFile!.name}`;
        } catch (error: any) {
          toast.error(`Image upload failed: ${error.message}`);
          setLoading(false);
          return;
        }

        result = await dispatch(createAuthorThunk({
          name: formData.name,
          image: imageUrl,
          about: formData.about || null
        }));
        
        // Refresh the author list after create and close dialog
        dispatch(fetchAuthors(1, 10, ''));
        toast.success('Author created successfully!');
        onOpenChange(false);
      }
    } catch (error) {
      console.error('Error submitting author:', error);
      toast.error('An error occurred while submitting the form.');
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
            {author ? (selectedAuthorLoading ? 'Loading author details...' : 'Update author information') : 'Add a new content author'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Author Name <span className="text-red-500">*</span></Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => {
                setFormData({ ...formData, name: e.target.value });
                if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
              }}
              aria-invalid={!!errors.name}
              // required removed for custom validation only
              placeholder="Enter author name"
            />
            {errors.name && (
              <div className="text-red-500 text-xs mt-1">{errors.name}</div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="image">Author Image {!author && <span className="text-red-500">*</span>}</Label>
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
                onChange={e => {
                  handleImageChange(e);
                  if (errors.image) setErrors((prev) => ({ ...prev, image: undefined }));
                }}
                aria-invalid={!!errors.image}
                // required removed for custom validation only
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100"
              />
              {errors.image && (
                <div className="text-red-500 text-xs mt-1">{errors.image}</div>
              )}
              <p className="text-sm text-gray-500 mt-2">
                {imageFile ? `Selected: ${imageFile.name}` : ''}
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
            >
              {loading ? (author ? 'Updating...' : 'Creating...') : (author ? 'Update Author' : 'Create Author')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
