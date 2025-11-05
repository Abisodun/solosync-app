import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { format, year } = await req.json();

    // Fetch all transactions
    const transactions = await base44.entities.Transaction.list('-date', 1000);

    // Filter by year if specified
    let filteredTransactions = transactions;
    if (year) {
      filteredTransactions = transactions.filter((t) => {
        const transactionYear = new Date(t.date).getFullYear();
        return transactionYear === parseInt(year);
      });
    }

    // Calculate summaries
    const income = filteredTransactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const expenses = filteredTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const profit = income - expenses;

    // Group by category
    const byCategory = {};
    filteredTransactions.forEach((t) => {
      const category = t.category || 'Uncategorized';
      if (!byCategory[category]) {
        byCategory[category] = { income: 0, expenses: 0 };
      }
      if (t.type === 'income') {
        byCategory[category].income += t.amount;
      } else {
        byCategory[category].expenses += t.amount;
      }
    });

    // Group by month
    const byMonth = {};
    filteredTransactions.forEach((t) => {
      const month = new Date(t.date).toISOString().substring(0, 7); // YYYY-MM
      if (!byMonth[month]) {
        byMonth[month] = { income: 0, expenses: 0 };
      }
      if (t.type === 'income') {
        byMonth[month].income += t.amount;
      } else {
        byMonth[month].expenses += t.amount;
      }
    });

    if (format === 'csv') {
      // Generate CSV
      let csv = 'Date,Type,Category,Description,Amount,Client/Vendor,Payment Method\n';
      
      filteredTransactions.forEach((t) => {
        const row = [
          new Date(t.date).toLocaleDateString(),
          t.type,
          t.category || '',
          `"${(t.description || '').replace(/"/g, '""')}"`,
          t.amount.toFixed(2),
          t.client_name || '',
          t.payment_method || '',
        ];
        csv += row.join(',') + '\n';
      });

      // Add summary
      csv += '\n\nSummary\n';
      csv += `Total Income,$${income.toFixed(2)}\n`;
      csv += `Total Expenses,$${expenses.toFixed(2)}\n`;
      csv += `Net Profit,$${profit.toFixed(2)}\n`;

      return new Response(csv, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="financial-data-${year || 'all'}.csv"`,
        },
      });
    } else {
      // Return JSON
      return Response.json({
        summary: {
          total_income: income,
          total_expenses: expenses,
          net_profit: profit,
          transaction_count: filteredTransactions.length,
        },
        by_category: byCategory,
        by_month: byMonth,
        transactions: filteredTransactions,
      });
    }
  } catch (error) {
    console.error('Export error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});