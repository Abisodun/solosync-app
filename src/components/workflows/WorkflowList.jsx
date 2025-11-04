import React from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Zap, Edit2, Trash2, Power, PowerOff } from 'lucide-react';

const triggerLabels = {
  invoice_overdue: 'Invoice Overdue',
  invoice_due_soon: 'Invoice Due Soon',
  invoice_created: 'Invoice Created',
  client_status_change: 'Client Status Change',
  payment_received: 'Payment Received'
};

export default function WorkflowList({ workflows, onEdit, onDelete, onToggle }) {
  if (!workflows || workflows.length === 0) {
    return (
      <Card className="p-8 rounded-[20px] text-center" style={{ background: 'rgba(255, 255, 255, 0.95)' }}>
        <div
          className="w-16 h-16 rounded-[18px] flex items-center justify-center mx-auto mb-4"
          style={{ background: 'linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%)' }}
        >
          <Zap className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-lg font-bold text-gray-800 mb-2">No workflows yet</h3>
        <p className="text-gray-500">Create your first workflow to automate your processes</p>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {workflows.map((workflow) => (
        <Card
          key={workflow.id}
          className="p-6 rounded-[18px] hover:shadow-lg transition-all"
          style={{ background: 'rgba(255, 255, 255, 0.95)', boxShadow: '0 8px 32px rgba(167, 139, 250, 0.15)' }}
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start gap-3 flex-1">
              <div
                className="w-12 h-12 rounded-[12px] flex items-center justify-center flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%)' }}
              >
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-800 mb-1">{workflow.name}</h3>
                <p className="text-sm text-gray-600 mb-2 line-clamp-2">{workflow.description}</p>
                <div className="flex flex-wrap gap-2">
                  <Badge className={`${workflow.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'} text-xs`}>
                    {workflow.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                  <Badge className="bg-purple-100 text-purple-700 text-xs">
                    {triggerLabels[workflow.trigger_type] || workflow.trigger_type}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div className="text-sm text-gray-500">
              {workflow.run_count > 0 ? (
                <span>Ran {workflow.run_count} time{workflow.run_count !== 1 ? 's' : ''}</span>
              ) : (
                <span>Never run</span>
              )}
            </div>
            
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onToggle(workflow)}
                className="rounded-[10px]"
                title={workflow.is_active ? 'Deactivate' : 'Activate'}
              >
                {workflow.is_active ? (
                  <PowerOff className="w-4 h-4" />
                ) : (
                  <Power className="w-4 h-4" />
                )}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onEdit(workflow)}
                className="rounded-[10px]"
              >
                <Edit2 className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  if (window.confirm(`Are you sure you want to delete "${workflow.name}"?`)) {
                    onDelete(workflow.id);
                  }
                }}
                className="rounded-[10px] hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4 text-red-600" />
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}