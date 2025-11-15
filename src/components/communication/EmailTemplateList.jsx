import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Edit2, Trash2, Copy } from 'lucide-react';
import { motion } from 'framer-motion';

const TEMPLATE_TYPE_LABELS = {
  'invoice_reminder': 'Invoice Reminder',
  'invoice_sent': 'Invoice Sent',
  'invoice_paid': 'Invoice Paid',
  'project_update': 'Project Update',
  'task_completed': 'Task Completed',
  'custom': 'Custom'
};

export default function EmailTemplateList({ templates, onEdit, onDelete, onDuplicate }) {
  if (!templates || templates.length === 0) {
    return (
      <Card className="p-8 rounded-[20px] text-center" style={{ background: 'rgba(255, 255, 255, 0.95)' }}>
        <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500">No email templates yet</p>
        <p className="text-sm text-gray-400 mt-1">Create templates to streamline your communications</p>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {templates.map((template, index) => (
        <motion.div
          key={template.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <Card 
            className="p-5 rounded-[16px] hover:shadow-lg transition-all"
            style={{ background: 'rgba(255, 255, 255, 0.95)', boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)' }}
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-[12px] flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, #93C5FD 0%, #3B82F6 100%)' }}>
                <FileText className="w-6 h-6 text-white" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-gray-800 truncate">{template.name}</h4>
                    {template.description && (
                      <p className="text-sm text-gray-500 mt-1">{template.description}</p>
                    )}
                  </div>
                  {template.is_active ? (
                    <Badge className="bg-green-100 text-green-700 text-xs flex-shrink-0">Active</Badge>
                  ) : (
                    <Badge className="bg-gray-100 text-gray-700 text-xs flex-shrink-0">Inactive</Badge>
                  )}
                </div>

                <div className="mb-3">
                  <Badge className="bg-blue-100 text-blue-700 text-xs">
                    {TEMPLATE_TYPE_LABELS[template.template_type] || template.template_type}
                  </Badge>
                </div>

                <div className="mb-3 p-3 bg-gray-50 rounded-[10px]">
                  <p className="text-xs font-semibold text-gray-600 mb-1">Subject:</p>
                  <p className="text-sm text-gray-800 truncate">{template.subject}</p>
                </div>

                <div className="p-3 bg-gray-50 rounded-[10px] mb-4">
                  <p className="text-xs font-semibold text-gray-600 mb-1">Body Preview:</p>
                  <p className="text-sm text-gray-800 line-clamp-2">{template.body}</p>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onEdit(template)}
                    className="rounded-[10px] flex-1"
                  >
                    <Edit2 className="w-3 h-3 mr-1" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onDuplicate(template)}
                    className="rounded-[10px] flex-1"
                  >
                    <Copy className="w-3 h-3 mr-1" />
                    Duplicate
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      if (window.confirm(`Delete template "${template.name}"?`)) {
                        onDelete(template.id);
                      }
                    }}
                    className="rounded-[10px] hover:bg-red-50 hover:border-red-200"
                  >
                    <Trash2 className="w-3 h-3 text-red-600" />
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}