import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Plus, FileText } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card } from "@/components/ui/card";
import { format } from 'date-fns';
import AIForecast from '../components/finance/AIForecast';
import TransactionForm from '../components/finance/TransactionForm';
import TransactionList from '../components/finance/TransactionList';
import FinanceStats from '../components/finance/FinanceStats';

export default function Finance() {
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [showInvoiceForm, setShowInvoiceForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [user, setUser] = useState(null);

  const queryClient = useQueryClient();

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        console.error('Error loading user:', error);
      }
    };
    loadUser();
  }, []);

  const { data: transactions = [], isLoading: transactionsLoading } = useQuery({
    queryKey: ['transactions'],
    queryFn: async () => {
      try {
        return await base44.entities.Transaction.list('-date', 200);
      } catch (error) {
        console.error('Error loading transactions:', error);
        return [];
      }
    }
  });

  const { data: invoices = [] } = useQuery({
    queryKey: ['invoices'],
    queryFn: async () => {
      try {
        return await base44.entities.Invoice.list('-issue_date', 100);
      } catch (error) {
        console.error('Error loading invoices:', error);
        return [];
      }
    }
  });

  const createTransactionMutation = useMutation({
    mutationFn: (data) => base44.entities.Transaction.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      resetTransactionForm();
    },
    onError: (error) => {
      console.error('Error creating transaction:', error);
      alert('Failed to create transaction. Please try again.');
    }
  });

  const updateTransactionMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Transaction.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      resetTransactionForm();
    },
    onError: (error) => {
      console.error('Error updating transaction:', error);
      alert('Failed to update transaction. Please try again.');
    }
  });

  const deleteTransactionMutation = useMutation({
    mutationFn: (id) => base44.entities.Transaction.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['transactions'] }),
    onError: (error) => {
      console.error('Error deleting transaction:', error);
      alert('Failed to delete transaction. Please try again.');
    }
  });

  const resetTransactionForm = () => {
    setEditingTransaction(null);
    setShowTransactionForm(false);
  };

  const handleTransactionSubmit = async (data) => {
    if (editingTransaction) {
      await updateTransactionMutation.mutateAsync({ id: editingTransaction.id, data });
    } else {
      await createTransactionMutation.mutateAsync(data);
    }
  };

  const handleEditTransaction = (transaction) => {
    setEditingTransaction(transaction);
    setShowTransactionForm(true);
  };

  // Calculate stats
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const netProfit = totalIncome - totalExpenses;
  const unpaidInvoices = invoices.filter(i => i.status === 'sent' || i.status === 'overdue');
  const unpaidAmount = unpaidInvoices.reduce((sum, i) => sum + i.amount, 0);

  // Chart data
  const monthlyData = transactions.reduce((acc, t) => {
    const month = format(new Date(t.date), 'MMM yyyy');
    if (!acc[month]) acc[month] = { month, income: 0, expenses: 0 };
    if (t.type === 'income') acc[month].income += t.amount;
    else acc[month].expenses += t.amount;
    return acc;
  }, {});
  const chartData = Object.values(monthlyData).slice(-6);

  const categoryData = transactions.reduce((acc, t) => {
    if (!acc[t.category]) acc[t.category] = 0;
    acc[t.category] += t.amount;
    return acc;
  }, {});
  const pieData = Object.entries(categoryData).map(([name, value]) => ({ name, value }));

  const COLORS = ['#A78BFA', '#93C5FD', '#86EFAC', '#FCD34D', '#F472B6', '#34D399'];

  if (transactionsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Finance Tracker</h1>
          <p className="text-gray-600 mt-1">Manage income, expenses & invoices</p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={() => setShowTransactionForm(!showTransactionForm)}
            className="rounded-[14px] text-white"
            style={{ background: 'linear-gradient(135deg, #86EFAC 0%, #10B981 100%)' }}
            aria-label="Add new transaction"
          >
            <Plus className="w-5 h-5 mr-2" />
            Transaction
          </Button>
          <Button
            onClick={() => setShowInvoiceForm(!showInvoiceForm)}
            className="rounded-[14px] text-white"
            style={{ background: 'linear-gradient(135deg, #93C5FD 0%, #3B82F6 100%)' }}
            aria-label="Create new invoice"
          >
            <FileText className="w-5 h-5 mr-2" />
            Invoice
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="mb-8">
        <FinanceStats
          totalIncome={totalIncome}
          totalExpenses={totalExpenses}
          netProfit={netProfit}
          unpaidAmount={unpaidAmount}
          currency={user?.currency}
        />
      </div>

      {/* Transaction Form */}
      <AnimatePresence>
        {showTransactionForm && (
          <TransactionForm
            transaction={editingTransaction}
            onSubmit={handleTransactionSubmit}
            onCancel={resetTransactionForm}
          />
        )}
      </AnimatePresence>

      {/* AI Financial Forecast Section */}
      <div className="mb-8">
        <AIForecast transactions={transactions} user={user} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card className="p-6 rounded-[20px]" style={{ background: 'rgba(255, 255, 255, 0.95)', boxShadow: '0 8px 32px rgba(167, 139, 250, 0.15)' }}>
          <h3 className="text-lg font-bold text-gray-800 mb-4">Income vs Expenses</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="month" stroke="#6B7280" />
              <YAxis stroke="#6B7280" />
              <Tooltip />
              <Legend />
              <Bar dataKey="income" fill="#86EFAC" name="Income" radius={[8, 8, 0, 0]} />
              <Bar dataKey="expenses" fill="#FCA5A5" name="Expenses" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6 rounded-[20px]" style={{ background: 'rgba(255, 255, 255, 0.95)', boxShadow: '0 8px 32px rgba(167, 139, 250, 0.15)' }}>
          <h3 className="text-lg font-bold text-gray-800 mb-4">Spending by Category</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Recent Transactions */}
      <TransactionList
        transactions={transactions}
        onEdit={handleEditTransaction}
        onDelete={(id) => deleteTransactionMutation.mutate(id)}
      />
    </div>
  );
}