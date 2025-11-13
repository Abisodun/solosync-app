import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

/**
 * Process recurring transactions and create actual transactions when due.
 * This function should be called daily (e.g., via a cron job).
 */

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Use service role to process all users' recurring transactions
    const recurringTransactions = await base44.asServiceRole.entities.RecurringTransaction.list();
    
    console.log(`Processing ${recurringTransactions.length} recurring transactions`);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const results = {
      processed: 0,
      created: 0,
      skipped: 0,
      errors: []
    };
    
    for (const recurring of recurringTransactions) {
      try {
        // Skip if inactive or auto_create is disabled
        if (!recurring.is_active || !recurring.auto_create) {
          results.skipped++;
          continue;
        }
        
        // Check if we should create a transaction today
        const nextOccurrence = new Date(recurring.next_occurrence);
        nextOccurrence.setHours(0, 0, 0, 0);
        
        if (nextOccurrence.getTime() !== today.getTime()) {
          results.skipped++;
          continue;
        }
        
        // Check if end_date has passed
        if (recurring.end_date) {
          const endDate = new Date(recurring.end_date);
          endDate.setHours(0, 0, 0, 0);
          
          if (today > endDate) {
            // Deactivate this recurring transaction
            await base44.asServiceRole.entities.RecurringTransaction.update(recurring.id, {
              is_active: false
            });
            results.skipped++;
            continue;
          }
        }
        
        // Create the transaction
        const transactionData = {
          type: recurring.type,
          amount: recurring.amount,
          description: recurring.description,
          category: recurring.category,
          date: today.toISOString(),
          payment_method: recurring.payment_method || '',
          notes: recurring.notes ? `${recurring.notes} (Auto-created from recurring transaction)` : 'Auto-created from recurring transaction',
          created_by: recurring.created_by
        };
        
        await base44.asServiceRole.entities.Transaction.create(transactionData);
        
        // Calculate next occurrence
        let nextDate = new Date(nextOccurrence);
        
        switch (recurring.frequency) {
          case 'daily':
            nextDate.setDate(nextDate.getDate() + 1);
            break;
          case 'weekly':
            nextDate.setDate(nextDate.getDate() + 7);
            break;
          case 'biweekly':
            nextDate.setDate(nextDate.getDate() + 14);
            break;
          case 'monthly':
            nextDate.setMonth(nextDate.getMonth() + 1);
            break;
          case 'quarterly':
            nextDate.setMonth(nextDate.getMonth() + 3);
            break;
          case 'yearly':
            nextDate.setFullYear(nextDate.getFullYear() + 1);
            break;
          default:
            nextDate.setMonth(nextDate.getMonth() + 1);
        }
        
        // Update recurring transaction
        await base44.asServiceRole.entities.RecurringTransaction.update(recurring.id, {
          next_occurrence: nextDate.toISOString().split('T')[0],
          last_processed: today.toISOString(),
          total_occurrences: (recurring.total_occurrences || 0) + 1
        });
        
        results.processed++;
        results.created++;
        
      } catch (error) {
        console.error(`Error processing recurring transaction ${recurring.id}:`, error);
        results.errors.push({
          id: recurring.id,
          description: recurring.description,
          error: error.message
        });
      }
    }
    
    console.log('Processing complete:', results);
    
    return Response.json({
      success: true,
      results
    });
    
  } catch (error) {
    console.error('Error in processRecurringTransactions:', error);
    return Response.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
});