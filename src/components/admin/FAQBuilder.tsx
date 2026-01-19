import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, GripVertical } from 'lucide-react';

export interface FAQ {
  question: string;
  answer: string;
  order_index: number;
}

interface FAQBuilderProps {
  faqs: FAQ[];
  onChange: (faqs: FAQ[]) => void;
}

export default function FAQBuilder({ faqs, onChange }: FAQBuilderProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const addFAQ = () => {
    onChange([
      ...faqs,
      { question: '', answer: '', order_index: faqs.length }
    ]);
    setEditingIndex(faqs.length);
  };

  const updateFAQ = (index: number, field: 'question' | 'answer', value: string) => {
    const updated = [...faqs];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const removeFAQ = (index: number) => {
    const updated = faqs.filter((_, i) => i !== index);
    onChange(updated.map((faq, i) => ({ ...faq, order_index: i })));
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    const updated = [...faqs];
    [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
    onChange(updated.map((faq, i) => ({ ...faq, order_index: i })));
  };

  const moveDown = (index: number) => {
    if (index === faqs.length - 1) return;
    const updated = [...faqs];
    [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
    onChange(updated.map((faq, i) => ({ ...faq, order_index: i })));
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Label>Frequently Asked Questions</Label>
        <Button type="button" variant="outline" size="sm" onClick={addFAQ}>
          <Plus className="w-4 h-4 mr-2" />
          Add FAQ
        </Button>
      </div>

      {faqs.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No FAQs added yet. Click "Add FAQ" to get started.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <Card key={index}>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <div className="flex flex-col gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => moveUp(index)}
                      disabled={index === 0}
                      className="h-5 w-5 p-0"
                    >
                      ▲
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => moveDown(index)}
                      disabled={index === faqs.length - 1}
                      className="h-5 w-5 p-0"
                    >
                      ▼
                    </Button>
                  </div>
                  <GripVertical className="w-4 h-4 text-muted-foreground" />
                  <CardTitle className="text-sm flex-1">FAQ {index + 1}</CardTitle>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFAQ(index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label htmlFor={`question-${index}`}>Question</Label>
                  <Input
                    id={`question-${index}`}
                    value={faq.question}
                    onChange={(e) => updateFAQ(index, 'question', e.target.value)}
                    placeholder="Enter your question"
                  />
                </div>
                <div>
                  <Label htmlFor={`answer-${index}`}>Answer</Label>
                  <Textarea
                    id={`answer-${index}`}
                    value={faq.answer}
                    onChange={(e) => updateFAQ(index, 'answer', e.target.value)}
                    placeholder="Enter your answer"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
