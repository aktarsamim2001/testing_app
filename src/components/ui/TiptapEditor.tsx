"use client";

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import BulletList from '@tiptap/extension-bullet-list';
import OrderedList from '@tiptap/extension-ordered-list';
import ListItem from '@tiptap/extension-list-item';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Link2,
  Code,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  Quote,
  Image as ImageIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Undo,
  Redo,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useState, useRef } from 'react';
import { uploadToS3 } from '@/services/s3-upload';
import toast from 'react-hot-toast';

interface TiptapEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export default function TiptapEditor({ value, onChange }: TiptapEditorProps) {
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      BulletList,
      OrderedList,
      ListItem,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-500 underline',
        },
      }),
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Image,
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[300px] p-4',
      },
    },
  });

  if (!editor) {
    return null;
  }

  const handleAddLink = () => {
    if (linkUrl) {
      editor.chain().focus().setLink({ href: linkUrl }).run();
      setLinkUrl('');
      setShowLinkDialog(false);
    }
  };

  const handleRemoveLink = () => {
    editor.chain().focus().unsetLink().run();
    setShowLinkDialog(false);
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
    }
  };

  const handleImageUpload = async () => {
    if (imageFile) {
      setIsUploadingImage(true);
      try {
        const s3Url = await uploadToS3(imageFile, 'development/blog/content');
        editor.chain().focus().setImage({ src: s3Url }).run();
        toast.success('Image uploaded successfully');
        setImageFile(null);
        setShowImageDialog(false);
      } catch (error) {
        toast.error('Failed to upload image');
        console.error('Image upload error:', error);
      } finally {
        setIsUploadingImage(false);
      }
    } else if (imageUrl) {
      editor.chain().focus().setImage({ src: imageUrl }).run();
      setImageUrl('');
      setShowImageDialog(false);
    }
  };

  return (
    <>
      <div className="border rounded-md">
        <div className="border-b bg-muted/50 p-2 flex flex-wrap gap-1">
          {/* Text Formatting */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={editor.isActive('bold') ? 'bg-muted' : ''}
            title="Bold"
          >
            <Bold className="h-4 w-4" />
          </Button>
          
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={editor.isActive('italic') ? 'bg-muted' : ''}
            title="Italic"
          >
            <Italic className="h-4 w-4" />
          </Button>
          
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={editor.isActive('underline') ? 'bg-muted' : ''}
            title="Underline"
          >
            <UnderlineIcon className="h-4 w-4" />
          </Button>
          
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={editor.isActive('strike') ? 'bg-muted' : ''}
            title="Strikethrough"
          >
            <Strikethrough className="h-4 w-4" />
          </Button>

          <div className="w-px h-6 bg-border mx-1" />

          {/* Headings */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={editor.isActive('heading', { level: 1 }) ? 'bg-muted' : ''}
            title="Heading 1"
          >
            <Heading1 className="h-4 w-4" />
          </Button>
          
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={editor.isActive('heading', { level: 2 }) ? 'bg-muted' : ''}
            title="Heading 2"
          >
            <Heading2 className="h-4 w-4" />
          </Button>

          <div className="w-px h-6 bg-border mx-1" />

          {/* Lists */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={editor.isActive('bulletList') ? 'bg-muted' : ''}
            title="Bullet List"
          >
            <List className="h-4 w-4" />
          </Button>
          
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={editor.isActive('orderedList') ? 'bg-muted' : ''}
            title="Numbered List"
          >
            <ListOrdered className="h-4 w-4" />
          </Button>

          <div className="w-px h-6 bg-border mx-1" />

          {/* Quote and Code */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={editor.isActive('blockquote') ? 'bg-muted' : ''}
            title="Quote"
          >
            <Quote className="h-4 w-4" />
          </Button>
          
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            className={editor.isActive('codeBlock') ? 'bg-muted' : ''}
            title="Code Block"
          >
            <Code className="h-4 w-4" />
          </Button>

          <div className="w-px h-6 bg-border mx-1" />

          {/* Text Alignment */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            className={editor.isActive({ textAlign: 'left' }) ? 'bg-muted' : ''}
            title="Align Left"
          >
            <AlignLeft className="h-4 w-4" />
          </Button>
          
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            className={editor.isActive({ textAlign: 'center' }) ? 'bg-muted' : ''}
            title="Align Center"
          >
            <AlignCenter className="h-4 w-4" />
          </Button>
          
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            className={editor.isActive({ textAlign: 'right' }) ? 'bg-muted' : ''}
            title="Align Right"
          >
            <AlignRight className="h-4 w-4" />
          </Button>

          <div className="w-px h-6 bg-border mx-1" />

          {/* Link and Image */}
          {/* <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowLinkDialog(true)}
            className={editor.isActive('link') ? 'bg-muted' : ''}
            title="Add Link"
          >
            <Link2 className="h-4 w-4" />
          </Button> */}
          
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowImageDialog(true)}
            title="Add Image"
          >
            <ImageIcon className="h-4 w-4" />
          </Button>

          <div className="w-px h-6 bg-border mx-1" />

          {/* Undo/Redo */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            title="Undo"
          >
            <Undo className="h-4 w-4" />
          </Button>
          
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            title="Redo"
          >
            <Redo className="h-4 w-4" />
          </Button>
        </div>
        <EditorContent editor={editor} />
      </div>

      {/* Link Dialog */}
      <Dialog open={showLinkDialog} onOpenChange={setShowLinkDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Link</DialogTitle>
            <DialogDescription>
              Enter the URL you want to link to
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="link-url">URL</Label>
              <Input
                id="link-url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://example.com"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddLink();
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            {editor.isActive('link') && (
              <Button type="button" variant="destructive" onClick={handleRemoveLink}>
                Remove Link
              </Button>
            )}
            <Button type="button" variant="outline" onClick={() => setShowLinkDialog(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={handleAddLink}>
              Add Link
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Image Dialog */}
      <Dialog open={showImageDialog} onOpenChange={setShowImageDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Image</DialogTitle>
            <DialogDescription>
              Upload an image or enter an image URL
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="image-file">Upload Image</Label>
              <Input
                id="image-file"
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageFileChange}
              />
              {imageFile && (
                <p className="text-sm text-muted-foreground mt-2">
                  Selected: {imageFile.name}
                </p>
              )}
            </div>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or</span>
              </div>
            </div>
            <div>
              <Label htmlFor="image-url">Image URL</Label>
              <Input
                id="image-url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                disabled={!!imageFile}
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => {
                setShowImageDialog(false);
                setImageFile(null);
                setImageUrl('');
              }}
            >
              Cancel
            </Button>
            <Button 
              type="button" 
              onClick={handleImageUpload}
              disabled={isUploadingImage || (!imageFile && !imageUrl)}
            >
              {isUploadingImage ? 'Uploading...' : 'Add Image'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}