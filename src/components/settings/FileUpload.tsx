import { X, Upload, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FileData {
  name: string;
  size: number;
  url: string;
}

interface FileUploadProps {
  label: string;
  file: FileData | null;
  onUpload: (file: FileData) => void;
  onRemove: () => void;
  accept?: string;
}

export function FileUpload({ label, file, onUpload, onRemove, accept = 'image/*' }: FileUploadProps) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const reader = new FileReader();
      reader.onload = (event) => {
        onUpload({
          name: selectedFile.name,
          size: selectedFile.size,
          url: event.target?.result as string,
        });
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  return (
    <div className="group">
      <label className="block text-sm font-medium text-foreground mb-2">
        {label}
        <span className="text-destructive ml-0.5">*</span>
      </label>
      <div className="relative border-2 border-dashed border-border rounded-lg bg-[#0E3481] hover:border-primary/40 transition-all duration-200 overflow-hidden">
        {file ? (
          <div className="relative p-4">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-lg bg-foreground/90 flex items-center justify-center overflow-hidden shadow-md">
                <img src={file.url} alt={label} className="w-full h-full object-contain p-2" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {(file.size / 1024).toFixed(2)} KB
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onRemove}
                className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ) : (
          <label className="cursor-pointer flex flex-col items-center justify-center py-8 px-4">
            <input
              type="file"
              className="hidden"
              accept={accept}
              onChange={handleFileChange}
            />
            <div className="w-12 h-12 rounded-full bg-gray-500 flex items-center justify-center mb-3">
              <Upload className="w-5 h-5 text-accent-foreground" />
            </div>
            <span className="text-sm font-medium text-white">Click to upload</span>
            <span className="text-xs text-gray-400 mt-1">PNG, JPG or SVG</span>
          </label>
        )}
      </div>
    </div>
  );
}
