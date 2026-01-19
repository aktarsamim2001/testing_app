import { Bold, Italic, Underline } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { FormField } from './FormField';

interface RichTextEditorProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  required?: boolean;
}

export function RichTextEditor({ label, value, onChange, rows = 4, required }: RichTextEditorProps) {
  return (
    <FormField label={label} required={required}>
      <div className="border border-input rounded-lg overflow-hidden bg-background">
        <div className="flex items-center gap-1 px-3 py-2 bg-secondary/50 border-b border-input">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
          >
            <Bold className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
          >
            <Italic className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
          >
            <Underline className="w-3.5 h-3.5" />
          </Button>
        </div>
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={rows}
          className="border-0 rounded-none focus-visible:ring-0 resize-none"
        />
      </div>
    </FormField>
  );
}
