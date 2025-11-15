import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, X } from 'lucide-react';

export default function TemplateSelector({ onSelect, onClose }) {
  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['email-templates'],
    queryFn: () => base44.entities.EmailTemplate.filter({ is_active: true })
  });

  if (isLoading) {
    return (
      <Card className="p-4 rounded-[12px]">
        <div className="text-center text-gray-500">Loading templates...</div>
      </Card>
    );
  }

  if (templates.length === 0) {
    return (
      <Card className="p-4 rounded-[12px] bg-gray-50">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">No active templates available</p>
          <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded">
            <X className="w-4 h-4" />
          </button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 rounded-[12px] bg-gray-50">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold text-gray-800">Select a Template</h4>
        <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded">
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto">
        {templates.map(template => (
          <button
            key={template.id}
            onClick={() => onSelect(template)}
            className="flex items-start gap-3 p-3 bg-white rounded-[10px] hover:bg-blue-50 transition-colors text-left border border-gray-200"
          >
            <FileText className="w-4 h-4 text-blue-600 mt-1 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="font-medium text-gray-800">{template.name}</div>
              <div className="text-xs text-gray-500 truncate">{template.subject}</div>
            </div>
          </button>
        ))}
      </div>
    </Card>
  );
}