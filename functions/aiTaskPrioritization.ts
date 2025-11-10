import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch all active tasks
    const tasks = await base44.entities.Task.filter({ status: { $in: ['todo', 'in_progress'] } });
    
    if (tasks.length === 0) {
      return Response.json({ message: 'No tasks to prioritize', tasks: [] });
    }

    // Prepare task data for AI
    const taskData = tasks.map(t => ({
      id: t.id,
      title: t.title,
      priority: t.priority,
      due_date: t.due_date,
      estimated_hours: t.estimated_hours,
      project: t.project,
      status: t.status
    }));

    const prompt = `You are a productivity expert. Analyze these tasks and assign each a priority score from 1-100 based on:
- Urgency (due date proximity)
- Priority level
- Estimated effort
- Project importance

Tasks:
${JSON.stringify(taskData, null, 2)}

Return a JSON array with each task's ID and calculated priority_score. Format:
{
  "prioritized_tasks": [
    {"id": "task_id", "priority_score": 85, "reasoning": "Brief explanation"}
  ]
}

Higher scores = more urgent/important.`;

    const aiResponse = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          prioritized_tasks: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                priority_score: { type: 'number' },
                reasoning: { type: 'string' }
              }
            }
          }
        }
      }
    });

    // Update tasks with AI priority scores
    const updates = [];
    for (const task of aiResponse.prioritized_tasks || []) {
      updates.push(
        base44.entities.Task.update(task.id, { ai_priority_score: task.priority_score })
      );
    }

    await Promise.all(updates);

    return Response.json({
      success: true,
      prioritized_count: updates.length,
      tasks: aiResponse.prioritized_tasks
    });

  } catch (error) {
    console.error('Error in AI task prioritization:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});