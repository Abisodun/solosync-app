
import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, Zap, Play, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { differenceInDays, parseISO, isBefore } from 'date-fns';
import WorkflowTemplates from '../components/workflows/WorkflowTemplates';
import WorkflowForm from '../components/workflows/WorkflowForm';
import WorkflowList from '../components/workflows/WorkflowList';
import Sidebar from '../components/common/Sidebar';

// Workflow Engine Logic
const replacePlaceholders = (template, data) => {
  if (!template) return '';
  
  return template
    .replace(/\{invoice_number\}/g, data.invoice_number || '')
    .replace(/\{client_name\}/g, data.client_name || '')
    .replace(/\{amount\}/g, data.amount ? `${data.amount.toFixed(2)}` : '')
    .replace(/\{due_date\}/g, data.due_date || '')
    .replace(/\{client\}/g, data.name || '');
};

const executeActions = async (workflow, entity, entityType) => {
  const actionsPerformed = [];
  
  for (const action of workflow.actions) {
    try {
      if (action.type === 'send_email') {
        const subject = replacePlaceholders(action.config.subject, entity);
        const body = replacePlaceholders(action.config.body, entity);
        
        if (entity.client_email) {
          await base44.integrations.Core.SendEmail({
            to: entity.client_email,
            subject: subject,
            body: body
          });
          
          actionsPerformed.push({
            type: 'send_email',
            success: true,
            to: entity.client_email,
            subject: subject
          });
        }
      } else if (action.type === 'update_status') {
        if (entityType === 'invoice') {
          await base44.entities.Invoice.update(entity.id, {
            status: action.config.status
          });
          
          actionsPerformed.push({
            type: 'update_status',
            success: true,
            new_status: action.config.status
          });
        }
      } else if (action.type === 'create_notification') {
        const message = replacePlaceholders(action.config.message, entity);
        
        console.log('Notification:', message);
        
        actionsPerformed.push({
          type: 'create_notification',
          success: true,
          message: message
        });
      }
    } catch (error) {
      console.error(`Error executing action ${action.type}:`, error);
      actionsPerformed.push({
        type: action.type,
        success: false,
        error: error.message
      });
    }
  }
  
  return actionsPerformed;
};

const logExecution = async (workflow, entity, entityType, actionsPerformed, status, error = null) => {
  try {
    await base44.entities.WorkflowExecution.create({
      workflow_id: workflow.id,
      workflow_name: workflow.name,
      trigger_type: workflow.trigger_type,
      entity_id: entity.id,
      entity_type: entityType,
      actions_performed: actionsPerformed,
      status: status,
      error_message: error,
      execution_date: new Date().toISOString()
    });
  } catch (err) {
    console.error('Error logging workflow execution:', err);
  }
};

const wasAlreadyExecuted = async (workflowId, entityId, withinHours = 24) => {
  try {
    const executions = await base44.entities.WorkflowExecution.list('-execution_date', 100);
    const cutoffDate = new Date();
    cutoffDate.setHours(cutoffDate.getHours() - withinHours);
    
    return executions.some(exec => 
      exec.workflow_id === workflowId && 
      exec.entity_id === entityId &&
      exec.status === 'success' &&
      new Date(exec.execution_date) > cutoffDate
    );
  } catch (error) {
    console.error('Error checking execution history:', error);
    return false;
  }
};

const processInvoiceWorkflows = async (invoices, workflows) => {
  const today = new Date();
  
  for (const invoice of invoices) {
    if (!invoice.due_date) continue;
    
    const dueDate = parseISO(invoice.due_date);
    const daysUntilDue = differenceInDays(dueDate, today);
    const isPastDue = isBefore(dueDate, today);
    const daysPastDue = isPastDue ? Math.abs(daysUntilDue) : 0;
    
    for (const workflow of workflows) {
      if (!workflow.is_active) continue;
      
      const alreadyExecuted = await wasAlreadyExecuted(workflow.id, invoice.id, 24);
      if (alreadyExecuted) continue;
      
      let shouldTrigger = false;
      
      if (workflow.trigger_type === 'invoice_overdue' && invoice.status !== 'paid') {
        const daysAfter = workflow.trigger_config.days_after || 0;
        shouldTrigger = isPastDue && daysPastDue >= daysAfter;
      }
      
      if (workflow.trigger_type === 'invoice_due_soon' && invoice.status === 'sent') {
        const daysBefore = workflow.trigger_config.days_before || 3;
        shouldTrigger = !isPastDue && daysUntilDue <= daysBefore && daysUntilDue >= 0;
      }
      
      if (workflow.trigger_type === 'invoice_created') {
        const minAmount = workflow.trigger_config.min_amount || 0;
        const createdDate = parseISO(invoice.created_date);
        const hoursOld = differenceInDays(today, createdDate) * 24;
        
        shouldTrigger = invoice.amount >= minAmount && hoursOld < 1;
      }
      
      if (workflow.trigger_type === 'payment_received' && invoice.status === 'paid') {
        const updatedDate = parseISO(invoice.updated_date);
        const hoursOld = differenceInDays(today, updatedDate) * 24;
        
        shouldTrigger = hoursOld < 1;
      }
      
      if (shouldTrigger) {
        try {
          const actionsPerformed = await executeActions(workflow, invoice, 'invoice');
          await logExecution(workflow, invoice, 'invoice', actionsPerformed, 'success');
          
          await base44.entities.Workflow.update(workflow.id, {
            last_run: new Date().toISOString(),
            run_count: (workflow.run_count || 0) + 1
          });
        } catch (error) {
          console.error(`Error executing workflow ${workflow.name}:`, error);
          await logExecution(workflow, invoice, 'invoice', [], 'failed', error.message);
        }
      }
    }
  }
};

const processClientWorkflows = async (clients, workflows) => {
  for (const client of clients) {
    for (const workflow of workflows) {
      if (!workflow.is_active) continue;
      
      const alreadyExecuted = await wasAlreadyExecuted(workflow.id, client.id, 24);
      if (alreadyExecuted) continue;
      
      let shouldTrigger = false;
      
      if (workflow.trigger_type === 'client_status_change') {
        const toStatus = workflow.trigger_config.to;
        shouldTrigger = client.status === toStatus;
      }
      
      if (shouldTrigger) {
        try {
          const actionsPerformed = await executeActions(workflow, client, 'client');
          await logExecution(workflow, client, 'client', actionsPerformed, 'success');
          
          await base44.entities.Workflow.update(workflow.id, {
            last_run: new Date().toISOString(),
            run_count: (workflow.run_count || 0) + 1
          });
        } catch (error) {
          console.error(`Error executing workflow ${workflow.name}:`, error);
          await logExecution(workflow, client, 'client', [], 'failed', error.message);
        }
      }
    }
  }
};

const runWorkflowEngine = async () => {
  try {
    const [workflows, invoices, clients] = await Promise.all([
      base44.entities.Workflow.list('-created_date', 100),
      base44.entities.Invoice.list('-issue_date', 200),
      base44.entities.Client.list('name', 200)
    ]);
    
    const activeWorkflows = workflows.filter(w => w.is_active);
    
    await processInvoiceWorkflows(invoices, activeWorkflows);
    await processClientWorkflows(clients, activeWorkflows);
    
    return { success: true, processed: activeWorkflows.length };
  } catch (error) {
    console.error('Error running workflow engine:', error);
    return { success: false, error: error.message };
  }
};

export default function Workflows() {
  const [showForm, setShowForm] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [editingWorkflow, setEditingWorkflow] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [lastRun, setLastRun] = useState(null);

  const queryClient = useQueryClient();

  const { data: workflows = [], isLoading } = useQuery({
    queryKey: ['workflows'],
    queryFn: async () => {
      try {
        return await base44.entities.Workflow.list('-created_date', 100);
      } catch (error) {
        console.error('Error loading workflows:', error);
        return [];
      }
    }
  });

  const { data: executions = [] } = useQuery({
    queryKey: ['workflow-executions'],
    queryFn: async () => {
      try {
        return await base44.entities.WorkflowExecution.list('-execution_date', 50);
      } catch (error) {
        console.error('Error loading executions:', error);
        return [];
      }
    }
  });

  const createWorkflowMutation = useMutation({
    mutationFn: (data) => base44.entities.Workflow.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
      resetForm();
    },
    onError: (error) => {
      console.error('Error creating workflow:', error);
      alert('Failed to create workflow. Please try again.');
    }
  });

  const updateWorkflowMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Workflow.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
      resetForm();
    },
    onError: (error) => {
      console.error('Error updating workflow:', error);
      alert('Failed to update workflow. Please try again.');
    }
  });

  const deleteWorkflowMutation = useMutation({
    mutationFn: (id) => base44.entities.Workflow.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['workflows'] }),
    onError: (error) => {
      console.error('Error deleting workflow:', error);
      alert('Failed to delete workflow. Please try again.');
    }
  });

  const resetForm = () => {
    setEditingWorkflow(null);
    setShowForm(false);
  };

  const handleSubmit = async (data) => {
    if (editingWorkflow) {
      await updateWorkflowMutation.mutateAsync({ id: editingWorkflow.id, data });
    } else {
      await createWorkflowMutation.mutateAsync(data);
    }
  };

  const handleEdit = (workflow) => {
    setEditingWorkflow(workflow);
    setShowForm(true);
    setShowTemplates(false);
  };

  const handleToggle = async (workflow) => {
    await updateWorkflowMutation.mutateAsync({
      id: workflow.id,
      data: { ...workflow, is_active: !workflow.is_active }
    });
  };

  const handleSelectTemplate = (template) => {
    const workflowData = {
      name: template.name,
      description: template.description,
      trigger_type: template.trigger_type,
      trigger_config: template.trigger_config,
      actions: template.actions,
      is_active: true,
      conditions: {}
    };
    
    setEditingWorkflow(workflowData);
    setShowTemplates(false);
    setShowForm(true);
  };

  const handleRunNow = async () => {
    setIsRunning(true);
    try {
      const result = await runWorkflowEngine();
      setLastRun(new Date());
      
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
      queryClient.invalidateQueries({ queryKey: ['workflow-executions'] });
      
      alert(`Workflows processed successfully! ${result.processed} active workflows checked.`);
    } catch (error) {
      console.error('Error running workflows:', error);
      alert('Failed to run workflows. Please try again.');
    } finally {
      setIsRunning(false);
    }
  };

  useEffect(() => {
    const interval = setInterval(async () => {
      if (workflows.some(w => w.is_active)) {
        await runWorkflowEngine();
        setLastRun(new Date());
        queryClient.invalidateQueries({ queryKey: ['workflows'] });
        queryClient.invalidateQueries({ queryKey: ['workflow-executions'] });
      }
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [workflows, queryClient]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  const activeWorkflows = workflows.filter(w => w.is_active).length;
  const recentSuccessful = executions.filter(e => e.status === 'success').length;
  const recentFailed = executions.filter(e => e.status === 'failed').length;

  return (
    <>
      <Sidebar currentPage="Workflows" />
      
      <div className="w-full pt-[72px] md:pt-6" style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #FAF5FF 0%, #F0FDF4 50%, #EFF6FF 100%)',
        padding: '24px 16px'
      }}>
        <div className="w-full max-w-full" style={{ padding: '0 4px' }}>
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Workflow Automation</h1>
              <p className="text-gray-600 mt-1">Automate your business processes</p>
            </div>
            <div className="flex gap-3 flex-wrap">
              <Button
                onClick={handleRunNow}
                disabled={isRunning || activeWorkflows === 0}
                variant="outline"
                className="rounded-[14px]"
              >
                <Play className={`w-5 h-5 mr-2 ${isRunning ? 'animate-spin' : ''}`} />
                {isRunning ? 'Running...' : 'Run Now'}
              </Button>
              <Button
                onClick={() => {
                  setShowTemplates(!showTemplates);
                  setShowForm(false);
                }}
                variant="outline"
                className="rounded-[14px]"
              >
                <Zap className="w-5 h-5 mr-2" />
                Templates
              </Button>
              <Button
                onClick={() => {
                  setShowForm(!showForm);
                  setShowTemplates(false);
                  setEditingWorkflow(null);
                }}
                className="rounded-[14px] text-white"
                style={{ background: 'linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%)' }}
              >
                <Plus className="w-5 h-5 mr-2" />
                New Workflow
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Active Workflows', value: activeWorkflows, icon: Zap, color: '#A78BFA' },
              { label: 'Total Workflows', value: workflows.length, icon: Clock, color: '#93C5FD' },
              { label: 'Successful (24h)', value: recentSuccessful, icon: CheckCircle2, color: '#10B981' },
              { label: 'Failed (24h)', value: recentFailed, icon: XCircle, color: '#EF4444' }
            ].map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card
                  key={index}
                  className="p-5 rounded-[18px]"
                  style={{ background: 'rgba(255, 255, 255, 0.95)', boxShadow: '0 8px 32px rgba(167, 139, 250, 0.15)' }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-[14px] flex items-center justify-center"
                      style={{ background: `${stat.color}22` }}
                    >
                      <Icon className="w-6 h-6" style={{ color: stat.color }} />
                    </div>
                    <div>
                      <div className="text-xs text-gray-600">{stat.label}</div>
                      <div className="text-2xl font-bold text-gray-800">{stat.value}</div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {lastRun && (
            <div className="mb-6 p-4 rounded-[14px] bg-green-50 border border-green-200">
              <p className="text-sm text-green-800">
                ✓ Workflows last checked: {lastRun.toLocaleTimeString()}
              </p>
            </div>
          )}

          {/* Templates View */}
          <AnimatePresence>
            {showTemplates && (
              <div className="mb-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-800">Workflow Templates</h2>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowTemplates(false)}
                    className="rounded-[10px]"
                  >
                    Hide Templates
                  </Button>
                </div>
                <WorkflowTemplates onSelectTemplate={handleSelectTemplate} />
              </div>
            )}
          </AnimatePresence>

          {/* Workflow Form */}
          <AnimatePresence>
            {showForm && (
              <WorkflowForm
                workflow={editingWorkflow}
                onSubmit={handleSubmit}
                onCancel={resetForm}
              />
            )}
          </AnimatePresence>

          {/* Workflow List */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Your Workflows</h2>
            <WorkflowList
              workflows={workflows}
              onEdit={handleEdit}
              onDelete={(id) => deleteWorkflowMutation.mutate(id)}
              onToggle={handleToggle}
            />
          </div>

          {/* Recent Executions */}
          {executions.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Executions</h2>
              <Card className="p-6 rounded-[20px]" style={{ background: 'rgba(255, 255, 255, 0.95)', boxShadow: '0 8px 32px rgba(167, 139, 250, 0.15)' }}>
                <div className="space-y-3">
                  {executions.slice(0, 10).map((execution) => (
                    <div
                      key={execution.id}
                      className="flex items-center justify-between p-3 rounded-[12px] bg-gray-50"
                    >
                      <div className="flex items-center gap-3">
                        {execution.status === 'success' ? (
                          <CheckCircle2 className="w-5 h-5 text-green-600" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-600" />
                        )}
                        <div>
                          <div className="font-medium text-gray-800">{execution.workflow_name}</div>
                          <div className="text-xs text-gray-500">
                            {execution.actions_performed?.length || 0} action{execution.actions_performed?.length !== 1 ? 's' : ''} performed
                          </div>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(execution.execution_date).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
