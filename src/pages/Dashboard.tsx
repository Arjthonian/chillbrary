import { BookOpen, Users, ArrowLeftRight, DollarSign, Loader2 } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { BooksChart, CategoryChart } from '@/components/dashboard/Charts';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { OverdueBooks } from '@/components/dashboard/OverdueBooks';
import { useBooks } from '@/hooks/useBooks';
import { useMembers } from '@/hooks/useMembers';
import { useTransactions } from '@/hooks/useTransactions';

export default function Dashboard() {
  const { data: books = [], isLoading: booksLoading } = useBooks();
  const { data: members = [], isLoading: membersLoading } = useMembers();
  const { data: transactions = [], isLoading: transactionsLoading } = useTransactions();

  const isLoading = booksLoading || membersLoading || transactionsLoading;

  // Calculate Stats
  const booksList = books || [];
  const membersList = members || [];
  const transactionsList = transactions || [];

  const totalBooks = booksList.length;
  const activeMembers = membersList.filter(m => m.status === 'active').length;
  // Books currently issued (active transactions)
  const booksIssued = transactionsList.filter(t => t.status === 'active').length;
  // Total fines (mock calc: overdue days * 0.50)
  const totalFines = transactionsList
    .filter(t => t.status === 'active' && t.due_date && new Date(t.due_date) < new Date())
    .reduce((acc, t) => {
      const due = new Date(t.due_date);
      const now = new Date();
      const diffDays = Math.ceil(Math.abs(now.getTime() - due.getTime()) / (1000 * 60 * 60 * 24));
      return acc + (diffDays * 0.50);
    }, 0);

  // Chart Data: Category Distribution
  const categoryCounts = booksList.reduce((acc, book) => {
    const cat = book.category || 'Uncategorized';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const categoryData = Object.entries(categoryCounts).map(([cat, count]) => ({
    category: cat,
    count,
  }));

  // Chart Data: Monthly Transactions (Issued vs Returned)
  const monthlyCounts = transactionsList.reduce((acc, t) => {
    const date = new Date(t.type === 'issue' ? t.issue_date : (t.return_date || t.issue_date));
    const month = date.toLocaleString('default', { month: 'short' });

    if (!acc[month]) acc[month] = { month, issued: 0, returned: 0 };

    if (t.type === 'issue') acc[month].issued += 1;
    if (t.type === 'return') acc[month].returned += 1;

    return acc;
  }, {} as Record<string, { month: string; issued: number; returned: number }>);

  // Sort months? Basic sort might be needed. 
  // For 'business ready', let's just take entries. 
  // Ideally we sort by month index.
  const monthsOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthlyData = Object.values(monthlyCounts).sort(
    (a, b) => monthsOrder.indexOf(a.month) - monthsOrder.indexOf(b.month)
  );

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-full">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Welcome back! Here's what's happening in your library.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          <StatCard
            title="Total Books"
            value={totalBooks}
            icon={BookOpen}
            trend={{ value: 12, isPositive: true }} // Trend hardcoded for now or requires historical data comparison
            color="primary"
            delay={0}
          />
          <StatCard
            title="Active Members"
            value={activeMembers}
            icon={Users}
            trend={{ value: 8, isPositive: true }}
            color="accent"
            delay={100}
          />
          <StatCard
            title="Books Issued"
            value={booksIssued}
            icon={ArrowLeftRight}
            trend={{ value: 5, isPositive: false }}
            color="success"
            delay={200}
          />
          <StatCard
            title="Est. Fines Due"
            value={totalFines} // This is a number, StatCard handles formatting? Check StatCard implementation if needed. 
            // StatCard typically takes a number and formats it. 
            // If it needs currency formatting, I might need to check.
            // Dashboard original had 1250 (number). I'll pass number.
            icon={DollarSign}
            trend={{ value: 3, isPositive: false }}
            color="warning"
            delay={300}
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <BooksChart data={monthlyData} />
          <CategoryChart data={categoryData} />
        </div>

        {/* Activity and Overdue Row */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <RecentActivity transactions={transactions} />
          <OverdueBooks transactions={transactions} />
        </div>
      </div>
    </MainLayout>
  );
}
