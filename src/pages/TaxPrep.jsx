
import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Download, Lightbulb, ArrowRight, ArrowLeft, Receipt, CircleDollarSign, CheckCircle2, Info, AlertTriangle, Sparkles, Calculator } from 'lucide-react';
import { format, parseISO, getYear } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import Sidebar from '../components/common/Sidebar';

export default function TaxPrep() {
  const [user, setUser] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear() - 1);
  const [deductionRecommendations, setDeductionRecommendations] = useState('');
  const [loadingDeductions, setLoadingDeductions] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    };
    loadUser();
  }, []);

  const { data: transactions = [] } = useQuery({
    queryKey: ['transactions', selectedYear],
    queryFn: () => base44.entities.Transaction.list('-date', 1000),
    enabled: !!user
  });

  const { data: invoices = [] } = useQuery({
    queryKey: ['invoices', selectedYear],
    queryFn: () => base44.entities.Invoice.list('-issue_date', 1000),
    enabled: !!user
  });

  const yearTransactions = transactions.filter(t => {
    const year = getYear(parseISO(t.date));
    return year === selectedYear;
  });

  const yearInvoices = invoices.filter(i => {
    const year = getYear(parseISO(i.issue_date));
    return year === selectedYear;
  });

  const generateDeductionTips = async () => {
    setLoadingDeductions(true);
    try {
      const expenseCategories = [...new Set(yearTransactions.filter(t => t.type === 'expense').map(t => t.category))];
      const totalExpenses = yearTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
      
      const prompt = `You are a tax preparation assistant (NOT a tax advisor). Based on the following information:
- User Role: ${user?.role || 'freelancer'}
- Country: ${user?.country || 'United States'}
- State/Province: ${user?.state_province || 'N/A'}
- Common Expense Categories: ${expenseCategories.join(', ') || 'No expenses recorded'}
- Total Expenses: ${user?.currency || '$'}${totalExpenses.toLocaleString()}

Provide 4-6 concise, common tax deduction categories that a ${user?.role || 'freelancer'} in ${user?.country || 'the US'} might consider for tax preparation.
Format as bullet points. Include a brief 1-sentence explanation for each.
Start with a clear disclaimer that this is general information only, not tax advice, and users should consult a tax professional.`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: prompt,
        add_context_from_internet: true
      });
      setDeductionRecommendations(result || "Unable to generate recommendations at this time.");
    } catch (error) {
      console.error("Error generating deduction recommendations:", error);
      setDeductionRecommendations("Failed to generate recommendations. Please try again later.");
    } finally {
      setLoadingDeductions(false);
    }
  };

  const convertToCsv = (data, filename) => {
    if (!data || data.length === 0) {
      alert("No data to export.");
      return;
    }
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(fieldName => JSON.stringify(row[fieldName] ?? '')).join(','))
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `${filename}-${selectedYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  const incomeTransactions = yearTransactions.filter(t => t.type === 'income');
  const expenseTransactions = yearTransactions.filter(t => t.type === 'expense');
  const totalIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = expenseTransactions.reduce((sum, t) => sum + t.amount, 0);

  const steps = [
    {
      title: "Tax Prep Overview",
      icon: FileText,
      component: () => (
        <>
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-6 py-3 rounded-[16px] mb-6" style={{
              background: 'linear-gradient(135deg, rgba(252, 211, 77, 0.2) 0%, rgba(245, 158, 11, 0.1) 100%)',
              boxShadow: '0 4px 16px rgba(245, 158, 11, 0.15)'
            }}>
              <Info className="w-5 h-5 text-amber-600" />
              <span className="text-sm font-semibold text-amber-900">Tax Year {selectedYear}</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-3">Tax Preparation Hub</h2>
            <p className="text-lg text-gray-600">Get organized for tax season with confidence</p>
          </div>

          <Card className="p-6 mb-6 rounded-[20px] border-2 border-red-100" style={{ background: 'rgba(254, 242, 242, 0.5)' }}>
            <div className="flex items-start gap-4">
              <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">⚠️ Important Disclaimer</h3>
                <p className="text-gray-700 leading-relaxed mb-3">
                  SoloSync provides tools to help you <strong className="text-purple-600">organize and prepare</strong> your tax information.
                  It does <strong className="text-red-600">NOT provide tax advice, legal advice, or file taxes on your behalf.</strong>
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Always consult a qualified tax professional</strong> for personalized advice specific to your situation.
                  Tax laws vary by jurisdiction and change frequently.
                </p>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="p-5 rounded-[16px]" style={{ background: 'rgba(134, 239, 172, 0.1)' }}>
              <div className="text-sm text-gray-600 mb-1">Total Income</div>
              <div className="text-2xl font-bold text-green-700">{user?.currency || '$'}{totalIncome.toLocaleString()}</div>
            </Card>
            <Card className="p-5 rounded-[16px]" style={{ background: 'rgba(252, 165, 165, 0.1)' }}>
              <div className="text-sm text-gray-600 mb-1">Total Expenses</div>
              <div className="text-2xl font-bold text-red-700">{user?.currency || '$'}{totalExpenses.toLocaleString()}</div>
            </Card>
            <Card className="p-5 rounded-[16px]" style={{ background: 'rgba(147, 197, 253, 0.1)' }}>
              <div className="text-sm text-gray-600 mb-1">Net Income</div>
              <div className="text-2xl font-bold text-blue-700">{user?.currency || '$'}{(totalIncome - totalExpenses).toLocaleString()}</div>
            </Card>
          </div>

          <Card className="p-5 rounded-[16px]" style={{ background: 'rgba(255, 255, 255, 0.95)' }}>
            <h4 className="font-semibold text-gray-800 mb-2">📍 Your Tax Profile</h4>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Country:</span>
                <span className="ml-2 font-medium text-gray-800">{user?.country || 'Not set'}</span>
              </div>
              <div>
                <span className="text-gray-500">State/Province:</span>
                <span className="ml-2 font-medium text-gray-800">{user?.state_province || 'Not set'}</span>
              </div>
              <div>
                <span className="text-gray-500">Currency:</span>
                <span className="ml-2 font-medium text-gray-800">{user?.currency || 'USD'}</span>
              </div>
            </div>
          </Card>
        </>
      )
    },
    {
      title: "Review Earnings",
      icon: CircleDollarSign,
      component: () => (
        <>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Review Your Income</h2>
          <p className="text-gray-600 mb-6">Carefully review all income transactions for {selectedYear}</p>
          
          <div className="mb-4 p-4 bg-blue-50 rounded-[12px] border border-blue-200">
            <p className="text-sm text-blue-800">
              <Info className="inline w-4 h-4 mr-1" />
              Ensure all income sources are recorded. Cross-reference with invoices and payment records.
            </p>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {incomeTransactions.length > 0 ? incomeTransactions.map(t => (
              <Card key={t.id} className="p-4 rounded-[14px]" style={{ background: 'rgba(255, 255, 255, 0.95)' }}>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="font-medium text-gray-800">{t.description}</div>
                    <div className="text-sm text-gray-500 mt-1">
                      {format(parseISO(t.date), 'MMM dd, yyyy')} • {t.category}
                      {t.client_name && ` • ${t.client_name}`}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-green-600 text-lg">+{user?.currency || '$'}{t.amount.toLocaleString()}</div>
                  </div>
                </div>
              </Card>
            )) : (
              <div className="text-center py-8 text-gray-500">No income recorded for {selectedYear}</div>
            )}
          </div>

          <Card className="mt-6 p-4 rounded-[14px]" style={{ background: 'linear-gradient(135deg, rgba(134, 239, 172, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%)' }}>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-gray-700">Total Income for {selectedYear}:</span>
              <span className="text-2xl font-bold text-green-700">{user?.currency || '$'}{totalIncome.toLocaleString()}</span>
            </div>
          </Card>
        </>
      )
    },
    {
      title: "Confirm Expenses",
      icon: Receipt,
      component: () => (
        <>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Confirm Your Expenses</h2>
          <p className="text-gray-600 mb-6">Verify and categorize all business expenses for {selectedYear}</p>

          <div className="mb-4 p-4 bg-amber-50 rounded-[12px] border border-amber-200">
            <p className="text-sm text-amber-800">
              <AlertTriangle className="inline w-4 h-4 mr-1" />
              Only include legitimate business expenses. Keep receipts and documentation for all deductions.
            </p>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {expenseTransactions.length > 0 ? expenseTransactions.map(t => (
              <Card key={t.id} className="p-4 rounded-[14px]" style={{ background: 'rgba(255, 255, 255, 0.95)' }}>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="font-medium text-gray-800">{t.description}</div>
                    <div className="text-sm text-gray-500 mt-1">
                      {format(parseISO(t.date), 'MMM dd, yyyy')} • {t.category}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-red-600 text-lg">-{user?.currency || '$'}{t.amount.toLocaleString()}</div>
                  </div>
                </div>
              </Card>
            )) : (
              <div className="text-center py-8 text-gray-500">No expenses recorded for {selectedYear}</div>
            )}
          </div>

          <Card className="mt-6 p-4 rounded-[14px]" style={{ background: 'linear-gradient(135deg, rgba(252, 165, 165, 0.1) 0%, rgba(239, 68, 68, 0.05) 100%)' }}>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-gray-700">Total Expenses for {selectedYear}:</span>
              <span className="text-2xl font-bold text-red-700">{user?.currency || '$'}{totalExpenses.toLocaleString()}</span>
            </div>
          </Card>
        </>
      )
    },
    {
      title: "Deduction Recommendations",
      icon: Lightbulb,
      component: () => (
        <>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Deduction Recommendations</h2>
          <p className="text-gray-600 mb-6">
            Common deductions for {user?.role || 'your role'} in {user?.country || 'your country'}
          </p>

          <Card className="p-6 mb-6 rounded-[20px]" style={{ background: 'rgba(255, 255, 255, 0.95)' }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-[14px] flex items-center justify-center" style={{
                background: 'linear-gradient(135deg, #FCD34D 0%, #F59E0B 100%)'
              }}>
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">AI-Powered Recommendations</h3>
            </div>
            
            <Button 
              onClick={generateDeductionTips} 
              disabled={loadingDeductions}
              className="rounded-[14px] mb-4"
              style={{ background: 'linear-gradient(135deg, #FCD34D 0%, #F59E0B 100%)' }}
            >
              {loadingDeductions ? 'Generating...' : 'Generate Recommendations'}
            </Button>

            {deductionRecommendations && (
              <div className="mt-4 prose prose-sm prose-slate max-w-none">
                <ReactMarkdown className="text-gray-700 leading-relaxed">{deductionRecommendations}</ReactMarkdown>
              </div>
            )}
          </Card>

          <Card className="p-5 rounded-[16px] border-2 border-purple-100" style={{ background: 'rgba(243, 232, 255, 0.5)' }}>
            <p className="text-sm text-gray-700">
              <Info className="inline w-4 h-4 mr-1 text-purple-600" />
              <strong>Remember:</strong> This information is for preparation purposes only. Consult a tax professional to determine which deductions apply to your specific situation.
            </p>
          </Card>
        </>
      )
    },
    {
      title: "Download Documents",
      icon: Download,
      component: () => (
        <>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Download Tax Documents</h2>
          <p className="text-gray-600 mb-6">Export your financial data for tax filing</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <Card className="p-6 rounded-[20px] text-center" style={{ background: 'rgba(255, 255, 255, 0.95)' }}>
              <Download className="w-12 h-12 mx-auto mb-3 text-purple-600" />
              <h4 className="font-bold text-gray-800 mb-2">All Transactions</h4>
              <p className="text-sm text-gray-600 mb-4">Complete record of income & expenses</p>
              <Button 
                onClick={() => convertToCsv(yearTransactions, 'solosync-transactions')}
                className="rounded-[12px]"
                style={{ background: 'linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%)' }}
              >
                Download CSV
              </Button>
            </Card>

            <Card className="p-6 rounded-[20px] text-center" style={{ background: 'rgba(255, 255, 255, 0.95)' }}>
              <Download className="w-12 h-12 mx-auto mb-3 text-blue-600" />
              <h4 className="font-bold text-gray-800 mb-2">Income Only</h4>
              <p className="text-sm text-gray-600 mb-4">All income transactions</p>
              <Button 
                onClick={() => convertToCsv(incomeTransactions, 'solosync-income')}
                className="rounded-[12px]"
                style={{ background: 'linear-gradient(135deg, #93C5FD 0%, #3B82F6 100%)' }}
              >
                Download CSV
              </Button>
            </Card>

            <Card className="p-6 rounded-[20px] text-center" style={{ background: 'rgba(255, 255, 255, 0.95)' }}>
              <Download className="w-12 h-12 mx-auto mb-3 text-red-600" />
              <h4 className="font-bold text-gray-800 mb-2">Expenses Only</h4>
              <p className="text-sm text-gray-600 mb-4">All expense transactions</p>
              <Button 
                onClick={() => convertToCsv(expenseTransactions, 'solosync-expenses')}
                className="rounded-[12px]"
                style={{ background: 'linear-gradient(135deg, #FCA5A5 0%, #EF4444 100%)' }}
              >
                Download CSV
              </Button>
            </Card>

            <Card className="p-6 rounded-[20px] text-center" style={{ background: 'rgba(255, 255, 255, 0.95)' }}>
              <FileText className="w-12 h-12 mx-auto mb-3 text-green-600" />
              <h4 className="font-bold text-gray-800 mb-2">Invoices</h4>
              <p className="text-sm text-gray-600 mb-4">All invoice records</p>
              <Button 
                onClick={() => convertToCsv(yearInvoices, 'solosync-invoices')}
                className="rounded-[12px]"
                style={{ background: 'linear-gradient(135deg, #86EFAC 0%, #10B981 100%)' }}
              >
                Download CSV
              </Button>
            </Card>
          </div>

          <Card className="p-5 rounded-[16px] border-2 border-amber-100" style={{ background: 'rgba(254, 243, 199, 0.5)' }}>
            <p className="text-gray-700 font-semibold mb-2">
              <Info className="inline w-5 h-5 mr-2 text-amber-600" />
              PDF Templates & Pre-formatted Forms Coming Soon!
            </p>
            <p className="text-sm text-gray-600">
              We're working on adding Schedule C, expense tracker templates, and automated annual summaries in PDF format.
            </p>
          </Card>
        </>
      )
    },
    {
      title: "Tax Readiness Checklist",
      icon: CheckCircle2,
      component: () => (
        <>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Tax Readiness Checklist</h2>
          <p className="text-lg text-gray-600 mb-6">Complete these steps before filing</p>

          <div className="space-y-3">
            {[
              { task: 'Gather all bank and credit card statements', detail: 'Compare with your recorded transactions' },
              { task: 'Organize physical and digital receipts', detail: 'Store receipts for major expenses' },
              { task: 'Review personal and business asset purchases', detail: 'Equipment, vehicles, property' },
              { task: 'Verify all income sources are recorded', detail: 'Check for missing payments or invoices' },
              { task: 'Categorize all expenses accurately', detail: 'Ensure proper tax categories' },
              { task: 'Calculate estimated tax payments', detail: 'If applicable for your jurisdiction' },
              { task: 'Review previous year\'s return', detail: 'Check for carryforward deductions' },
              { task: 'Consult with a tax professional', detail: 'Get personalized advice for your situation' }
            ].map((item, i) => (
              <Card key={i} className="p-4 rounded-[14px]" style={{ background: 'rgba(255, 255, 255, 0.95)' }}>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <div className="font-medium text-gray-800">{item.task}</div>
                    <div className="text-sm text-gray-500 mt-1">{item.detail}</div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <Card className="mt-6 p-6 rounded-[20px] text-center" style={{
            background: 'linear-gradient(135deg, rgba(167, 139, 250, 0.1) 0%, rgba(139, 92, 246, 0.05) 100%)'
          }}>
            <CheckCircle2 className="w-16 h-16 mx-auto mb-4 text-purple-600" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">You're Ready!</h3>
            <p className="text-gray-600 mb-4">
              You've reviewed your finances and downloaded your tax documents. Next step: consult a tax professional to file your return.
            </p>
            <p className="text-sm text-gray-500">
              🎉 Remember: SoloSync helps you prepare, but always work with a qualified tax professional for filing.
            </p>
          </Card>
        </>
      )
    }
  ];

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  const CurrentStepComponent = steps[currentStep].component;

  return (
    <>
      <Sidebar currentPage="TaxPrep" />
      
      <div style={{
        marginLeft: '260px',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #FAF5FF 0%, #F0FDF4 50%, #EFF6FF 100%)',
        padding: '32px 24px'
      }}>
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Tax Preparation Tools</h1>
            <p className="text-gray-600 mt-1">Organize your finances for tax season</p>
          </div>
          <Select value={String(selectedYear)} onValueChange={(value) => setSelectedYear(Number(value))}>
            <SelectTrigger className="w-[180px] rounded-[12px]">
              <SelectValue placeholder="Select Year" />
            </SelectTrigger>
            <SelectContent>
              {years.map(year => (
                <SelectItem key={year} value={String(year)}>Tax Year {year}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <Card className="p-4 rounded-[20px] sticky top-24" style={{ background: 'rgba(255, 255, 255, 0.95)' }}>
              <h3 className="font-bold text-gray-800 mb-4">Preparation Steps</h3>
              <nav className="space-y-2">
                {steps.map((step, index) => {
                  const Icon = step.icon;
                  return (
                    <Button
                      key={index}
                      variant="ghost"
                      onClick={() => setCurrentStep(index)}
                      className={`w-full justify-start rounded-[12px] text-left ${
                        currentStep === index 
                          ? 'bg-purple-100 text-purple-700 hover:bg-purple-200' 
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span className="text-sm">{step.title}</span>
                    </Button>
                  );
                })}
              </nav>
            </Card>
          </div>

          <div className="lg:col-span-3">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="p-8 rounded-[20px]" style={{ background: 'rgba(255, 255, 255, 0.95)' }}>
                <CurrentStepComponent />
                
                <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
                  {currentStep > 0 && (
                    <Button 
                      onClick={() => setCurrentStep(currentStep - 1)} 
                      variant="outline"
                      className="rounded-[12px]"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" /> Previous
                    </Button>
                  )}
                  {currentStep < steps.length - 1 && (
                    <Button 
                      onClick={() => setCurrentStep(currentStep + 1)} 
                      className="ml-auto rounded-[12px] text-white"
                      style={{ background: 'linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%)' }}
                    >
                      Next <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  )}
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
}
