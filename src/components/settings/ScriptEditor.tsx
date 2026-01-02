import { Textarea } from '@/components/ui/textarea';
import { FormField } from './FormField';

interface ScriptEditorProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  readOnly?: boolean;
}

export function ScriptEditor({ label, value, onChange, placeholder, readOnly = false }: ScriptEditorProps) {
  return (
    <FormField label={label}>
      <div className="relative">
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          readOnly={readOnly}
          className="font-mono text-[13px] bg-background border border-gray-300 text-gray-800 min-h-[100px] resize-none focus-visible:ring-1 focus-visible:ring-orange-500"
        />
      </div>
    </FormField>
  );
}
