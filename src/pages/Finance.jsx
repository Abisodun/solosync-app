
import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, DollarSign, TrendingUp, TrendingDown, FileText, AlertCircle, Edit2, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import AIForecast from '../components/finance/AIForecast';

export default function Finance() {
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [showInvoiceForm, setShowInvoiceForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [transactionData, setTransactionData] = useState({
    type: 'income',
    amount: '',
    description: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
    client_name: ''
  });
  const [user, setUser] = useState(null);

  const queryClient = useQueryClient();

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        console.error("Failed to load user:", error);
        // Handle error, e.g., redirect to login or show a message
      }
    };
    loadUser();
  }, []);

  const { data: transactions = [] } = useQuery({
    queryKey: ['transactions'],
    queryFn: () => base44.entities.Transaction.list('-date', 200)
  });

  const { data: invoices = [] } = useQuery({
    queryKey: ['invoices'],
    queryFn: () => base44.entities.Invoice.list('-issue_date', 100)
  });

  const createTransactionMutation = useMutation({
    mutationFn: (data) => base44.entities.Transaction.create({ ...data, amount: Number(data.amount) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      resetTransactionForm();
    }
  });

  const updateTransactionMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Transaction.update(id, { ...data, amount: Number(data.amount) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      resetTransactionForm();
    }
  });

  const deleteTransactionMutation = useMutation({
    mutationFn: (id) => base44.entities.Transaction.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['transactions'] })
  });

  const resetTransactionForm = () => {
    setTransactionData({ type: 'income', amount: '', description: '', category: '', date: new Date().toISOString().split('T')[0], client_name: '' });
    setEditingTransaction(null);
    setShowTransactionForm(false);
  };

  const handleTransactionSubmit = (e) => {
    e.preventDefault();
    if (editingTransaction) {
      updateTransactionMutation.mutate({ id: editingTransaction.id, data: transactionData });
    } else {
      createTransactionMutation.mutate(transactionData);
    }
  };

  const handleEditTransaction = (transaction) => {
    setEditingTransaction(transaction);
    setTransactionData({ ...transaction, date: transaction.date.split('T')[0] });
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

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Finance Tracker</h1>
          <p className="text-gray-600 mt-1">Manage income, expenses & invoices</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={() => setShowTransactionForm(!showTransactionForm)} className="rounded-[14px] text-white" style={{ background: 'linear-gradient(135deg, #86EFAC 0%, #10B981 100%)' }}>
            <Plus className="w-5 h-5 mr-2" />
            Transaction
          </Button>
          <Button onClick={() => setShowInvoiceForm(!showInvoiceForm)} className="rounded-[14px] text-white" style={{ background: 'linear-gradient(135deg, #93C5FD 0%, #3B82F6 100%)' }}>
            <FileText className="w-5 h-5 mr-2" />
            Invoice
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="p-6 rounded-[20px]" style={{ background: 'rgba(255, 255, 255, 0.95)', boxShadow: '0 8px 32px rgba(134, 239, 172, 0.15)' }}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-[14px] flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #86EFAC 0%, #10B981 100%)' }}>
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-800">${totalIncome.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Total Income</div>
            </div>
          </div>
        </Card>
        <Card className="p-6 rounded-[20px]" style={{ background: 'rgba(255, 255, 255, 0.95)', boxShadow: '0 8px 32px rgba(252, 165, 165, 0.15)' }}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-[14px] flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #FCA5A5 0%, #EF4444 100%)' }}>
              <TrendingDown className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-800">${totalExpenses.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Total Expenses</div>
            </div>
          </div>
        </Card>
        <Card className="p-6 rounded-[20px]" style={{ background: 'rgba(255, 255, 255, 0.95)', boxShadow: '0 8px 32px rgba(167, 139, 250, 0.15)' }}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-[14px] flex items-center justify-center" style={{ background: netProfit >= 0 ? 'linear-gradient(135deg, #86EFAC 0%, #10B981 100%)' : 'linear-gradient(135deg, #FCA5A5 0%, #EF4444 100%)' }}>
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className={`text-2xl font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>${Math.abs(netProfit).toLocaleString()}</div>
              <div className="text-sm text-gray-600">Net {netProfit >= 0 ? 'Profit' : 'Loss'}</div>
            </div>
          </div>
        </Card>
        <Card className="p-6 rounded-[20px]" style={{ background: 'rgba(255, 255, 255, 0.95)', boxShadow: '0 8px 32px rgba(252, 211, 77, 0.15)' }}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-[14px] flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #FCD34D 0%, #F59E0B 100%)' }}>
              <AlertCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-800">${unpaidAmount.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Unpaid Invoices</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Transaction Form */}
      <AnimatePresence>
        {showTransactionForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-8">
            <Card className="p-6 rounded-[20px]" style={{ background: 'rgba(255, 255, 255, 0.95)', boxShadow: '0 8px 32px rgba(167, 139, 250, 0.15)' }}>
              <h3 className="text-xl font-bold text-gray-800 mb-4">{editingTransaction ? 'Edit Transaction' : 'New Transaction'}</h3>
              <form onSubmit={handleTransactionSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Select value={transactionData.type} onValueChange={(value) => setTransactionData({ ...transactionData, type: value })}>
                    <SelectTrigger className="rounded-[12px]"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="income">Income</SelectItem>
                      <SelectItem value="expense">Expense</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input type="number" step="0.01" placeholder="Amount" value={transactionData.amount} onChange={(e) => setTransactionData({ ...transactionData, amount: e.target.value })} required className="rounded-[12px]" />
                </div>
                <Input placeholder="Description" value={transactionData.description} onChange={(e) => setTransactionData({ ...transactionData, description: e.target.value })} required className="rounded-[12px]" />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Input placeholder="Category" value={transactionData.category} onChange={(e) => setTransactionData({ ...transactionData, category: e.target.value })} required className="rounded-[12px]" />
                  <Input type="date" value={transactionData.date} onChange={(e) => setTransactionData({ ...transactionData, date: e.target.value })} required className="rounded-[12px]" />
                  <Input placeholder="Client/Vendor (optional)" value={transactionData.client_name} onChange={(e) => setTransactionData({ ...transactionData, client_name: e.target.value })} className="rounded-[12px]" />
                </div>
                <div className="flex gap-3 justify-end">
                  <Button type="button" variant="outline" onClick={resetTransactionForm} className="rounded-[12px]">Cancel</Button>
                  <Button type="submit" className="rounded-[12px] text-white" style={{ background: 'linear-gradient(135deg, #86EFAC 0%, #10B981 100%)' }}>
                    {editingTransaction ? 'Update' : 'Add'} Transaction
                  </Button>
                </div>
              </form>
            </Card>
          </motion.div>
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
              <Pie data={pieData} cx="50%" cy="50%" labelLine={false} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} outerRadius={100} fill="#8884d8" dataKey="value">
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
      <Card className="p-6 rounded-[20px]" style={{ background: 'rgba(255, 255, 255, 0.95)', boxShadow: '0 8px 32px rgba(167, 139, 250, 0.15)' }}>
        <h3 className="text-xl font-bold text-gray-800 mb-4">Recent Transactions</h3>
        <div className="space-y-3">
          {transactions.slice(0, 10).map((transaction) => (
            <div key={transaction.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-[14px]">
              <div className="flex items-center gap-4 flex-1">
                <div className={`w-10 h-10 rounded-[12px] flex items-center justify-center ${transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'}`}>
                  {transaction.type === 'income' ? (
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  ) : (
                    <TrendingDown className="w-5 h-5 text-red-600" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-800">{transaction.description}</div>
                  <div className="text-sm text-gray-500">{transaction.category} • {format(new Date(transaction.date), 'MMM d, yyyy')}</div>
                </div>
                <div className={`text-lg font-bold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                  {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toLocaleString()}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleEditTransaction(transaction)} className="p-2 hover:bg-gray-200 rounded-[10px]">
                    <Edit2 className="w-4 h-4 text-gray-600" />
                  </button>
                  <button onClick={() => deleteTransactionMutation.mutate(transaction.id)} className="p-2 hover:bg-gray-200 rounded-[10px]">
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
