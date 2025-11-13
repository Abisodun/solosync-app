import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, TrendingUp, TrendingDown, AlertCircle, Lightbulb, Target, DollarSign } from 'lucide-react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import ReactMarkdown from 'react-markdown';
import { format, addMonths, startOfMonth } from 'date-fns';
import { base44 } from '@/api/base44Client';
import { formatCurrency, getCurrencySymbol } from '@/utils/currency';

export default function AIForecast({ transactions, user }) {
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(false);

  const currency = user?.currency || 'USD';
  const symbol = getCurrencySymbol(currency);

  const generateForecast = async () => {
    setLoading(true);
    try {
      // Prepare historical data summary
      const monthlyData = {};
      transactions.forEach(t => {
        const month = format(new Date(t.date), 'yyyy-MM');
        if (!monthlyData[month]) {
          monthlyData[month] = { income: 0, expenses: 0, count: { income: 0, expenses: 0 } };
        }
        if (t.type === 'income') {
          monthlyData[month].income += t.amount;
          monthlyData[month].count.income++;
        } else {
          monthlyData[month].expenses += t.amount;
          monthlyData[month].count.expenses++;
        }
      });

      const months = Object.keys(monthlyData).sort().slice(-6);
      const recentData = months.map(m => ({
        month: format(new Date(m), 'MMM yyyy'),
        income: monthlyData[m].income,
        expenses: monthlyData[m].expenses,
        net: monthlyData[m].income - monthlyData[m].expenses
      }));

      const avgIncome = recentData.reduce((sum, m) => sum + m.income, 0) / recentData.length;
      const avgExpenses = recentData.reduce((sum, m) => sum + m.expenses, 0) / recentData.length;
      const avgNet = avgIncome - avgExpenses;

      // Get expense categories
      const expensesByCategory = {};
      transactions.filter(t => t.type === 'expense').forEach(t => {
        expensesByCategory[t.category] = (expensesByCategory[t.category] || 0) + t.amount;
      });

      const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
      const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

      // Prepare prompt for AI
      const prompt = `You are a financial advisor AI assistant. Analyze the following financial data and provide comprehensive forecasting and recommendations.

**Historical Financial Data (Last 6 Months):**
${recentData.map(m => `- ${m.month}: Income ${symbol}${m.income.toLocaleString()}, Expenses ${symbol}${m.expenses.toLocaleString()}, Net ${symbol}${m.net.toLocaleString()}`).join('\n')}

**Averages:**
- Average Monthly Income: ${symbol}${avgIncome.toLocaleString()}
- Average Monthly Expenses: ${symbol}${avgExpenses.toLocaleString()}
- Average Net Income: ${symbol}${avgNet.toLocaleString()}

**Total All-Time:**
- Total Income: ${symbol}${totalIncome.toLocaleString()}
- Total Expenses: ${symbol}${totalExpenses.toLocaleString()}

**Top Expense Categories:**
${Object.entries(expensesByCategory).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([cat, amt]) => `- ${cat}: ${symbol}${amt.toLocaleString()}`).join('\n')}

**User Profile:**
- Role: ${user?.role || 'freelancer'}
- Currency: ${currency}

Please provide:

1. **3-Month Income & Expense Forecast**: Predict income and expenses for the next 3 months. Format as:
   - Month 1: Income ${symbol}X, Expenses ${symbol}Y, Net ${symbol}Z
   - Month 2: Income ${symbol}X, Expenses ${symbol}Y, Net ${symbol}Z
   - Month 3: Income ${symbol}X, Expenses ${symbol}Y, Net ${symbol}Z

2. **Cash Flow Analysis**: Identify any potential shortages or concerning trends.

3. **Optimization Recommendations**: Provide 4-5 specific, actionable recommendations to:
   - Optimize savings
   - Reduce expenses
   - Increase income
   - Meet financial goals

Format your response in clear sections with headers. Be specific and data-driven.`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: prompt,
        add_context_from_internet: false
      });

      // Parse forecast numbers from the response
      const forecastData = [];
      const today = new Date();

      // Create 3-month forecast with predictions
      for (let i = 1; i <= 3; i++) {
        const futureMonth = addMonths(startOfMonth(today), i);
        // Use trend-adjusted predictions
        const trend = recentData.length >= 2 ?
          (recentData[recentData.length - 1].income - recentData[0].income) / recentData.length : 0;

        forecastData.push({
          month: format(futureMonth, 'MMM yyyy'),
          income: Math.round(avgIncome + (trend * i)),
          expenses: Math.round(avgExpenses * (1 + (i * 0.02))), // Slight expense increase
          net: Math.round((avgIncome + (trend * i)) - (avgExpenses * (1 + (i * 0.02)))),
          isForecast: true
        });
      }

      // Combine historical and forecast data
      const combinedData = [
        ...recentData.map(d => ({ ...d, isForecast: false })),
        ...forecastData
      ];

      setForecast({
        data: combinedData,
        analysis: result,
        avgIncome,
        avgExpenses,
        avgNet,
        potentialShortage: forecastData.some(m => m.net < 0)
      });
    } catch (error) {
      console.error('Error generating forecast:', error);
      setForecast({
        data: [],
        analysis: 'Unable to generate forecast. Please try again.',
        error: true
      });
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="p-6 rounded-[20px]" style={{
        background: 'linear-gradient(135deg, rgba(167, 139, 250, 0.1) 0%, rgba(139, 92, 246, 0.05) 100%)',
        boxShadow: '0 8px 32px rgba(167, 139, 250, 0.15)'
      }}>
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-[14px] flex items-center justify-center" style={{
              background: 'linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%)'
            }}>
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">AI Financial Forecast</h3>
              <p className="text-gray-600">
                Get AI-powered predictions, cash flow analysis, and personalized financial recommendations
              </p>
            </div>
          </div>
          <Button
            onClick={generateForecast}
            disabled={loading || transactions.length < 3}
            className="rounded-[14px] text-white"
            style={{ background: 'linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%)' }}
          >
            {loading ? 'Analyzing...' : 'Generate Forecast'}
          </Button>
        </div>

        {transactions.length < 3 && !forecast && (
          <div className="mt-4 p-4 bg-amber-50 rounded-[12px] border border-amber-200">
            <p className="text-sm text-amber-800">
              <AlertCircle className="inline w-4 h-4 mr-1" />
              Add at least 3 transactions to generate an accurate forecast
            </p>
          </div>
        )}
      </Card>

      {/* Forecast Results */}
      {forecast && !forecast.error && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Cash Flow Warning */}
          {forecast.potentialShortage && (
            <Card className="p-5 rounded-[16px] border-2 border-red-200" style={{ background: 'rgba(254, 242, 242, 0.5)' }}>
              <div className="flex items-start gap-3">
                <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-red-800 mb-1">⚠️ Potential Cash Flow Shortage Detected</h4>
                  <p className="text-sm text-red-700">
                    Our forecast predicts negative cash flow in upcoming months. Review recommendations below to optimize your finances.
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Forecast Chart */}
          <Card className="p-6 rounded-[20px]" style={{ background: 'rgba(255, 255, 255, 0.95)', boxShadow: '0 8px 32px rgba(167, 139, 250, 0.15)' }}>
            <h3 className="text-lg font-bold text-gray-800 mb-4">3-Month Financial Forecast</h3>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={forecast.data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="month" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    borderRadius: '12px',
                    border: '1px solid #E5E7EB',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Legend />
                <ReferenceLine x={forecast.data.findIndex(d => d.isForecast) - 0.5} stroke="#9CA3AF" strokeDasharray="5 5" label="Forecast Start" />
                <Line
                  type="monotone"
                  dataKey="income"
                  stroke="#86EFAC"
                  strokeWidth={3}
                  name="Income"
                  dot={{ fill: '#10B981', r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="expenses"
                  stroke="#FCA5A5"
                  strokeWidth={3}
                  name="Expenses"
                  dot={{ fill: '#EF4444', r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="net"
                  stroke="#A78BFA"
                  strokeWidth={3}
                  name="Net"
                  dot={{ fill: '#8B5CF6', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-5 rounded-[16px]" style={{ background: 'rgba(134, 239, 172, 0.1)' }}>
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <span className="text-sm text-gray-600">Avg Monthly Income</span>
              </div>
              <div className="text-2xl font-bold text-green-700">
                {formatCurrency(forecast.avgIncome, currency)}
              </div>
            </Card>

            <Card className="p-5 rounded-[16px]" style={{ background: 'rgba(252, 165, 165, 0.1)' }}>
              <div className="flex items-center gap-3 mb-2">
                <TrendingDown className="w-5 h-5 text-red-600" />
                <span className="text-sm text-gray-600">Avg Monthly Expenses</span>
              </div>
              <div className="text-2xl font-bold text-red-700">
                {formatCurrency(forecast.avgExpenses, currency)}
              </div>
            </Card>

            <Card className="p-5 rounded-[16px]" style={{
              background: forecast.avgNet >= 0 ? 'rgba(147, 197, 253, 0.1)' : 'rgba(252, 165, 165, 0.1)'
            }}>
              <div className="flex items-center gap-3 mb-2">
                <DollarSign className={`w-5 h-5 ${forecast.avgNet >= 0 ? 'text-blue-600' : 'text-red-600'}`} />
                <span className="text-sm text-gray-600">Avg Net Income</span>
              </div>
              <div className={`text-2xl font-bold ${forecast.avgNet >= 0 ? 'text-blue-700' : 'text-red-700'}`}>
                {formatCurrency(Math.abs(forecast.avgNet), currency)}
              </div>
            </Card>
          </div>

          {/* AI Analysis & Recommendations */}
          <Card className="p-6 rounded-[20px]" style={{ background: 'rgba(255, 255, 255, 0.95)', boxShadow: '0 8px 32px rgba(167, 139, 250, 0.15)' }}>
            <div className="flex items-center gap-3 mb-4">
              <Lightbulb className="w-6 h-6 text-amber-500" />
              <h3 className="text-xl font-bold text-gray-800">AI Insights & Recommendations</h3>
            </div>
            <div className="prose prose-sm prose-slate max-w-none">
              <ReactMarkdown
                className="text-gray-700 leading-relaxed"
                components={{
                  h1: ({children}) => <h3 className="text-lg font-bold text-gray-800 mt-6 mb-3">{children}</h3>,
                  h2: ({children}) => <h4 className="text-base font-semibold text-gray-800 mt-4 mb-2">{children}</h4>,
                  h3: ({children}) => <h5 className="text-sm font-semibold text-gray-700 mt-3 mb-2">{children}</h5>,
                  ul: ({children}) => <ul className="space-y-2 my-3">{children}</ul>,
                  li: ({children}) => (
                    <li className="flex items-start gap-2">
                      <span className="text-purple-600 mt-1">•</span>
                      <span className="flex-1">{children}</span>
                    </li>
                  ),
                  strong: ({children}) => <strong className="text-gray-800 font-semibold">{children}</strong>,
                }}
              >
                {forecast.analysis}
              </ReactMarkdown>
            </div>
          </Card>

          {/* Disclaimer */}
          <Card className="p-5 rounded-[16px] border-2 border-purple-100" style={{ background: 'rgba(243, 232, 255, 0.5)' }}>
            <p className="text-sm text-gray-700">
              <AlertCircle className="inline w-4 h-4 mr-1 text-purple-600" />
              <strong>Disclaimer:</strong> This forecast is generated by AI based on historical data and should be used as guidance only.
              Actual results may vary. Consult with a financial advisor for personalized advice.
            </p>
          </Card>
        </motion.div>
      )}
    </div>
  );
}