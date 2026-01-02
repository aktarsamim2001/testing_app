import { Plus, Trash2, Facebook, Twitter, Instagram, Linkedin, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface SocialIcon {
  id: number;
  name?: string;
  platform?: string;
  url: string;
  iconUrl?: string;
}

interface SocialIconManagerProps {
  icons: SocialIcon[];
  onAdd: () => void;
  onRemove: (id: number) => void;
  onChange: (id: number, field: 'platform' | 'url' | 'name' | 'iconUrl', value: string) => void;
}

const platformIcons = {
  facebook: Facebook,
  twitter: Twitter,
  instagram: Instagram,
  linkedin: Linkedin,
  website: Globe,
};

export function SocialIconManager({ icons, onAdd, onRemove, onChange }: SocialIconManagerProps) {
  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-foreground">Footer Social Icons</label>
      
      {icons.length > 0 && (
        <div className="space-y-3">
          {icons.map((icon) => {
            return (
              <div key={icon.id} className="flex flex-col md:flex-row items-stretch md:items-center gap-4 md:gap-4 p-4 rounded-lg bg-white shadow-sm border border-gray-200 animate-scale-in w-full">
                {/* Name Field */}
                <div className="flex flex-col gap-2 flex-1 min-w-[120px] w-full md:w-auto">
                  <label className="text-xs text-muted-foreground">Name</label>
                  <Input
                    value={icon.name || ''}
                    onChange={e => onChange(icon.id, 'name', e.target.value)}
                    placeholder="Name"
                    className="rounded-md border-gray-300 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
                <div className="flex flex-col gap-2 flex-1 min-w-[180px] w-full md:w-auto">
                  <label className="text-xs text-muted-foreground">URL</label>
                  <Input
                    value={icon.url}
                    onChange={(e) => onChange(icon.id, 'url', e.target.value)}
                    placeholder="Enter URL"
                    className="rounded-md border-gray-300 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
                {/* Icon Upload and Preview (icon preview to the right of upload button) */}
                <div className="flex flex-col gap-4 flex-1 min-w-[120px] w-full md:w-auto">
                  <label className="text-xs text-muted-foreground">Icon</label>
                  <div className="flex flex-row items-center gap-3">
                    <label className="relative inline-block">
                      <span className="px-3 py-3 bg-orange-500 text-white rounded-md cursor-pointer hover:bg-orange-600 transition text-xs font-medium block text-center">Upload Icon</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={e => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (ev) => {
                              if (ev.target?.result) {
                                onChange(icon.id, 'iconUrl', ev.target.result as string);
                              }
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="absolute left-0 top-0 w-full h-full opacity-0 cursor-pointer"
                      />
                    </label>
                    {/* Icon preview to the right of upload button */}
                    <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center flex-shrink-0 overflow-hidden border-2 border-orange-500">
                      {icon.iconUrl ? (
                        <img src={icon.iconUrl} alt="icon" className="w-10 h-10 object-contain" />
                      ) : (
                        <Globe className="w-8 h-8 text-accent-foreground" />
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex md:block justify-end mt-2 md:mt-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onRemove(icon.id)}
                    className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
      
      <Button
        variant="default"
        onClick={onAdd}
        className="gap-2"
      >
        <Plus className="w-4 h-4" />
        Add
      </Button>
    </div>
  );
}
