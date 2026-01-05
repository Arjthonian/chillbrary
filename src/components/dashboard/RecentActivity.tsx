import { motion } from 'framer-motion';
import { BookOpen, UserPlus, ArrowLeftRight, AlertCircle } from 'lucide-react';
import { Transaction } from '@/hooks/useTransactions';
import { formatDistanceToNow } from 'date-fns';

interface RecentActivityProps {
  transactions: Transaction[];
}

export function RecentActivity({ transactions }: RecentActivityProps) {
  // Get latest 5 transactions
  const recentTransactions = transactions.slice(0, 5);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="glass-card p-6"
    >
      <h3 className="font-display font-semibold text-lg text-foreground mb-4">
        Recent Activity
      </h3>
      <div className="space-y-4">
        {recentTransactions.length === 0 ? (
          <p className="text-muted-foreground text-sm">No recent activity.</p>
        ) : (
          recentTransactions.map((tx, index) => (
            <motion.div
              key={tx.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
              className="flex items-start gap-4 p-3 rounded-xl hover:bg-secondary/50 transition-colors"
            >
              <div className={`p-2 rounded-lg bg-secondary ${tx.type === 'issue' ? 'text-primary' : 'text-emerald-500'}`}>
                {tx.type === 'issue' ? <ArrowLeftRight className="w-4 h-4" /> : <BookOpen className="w-4 h-4" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground">Book {tx.type === 'issue' ? 'Issued' : 'Returned'}</p>
                <p className="text-sm text-muted-foreground truncate">
                  "{tx.book_title}" {tx.type === 'issue' ? 'issued to' : 'returned by'} {tx.member_name}
                </p>
              </div>
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {/* fallback time if created_at is strictly needed but not in interface... using issue_date/return_date */}
                {tx.type === 'issue' ? tx.issue_date : (tx.return_date || tx.due_date)}
              </span>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
}
