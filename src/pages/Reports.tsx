
import { MainLayout } from '@/components/layout/MainLayout';
import { BooksChart, CategoryChart } from '@/components/dashboard/Charts';
import { useBooks } from '@/hooks/useBooks';
import { useMembers } from '@/hooks/useMembers';
import { useTransactions } from '@/hooks/useTransactions';
import { Loader2, TrendingUp, Users, BookOpen, Crown } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Reports() {
    const { data: books = [], isLoading: booksLoading } = useBooks();
    const { data: members = [], isLoading: membersLoading } = useMembers();
    const { data: transactions = [], isLoading: transactionsLoading } = useTransactions();

    const isLoading = booksLoading || membersLoading || transactionsLoading;

    if (isLoading) {
        return (
            <MainLayout>
                <div className="flex items-center justify-center h-full">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            </MainLayout>
        );
    }

    // --- Data Aggregation ---

    // 1. Monthly Transactions (Reuse logic from Dashboard, maybe cleaner here)
    const monthlyCounts = transactions.reduce((acc, t) => {
        const date = new Date(t.type === 'issue' ? t.issue_date : (t.return_date || t.issue_date));
        const month = date.toLocaleString('default', { month: 'short' });

        if (!acc[month]) acc[month] = { month, issued: 0, returned: 0 };
        if (t.type === 'issue') acc[month].issued += 1;
        if (t.type === 'return') acc[month].returned += 1;
        return acc;
    }, {} as Record<string, { month: string; issued: number; returned: number }>);

    const monthsOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyData = Object.values(monthlyCounts).sort(
        (a, b) => monthsOrder.indexOf(a.month) - monthsOrder.indexOf(b.month)
    );

    // 2. Categories
    const categoryCounts = books.reduce((acc, book) => {
        acc[book.category] = (acc[book.category] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const categoryData = Object.entries(categoryCounts)
        .map(([cat, count]) => ({ category: cat, count }))
        .sort((a, b) => b.count - a.count); // Sort by count descending

    // 3. Top Active Members
    const memberTransactionCounts = transactions.reduce((acc, t) => {
        if (t.type === 'issue') { // Only count issues as "activity" or both? Let's count all interactions.
            acc[t.member_id] = (acc[t.member_id] || 0) + 1;
        }
        return acc;
    }, {} as Record<string, number>);

    const topMembers = Object.entries(memberTransactionCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([id, count]) => {
            const member = members.find(m => m.id === id);
            return {
                ...member,
                count
            };
        })
        .filter(m => m.id); // Filter out if member deleted

    // 4. Popular Books
    const bookIssueCounts = transactions.reduce((acc, t) => {
        if (t.type === 'issue') {
            acc[t.book_id] = (acc[t.book_id] || 0) + 1;
        }
        return acc;
    }, {} as Record<string, number>);

    const popularBooks = Object.entries(bookIssueCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([id, count]) => {
            const book = books.find(b => b.id === id);
            return {
                ...book,
                count
            };
        })
        .filter(b => b.id);

    return (
        <MainLayout>
            <div className="space-y-8">
                <div>
                    <h1 className="font-display text-3xl font-bold text-foreground">Analytics & Reports</h1>
                    <p className="text-muted-foreground mt-1">Detailed insights into library usage and trends.</p>
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    <BooksChart data={monthlyData} />
                    <CategoryChart data={categoryData} />
                </div>

                {/* Top Lists Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Top Members */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="glass-card p-6"
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <Users className="w-5 h-5 text-primary" />
                            </div>
                            <h3 className="text-lg font-semibold">Top Active Members</h3>
                        </div>
                        <div className="space-y-4">
                            {topMembers.map((member, index) => (
                                <div key={member.id || index} className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary/50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <span className={`text-sm font-bold w-6 h-6 flex items-center justify-center rounded-full ${index === 0 ? 'bg-yellow-500/20 text-yellow-500' : 'text-muted-foreground'}`}>
                                            {index + 1}
                                        </span>
                                        <div>
                                            <p className="font-medium">{member.name}</p>
                                            <p className="text-xs text-muted-foreground">{member.email}</p>
                                        </div>
                                    </div>
                                    <div className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                                        {member.count} transactions
                                    </div>
                                </div>
                            ))}
                            {topMembers.length === 0 && (
                                <p className="text-center text-muted-foreground py-4">No active members found.</p>
                            )}
                        </div>
                    </motion.div>

                    {/* Popular Books */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="glass-card p-6"
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-accent/10 rounded-lg">
                                <Crown className="w-5 h-5 text-accent" />
                            </div>
                            <h3 className="text-lg font-semibold">Most Popular Books</h3>
                        </div>
                        <div className="space-y-4">
                            {popularBooks.map((book, index) => (
                                <div key={book.id || index} className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary/50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <span className={`text-sm font-bold w-6 h-6 flex items-center justify-center rounded-full ${index === 0 ? 'bg-yellow-500/20 text-yellow-500' : 'text-muted-foreground'}`}>
                                            {index + 1}
                                        </span>
                                        <div>
                                            <p className="font-medium truncate max-w-[200px]">{book.title}</p>
                                            <p className="text-xs text-muted-foreground">{book.author}</p>
                                        </div>
                                    </div>
                                    <div className="px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-medium">
                                        {book.count} issues
                                    </div>
                                </div>
                            ))}
                            {popularBooks.length === 0 && (
                                <p className="text-center text-muted-foreground py-4">No data available.</p>
                            )}
                        </div>
                    </motion.div>
                </div>
            </div>
        </MainLayout>
    );
}
