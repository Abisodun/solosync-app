import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Gather user context
    const [tasks, goals, transactions] = await Promise.all([
      base44.entities.Task.list('-created_date', 50),
      base44.entities.Goal.list('-created_date', 20),
      base44.entities.Transaction.list('-date', 100)
    ]);

    const completedTasks = tasks.filter(t => t.status === 'done').length;
    const activeGoals = goals.filter(g => g.status === 'active');
    const totalIncome = transactions.filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const prompt = `You are a goal-setting coach. Based on this user's profile, suggest 3-5 SMART goals:

User Type: ${user.user_type || 'professional'}
Completed Tasks: ${completedTasks}
Active Goals: ${activeGoals.length}
Recent Income (3 months): $${totalIncome}
Current Goal Categories: ${activeGoals.map(g => g.category).join(', ')}

Provide diverse, actionable goals across different categories. Return JSON:
{
  "suggested_goals": [
    {
      "title": "Goal title",
      "description": "Detailed description",
      "category": "business|personal|health|learning|financial",
      "difficulty": "easy|medium|hard",
      "estimated_duration": "e.g., 3 months",
      "why_relevant": "Why this goal fits the user"
    }
  ]
}

Make goals specific, measurable, and achievable for a ${user.user_type || 'professional'}.`;

    const aiResponse = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          suggested_goals: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                description: { type: 'string' },
                category: { type: 'string' },
                difficulty: { type: 'string' },
                estimated_duration: { type: 'string' },
                why_relevant: { type: 'string' }
              }
            }
          }
        }
      }
    });

    return Response.json({
      success: true,
      suggestions: aiResponse.suggested_goals || []
    });

  } catch (error) {
    console.error('Error generating goal suggestions:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});