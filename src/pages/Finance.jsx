import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Plus, FileText, TrendingUp, Target, Repeat } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card } from "@/components/ui/card";
import { format, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import AIForecast from '../components/finance/AIForecast';
import TransactionForm from '../components/finance/TransactionForm';
import TransactionList from '../components/finance/TransactionList';
import FinanceStats from '../components/finance/FinanceStats';
import InvoiceForm from '../components/finance/InvoiceForm';
import InvoiceList from '../components/finance/InvoiceList';
import InvoiceView from '../components/finance/InvoiceView';
import InvoiceStats from '../components/finance/InvoiceStats';
import BudgetForm from '../components/finance/BudgetForm';
import BudgetProgress from '../components/finance/BudgetProgress';
import BudgetAlerts from '../components/finance/BudgetAlerts';
import BudgetOverview from '../components/finance/BudgetOverview';
import Sidebar from '../components/common/Sidebar';
import RecurringTransactionForm from '../components/finance/RecurringTransactionForm';
import RecurringTransactionsList from '../components/finance/RecurringTransactionsList';

export default function Finance() {
  const [activeTab, setActiveTab] = useState('overview');
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [showInvoiceForm, setShowInvoiceForm] = useState(false);
  const [showBudgetForm, setShowBudgetForm] = useState(false);
  const [showRecurringForm, setShowRecurringForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [editingBudget, setEditingBudget] = useState(null);
  const [editingRecurring, setEditingRecurring] = useState(null);
  const [viewingInvoice, setViewingInvoice] = useState(null);
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
        const result = await base44.entities.Transaction.filter({
          is_template: false
        });
        console.log('📊 Loaded transactions:', result.length);
        return result.sort((a, b) => new Date(b.date) - new Date(a.date));
      } catch (error) {
        console.error('Error loading transactions:', error);
        return [];
      }
    }
  });

  const { data: invoices = [], isLoading: invoicesLoading } = useQuery({
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

  const { data: budgets = [], isLoading: budgetsLoading } = useQuery({
    queryKey: ['budgets'],
    queryFn: async () => {
      try {
        const result = await base44.entities.Budget.list('-created_date', 100);
        console.log('💰 Loaded budgets:', result.length);
        return result;
      } catch (error) {
        console.error('Error loading budgets:', error);
        return [];
      }
    }
  });

  const { data: recurringTransactions = [], isLoading: recurringLoading } = useQuery({
    queryKey: ['recurring-transactions'],
    queryFn: async () => {
      try {
        const result = await base44.entities.Transaction.filter({
          is_template: true,
          is_recurring: true
        });
        console.log('🔄 Loaded recurring transactions:', result.length, result);
        return result;
      } catch (error) {
        console.error('Error loading recurring transactions:', error);
        return [];
      }
    }
  });

  // Filter transactions for current month (exclude templates)
  const currentMonthTransactions = transactions.filter(t => {
    if (t.is_template) return false;
    const transDate = new Date(t.date);
    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);
    return isWithinInterval(transDate, { start: monthStart, end: monthEnd });
  });

  // Filter budgets for current month
  const currentMonth = format(new Date(), 'yyyy-MM');
  const currentMonthBudgets = budgets.filter(b => b.month === currentMonth && b.is_active);

  const createTransactionMutation = useMutation({
    mutationFn: async (data) => {
      console.log('Creating transaction:', data);
      const result = await base44.entities.Transaction.create(data);
      console.log('Transaction created:', result);
      return result;
    },
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

  const createInvoiceMutation = useMutation({
    mutationFn: (data) => base44.entities.Invoice.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      resetInvoiceForm();
    },
    onError: (error) => {
      console.error('Error creating invoice:', error);
      alert('Failed to create invoice. Please try again.');
    }
  });

  const updateInvoiceMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Invoice.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      resetInvoiceForm();
      setViewingInvoice(null);
    },
    onError: (error) => {
      console.error('Error updating invoice:', error);
      alert('Failed to update invoice. Please try again.');
    }
  });

  const deleteInvoiceMutation = useMutation({
    mutationFn: (id) => base44.entities.Invoice.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['invoices'] }),
    onError: (error) => {
      console.error('Error deleting invoice:', error);
      alert('Failed to delete invoice. Please try again.');
    }
  });

  const createBudgetMutation = useMutation({
    mutationFn: async (data) => {
      console.log('Creating budget:', data);
      const result = await base44.entities.Budget.create(data);
      console.log('Budget created:', result);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      resetBudgetForm();
    },
    onError: (error) => {
      console.error('Error creating budget:', error);
      alert('Failed to create budget. Please try again.');
    }
  });

  const updateBudgetMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Budget.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      resetBudgetForm();
    },
    onError: (error) => {
      console.error('Error updating budget:', error);
      alert('Failed to update budget. Please try again.');
    }
  });

  const deleteBudgetMutation = useMutation({
    mutationFn: (id) => base44.entities.Budget.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['budgets'] }),
    onError: (error) => {
      console.error('Error deleting budget:', error);
      alert('Failed to delete budget. Please try again.');
    }
  });

  const createRecurringMutation = useMutation({
    mutationFn: async (data) => {
      console.log('Creating recurring transaction:', data);
      const result = await base44.entities.Transaction.create(data);
      console.log('Recurring transaction created:', result);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring-transactions'] });
      resetRecurringForm();
    },
    onError: (error) => {
      console.error('Error creating recurring transaction:', error);
      alert('Failed to create recurring transaction. Please try again.');
    }
  });

  const updateRecurringMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      console.log('Updating recurring transaction:', id, data);
      const result = await base44.entities.Transaction.update(id, data);
      console.log('Recurring transaction updated:', result);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring-transactions'] });
      resetRecurringForm();
    },
    onError: (error) => {
      console.error('Error updating recurring transaction:', error);
      alert('Failed to update recurring transaction. Please try again.');
    }
  });

  const deleteRecurringMutation = useMutation({
    mutationFn: (id) => base44.entities.Transaction.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['recurring-transactions'] }),
    onError: (error) => {
      console.error('Error deleting recurring transaction:', error);
      alert('Failed to delete recurring transaction. Please try again.');
    }
  });

  const toggleRecurringActiveMutation = useMutation({
    mutationFn: ({ id, isPaused }) => base44.entities.Transaction.update(id, { is_paused: isPaused }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['recurring-transactions'] }),
    onError: (error) => {
      console.error('Error toggling recurring transaction:', error);
      alert('Failed to update recurring transaction. Please try again.');
    }
  });

  const resetTransactionForm = () => {
    setEditingTransaction(null);
    setShowTransactionForm(false);
  };

  const resetInvoiceForm = () => {
    setEditingInvoice(null);
    setShowInvoiceForm(false);
  };

  const resetBudgetForm = () => {
    setEditingBudget(null);
    setShowBudgetForm(false);
  };

  const resetRecurringForm = () => {
    setEditingRecurring(null);
    setShowRecurringForm(false);
  };

  const handleTransactionSubmit = async (data) => {
    if (editingTransaction) {
      await updateTransactionMutation.mutateAsync({ id: editingTransaction.id, data });
    } else {
      await createTransactionMutation.mutateAsync(data);
    }
  };

  const handleInvoiceSubmit = async (data) => {
    if (editingInvoice) {
      await updateInvoiceMutation.mutateAsync({ id: editingInvoice.id, data });
    } else {
      await createInvoiceMutation.mutateAsync(data);
    }
  };

  const handleBudgetSubmit = async (data) => {
    if (editingBudget) {
      await updateBudgetMutation.mutateAsync({ id: editingBudget.id, data });
    } else {
      await createBudgetMutation.mutateAsync(data);
    }
  };

  const handleRecurringSubmit = async (data) => {
    if (editingRecurring) {
      await updateRecurringMutation.mutateAsync({ id: editingRecurring.id, data });
    } else {
      await createRecurringMutation.mutateAsync(data);
    }
  };

  const handleEditTransaction = (transaction) => {
    setEditingTransaction(transaction);
    setShowTransactionForm(true);
    setShowInvoiceForm(false);
    setShowBudgetForm(false);
    setShowRecurringForm(false);
  };

  const handleEditInvoice = (invoice) => {
    setEditingInvoice(invoice);
    setShowInvoiceForm(true);
    setShowTransactionForm(false);
    setShowBudgetForm(false);
    setShowRecurringForm(false);
    setActiveTab('invoices');
  };

  const handleEditBudget = (budget) => {
    setEditingBudget(budget);
    setShowBudgetForm(true);
    setShowTransactionForm(false);
    setShowInvoiceForm(false);
    setShowRecurringForm(false);
    setActiveTab('budgets');
  };

  const handleEditRecurring = (transaction) => {
    setEditingRecurring(transaction);
    setShowRecurringForm(true);
    setShowTransactionForm(false);
    setShowInvoiceForm(false);
    setShowBudgetForm(false);
    setActiveTab('recurring');
  };

  const handleToggleRecurringActive = async (transaction) => {
    await toggleRecurringActiveMutation.mutateAsync({
      id: transaction.id,
      isPaused: !transaction.is_paused
    });
  };

  const handleInvoiceStatusChange = async (invoiceId, newStatus) => {
    const invoice = invoices.find(inv => inv.id === invoiceId);
    if (invoice) {
      await updateInvoiceMutation.mutateAsync({
        id: invoiceId,
        data: { ...invoice, status: newStatus }
      });
    }
  };

  // Calculate stats
  const totalIncome = transactions.filter(t => t.type === 'income' && !t.is_template).reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = transactions.filter(t => t.type === 'expense' && !t.is_template).reduce((sum, t) => sum + t.amount, 0);
  const netProfit = totalIncome - totalExpenses;
  const unpaidInvoices = invoices.filter(i => i.status === 'sent' || i.status === 'overdue');
  const unpaidAmount = unpaidInvoices.reduce((sum, i) => sum + i.amount, 0);

  // Chart data
  const monthlyData = transactions.filter(t => !t.is_template).reduce((acc, t) => {
    const month = format(new Date(t.date), 'MMM yyyy');
    if (!acc[month]) acc[month] = { month, income: 0, expenses: 0 };
    if (t.type === 'income') acc[month].income += t.amount;
    else acc[month].expenses += t.amount;
    return acc;
  }, {});
  const chartData = Object.values(monthlyData).slice(-6);

  const categoryData = transactions.filter(t => !t.is_template).reduce((acc, t) => {
    if (!acc[t.category]) acc[t.category] = 0;
    acc[t.category] += t.amount;
    return acc;
  }, {});
  const pieData = Object.entries(categoryData).map(([name, value]) => ({ name, value }));

  const COLORS = ['#A78BFA', '#93C5FD', '#86EFAC', '#FCD34D', '#F472B6', '#34D399'];

  if (transactionsLoading || invoicesLoading || budgetsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <>
      <Sidebar currentPage="Finance" />
      
      <div style={{
        marginLeft: '260px',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #FAF5FF 0%, #F0FDF4 50%, #EFF6FF 100%)',
        padding: '32px 24px'
      }}>
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Finance Tracker</h1>
            <p className="text-gray-600 mt-1">Manage income, expenses, budgets & invoices</p>
          </div>
          <div className="flex gap-3 flex-wrap">
            <Button
              onClick={() => {
                setShowTransactionForm(!showTransactionForm);
                setShowInvoiceForm(false);
                setShowBudgetForm(false);
                setShowRecurringForm(false);
                setEditingTransaction(null);
              }}
              className="rounded-[14px] text-white"
              style={{ background: 'linear-gradient(135deg, #86EFAC 0%, #10B981 100%)' }}
            >
              <Plus className="w-5 h-5 mr-2" />
              Transaction
            </Button>
            <Button
              onClick={() => {
                setShowRecurringForm(!showRecurringForm);
                setShowTransactionForm(false);
                setShowInvoiceForm(false);
                setShowBudgetForm(false);
                setEditingRecurring(null);
                setActiveTab('recurring');
              }}
              className="rounded-[14px] text-white"
              style={{ background: 'linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%)' }}
            >
              <Repeat className="w-5 h-5 mr-2" />
              Recurring
            </Button>
            <Button
              onClick={() => {
                setShowBudgetForm(!showBudgetForm);
                setShowTransactionForm(false);
                setShowInvoiceForm(false);
                setShowRecurringForm(false);
                setEditingBudget(null);
                setActiveTab('budgets');
              }}
              className="rounded-[14px] text-white"
              style={{ background: 'linear-gradient(135deg, #FCD34D 0%, #F59E0B 100%)' }}
            >
              <Target className="w-5 h-5 mr-2" />
              Budget
            </Button>
            <Button
              onClick={() => {
                setShowInvoiceForm(!showInvoiceForm);
                setShowTransactionForm(false);
                setShowBudgetForm(false);
                setShowRecurringForm(false);
                setEditingInvoice(null);
                setActiveTab('invoices');
              }}
              className="rounded-[14px] text-white"
              style={{ background: 'linear-gradient(135deg, #93C5FD 0%, #3B82F6 100%)' }}
            >
              <FileText className="w-5 h-5 mr-2" />
              Invoice
            </Button>
          </div>
        </div>

        {/* Budget Alerts - Show on all tabs */}
        <BudgetAlerts 
          budgets={currentMonthBudgets}
          transactions={currentMonthTransactions}
          currency={user?.currency}
        />

        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview', icon: TrendingUp },
            { id: 'recurring', label: 'Recurring', icon: Repeat },
            { id: 'budgets', label: 'Budgets', icon: Target },
            { id: 'invoices', label: 'Invoices', icon: FileText }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-[14px] font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                style={activeTab === tab.id ? {
                  background: 'linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%)',
                  boxShadow: '0 4px 16px rgba(139, 92, 246, 0.3)'
                } : {}}
              >
                <Icon className="w-5 h-5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Forms */}
        <AnimatePresence>
          {showTransactionForm && (
            <TransactionForm
              transaction={editingTransaction}
              onSubmit={handleTransactionSubmit}
              onCancel={resetTransactionForm}
            />
          )}
          {showInvoiceForm && (
            <InvoiceForm
              invoice={editingInvoice}
              onSubmit={handleInvoiceSubmit}
              onCancel={resetInvoiceForm}
            />
          )}
          {showBudgetForm && (
            <BudgetForm
              budget={editingBudget}
              onSubmit={handleBudgetSubmit}
              onCancel={resetBudgetForm}
            />
          )}
          {showRecurringForm && (
            <RecurringTransactionForm
              transaction={editingRecurring}
              onSubmit={handleRecurringSubmit}
              onCancel={resetRecurringForm}
            />
          )}
        </AnimatePresence>

        {/* Content based on active tab */}
        {activeTab === 'overview' && (
          <>
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

            {/* AI Financial Forecast Section */}
            <div className="mb-8">
              <AIForecast transactions={transactions.filter(t => !t.is_template)} user={user} />
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
              currency={user?.currency}
            />
          </>
        )}

        {activeTab === 'recurring' && (
          <RecurringTransactionsList
            transactions={recurringTransactions}
            onEdit={handleEditRecurring}
            onDelete={(id) => deleteRecurringMutation.mutate(id)}
            onToggleActive={handleToggleRecurringActive}
            currency={user?.currency}
          />
        )}

        {activeTab === 'budgets' && (
          <>
            {/* Budget Overview Stats */}
            <BudgetOverview
              budgets={currentMonthBudgets}
              transactions={currentMonthTransactions}
              currency={user?.currency}
            />

            {/* Budget Progress */}
            <BudgetProgress
              budgets={currentMonthBudgets}
              transactions={currentMonthTransactions}
              currency={user?.currency}
              onEdit={handleEditBudget}
            />
          </>
        )}

        {activeTab === 'invoices' && (
          <>
            {/* Invoice Stats */}
            <div className="mb-8">
              <InvoiceStats invoices={invoices} currency={user?.currency} />
            </div>

            {/* Invoice List */}
            <InvoiceList
              invoices={invoices}
              onEdit={handleEditInvoice}
              onDelete={(id) => deleteInvoiceMutation.mutate(id)}
              onView={setViewingInvoice}
              onStatusChange={handleInvoiceStatusChange}
              currency={user?.currency}
            />
          </>
        )}

        {/* Invoice View Modal */}
        <AnimatePresence>
          {viewingInvoice && (
            <InvoiceView
              invoice={viewingInvoice}
              user={user}
              onClose={() => setViewingInvoice(null)}
            />
          )}
        </AnimatePresence>
      </div>
    </>
  );
}