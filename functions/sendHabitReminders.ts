import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // This should be called via scheduled job every 5-10 minutes
    const now = new Date();
    const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000);

    // Get all unsent reminders due in the next 5 minutes
    const dueReminders = await base44.asServiceRole.entities.Reminder.filter({
      is_sent: false,
      is_dismissed: false,
      reminder_time: {
        $gte: now.toISOString(),
        $lte: fiveMinutesFromNow.toISOString()
      }
    });

    const results = [];

    for (const reminder of dueReminders) {
      try {
        // Check if snoozed
        if (reminder.snoozed_until && new Date(reminder.snoozed_until) > now) {
          continue;
        }

        // Get the user who owns this reminder
        const entity = await getEntityForReminder(base44, reminder);
        if (!entity || !entity.created_by) continue;

        // Send notification based on channels
        for (const channel of reminder.notification_channels || ['in_app']) {
          if (channel === 'email') {
            await base44.asServiceRole.integrations.Core.SendEmail({
              to: entity.created_by,
              subject: reminder.title,
              body: `
                <h2>${reminder.title}</h2>
                <p>${reminder.message}</p>
                <p style="color: #666; font-size: 14px;">
                  This is a reminder from SoloSync.
                </p>
              `
            });
          }
          // In-app notifications are handled by the frontend polling
        }

        // Mark as sent
        await base44.asServiceRole.entities.Reminder.update(reminder.id, {
          is_sent: true,
          sent_at: now.toISOString()
        });

        results.push({ id: reminder.id, status: 'sent' });

        // Create next recurring reminder if applicable
        if (reminder.is_recurring && reminder.recurrence_pattern) {
          const nextTime = calculateNextReminderTime(now, reminder.recurrence_pattern);
          
          await base44.asServiceRole.entities.Reminder.create({
            ...reminder,
            id: undefined,
            reminder_time: nextTime.toISOString(),
            is_sent: false,
            sent_at: null,
            is_dismissed: false
          });
        }

      } catch (error) {
        console.error(`Error sending reminder ${reminder.id}:`, error);
        results.push({ id: reminder.id, status: 'error', error: error.message });
      }
    }

    return Response.json({
      success: true,
      processed: dueReminders.length,
      results
    });

  } catch (error) {
    console.error('Error in sendHabitReminders:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

async function getEntityForReminder(base44, reminder) {
  try {
    switch (reminder.type) {
      case 'habit':
        return await base44.asServiceRole.entities.Habit.get(reminder.entity_id);
      case 'task':
        return await base44.asServiceRole.entities.Task.get(reminder.entity_id);
      case 'goal':
        return await base44.asServiceRole.entities.Goal.get(reminder.entity_id);
      default:
        return null;
    }
  } catch {
    return null;
  }
}

function calculateNextReminderTime(currentTime, pattern) {
  const next = new Date(currentTime);
  
  switch (pattern) {
    case 'daily':
      next.setDate(next.getDate() + 1);
      break;
    case 'weekly':
      next.setDate(next.getDate() + 7);
      break;
    case 'monthly':
      next.setMonth(next.getMonth() + 1);
      break;
  }
  
  return next;
}