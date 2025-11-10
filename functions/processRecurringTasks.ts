import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // This function should be called via a scheduled job/cron
    // For now, it can be triggered manually or via webhook
    
    // Get all recurring task templates
    const recurringTasks = await base44.asServiceRole.entities.Task.filter({
      is_recurring: true,
      parent_task_id: { $exists: false } // Only templates, not instances
    });

    const now = new Date();
    const createdTasks = [];

    for (const template of recurringTasks) {
      // Check if we need to create a new instance
      const shouldCreate = await checkShouldCreateInstance(base44, template, now);
      
      if (shouldCreate) {
        const newTask = await base44.asServiceRole.entities.Task.create({
          ...template,
          id: undefined, // Let system generate new ID
          parent_task_id: template.id,
          is_recurring: false, // Instances are not recurring themselves
          due_date: calculateNextDueDate(template, now),
          status: 'todo',
          created_by: template.created_by
        });
        
        createdTasks.push(newTask);
      }
    }

    return Response.json({
      success: true,
      processed: recurringTasks.length,
      created: createdTasks.length,
      tasks: createdTasks
    });

  } catch (error) {
    console.error('Error processing recurring tasks:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

async function checkShouldCreateInstance(base44, template, now) {
  // Check if an instance already exists for the current period
  const instances = await base44.asServiceRole.entities.Task.filter({
    parent_task_id: template.id,
    created_date: { $gte: getStartOfPeriod(template, now).toISOString() }
  });

  return instances.length === 0;
}

function getStartOfPeriod(template, now) {
  const start = new Date(now);
  
  switch (template.recurrence_pattern) {
    case 'daily':
      start.setHours(0, 0, 0, 0);
      break;
    case 'weekly':
      const day = start.getDay();
      start.setDate(start.getDate() - day);
      start.setHours(0, 0, 0, 0);
      break;
    case 'monthly':
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      break;
    case 'yearly':
      start.setMonth(0, 1);
      start.setHours(0, 0, 0, 0);
      break;
  }
  
  return start;
}

function calculateNextDueDate(template, now) {
  if (!template.due_date) return now.toISOString();

  const next = new Date(now);
  const interval = template.recurrence_interval || 1;

  switch (template.recurrence_pattern) {
    case 'daily':
      next.setDate(next.getDate() + interval);
      break;
    case 'weekly':
      next.setDate(next.getDate() + (7 * interval));
      break;
    case 'monthly':
      next.setMonth(next.getMonth() + interval);
      break;
    case 'yearly':
      next.setFullYear(next.getFullYear() + interval);
      break;
  }

  return next.toISOString();
}