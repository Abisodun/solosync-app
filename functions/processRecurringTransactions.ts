import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

// Helper to calculate next occurrence date
function calculateNextOccurrence(currentDate, pattern) {
  const date = new Date(currentDate);
  
  switch (pattern) {
    case 'daily':
      date.setDate(date.getDate() + 1);
      break;
    case 'weekly':
      date.setDate(date.getDate() + 7);
      break;
    case 'biweekly':
      date.setDate(date.getDate() + 14);
      break;
    case 'monthly':
      date.setMonth(date.getMonth() + 1);
      break;
    case 'quarterly':
      date.setMonth(date.getMonth() + 3);
      break;
    case 'yearly':
      date.setFullYear(date.getFullYear() + 1);
      break;
    default:
      date.setMonth(date.getMonth() + 1);
  }
  
  return date.toISOString();
}

// Check if a transaction should be processed today
function shouldProcessToday(nextOccurrenceDate) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const occurrenceDate = new Date(nextOccurrenceDate);
  occurrenceDate.setHours(0, 0, 0, 0);
  
  return occurrenceDate <= today;
}

// Check if recurring transaction has expired
function hasExpired(endDate) {
  if (!endDate) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const end = new Date(endDate);
  end.setHours(0, 0, 0, 0);
  return end < today;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Verify this is called by an authenticated user or service
    const isAuthenticated = await base44.auth.isAuthenticated();
    if (!isAuthenticated) {
      return Response.json({ 
        error: 'Unauthorized',
        message: 'This function requires authentication'
      }, { status: 401 });
    }

    // Get all recurring transaction templates that are active
    const recurringTemplates = await base44.asServiceRole.entities.Transaction.filter({
      is_template: true,
      is_recurring: true
    });

    console.log(`📋 Found ${recurringTemplates.length} recurring templates`);

    const results = {
      processed: 0,
      created: 0,
      updated: 0,
      errors: [],
      skipped: 0
    };

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (const template of recurringTemplates) {
      try {
        // Skip if paused
        if (template.is_paused) {
          results.skipped++;
          continue;
        }

        // Check if expired
        if (hasExpired(template.recurrence_end_date)) {
          console.log(`⏰ Template ${template.id} has expired, skipping`);
          results.skipped++;
          continue;
        }

        // Check if we should process today
        if (!template.next_occurrence_date || !shouldProcessToday(template.next_occurrence_date)) {
          results.skipped++;
          continue;
        }

        // Create actual transaction from template
        const newTransaction = {
          type: template.type,
          amount: template.amount,
          description: template.description,
          category: template.category,
          date: template.next_occurrence_date,
          payment_method: template.payment_method,
          client_name: template.client_name,
          notes: template.notes,
          is_tax_deductible: template.is_tax_deductible,
          tax_category: template.tax_category,
          is_recurring: false, // This is an actual transaction, not a template
          is_template: false,
          parent_transaction_id: template.id
        };

        // Create the transaction (as the template owner)
        await base44.asServiceRole.entities.Transaction.create({
          ...newTransaction,
          created_by: template.created_by
        });

        console.log(`✅ Created transaction for: ${template.description}`);
        results.created++;

        // Update template with next occurrence date
        const nextOccurrence = calculateNextOccurrence(
          template.next_occurrence_date,
          template.recurrence_pattern
        );

        // Check if next occurrence is beyond end date
        if (template.recurrence_end_date) {
          const endDate = new Date(template.recurrence_end_date);
          endDate.setHours(0, 0, 0, 0);
          const nextDate = new Date(nextOccurrence);
          nextDate.setHours(0, 0, 0, 0);
          
          if (nextDate > endDate) {
            // Mark as expired/paused
            await base44.asServiceRole.entities.Transaction.update(template.id, {
              is_paused: true,
              next_occurrence_date: null
            });
            console.log(`🏁 Template ${template.id} completed, marking as paused`);
            results.updated++;
            continue;
          }
        }

        // Update next occurrence
        await base44.asServiceRole.entities.Transaction.update(template.id, {
          next_occurrence_date: nextOccurrence
        });

        console.log(`📅 Updated next occurrence for: ${template.description} to ${nextOccurrence}`);
        results.updated++;
        results.processed++;

      } catch (error) {
        console.error(`❌ Error processing template ${template.id}:`, error);
        results.errors.push({
          template_id: template.id,
          description: template.description,
          error: error.message
        });
      }
    }

    return Response.json({
      success: true,
      message: `Processed ${results.processed} recurring transactions`,
      results,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error in processRecurringTransactions:', error);
    return Response.json({ 
      error: error.message,
      success: false
    }, { status: 500 });
  }
});