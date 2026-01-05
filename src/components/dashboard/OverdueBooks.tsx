import { motion } from 'framer-motion';
import { Clock, AlertTriangle } from 'lucide-react';
import { Transaction } from '@/hooks/useTransactions';

interface OverdueBooksProps {
  transactions: Transaction[];
}

export function OverdueBooks({ transactions }: OverdueBooksProps) {
  // Filter for active books that are past due date
  const today = new Date().toISOString().split('T')[0];
  const overdueTransactions = transactions.filter(
    (tx) => tx.status === 'active' && tx.due_date < today
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="glass-card p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-semibold text-lg text-foreground flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-500" />
          Overdue Books
        </h3>
        <span className="text-sm text-muted-foreground">{overdueTransactions.length} items</span>
      </div>

      <div className="space-y-3">
        {overdueTransactions.length === 0 ? (
          <p className="text-muted-foreground text-sm">No overdue books.</p>
        ) : (
          overdueTransactions.map((tx, index) => {
            // Calculate days overdue
            const due = new Date(tx.due_date);
            const now = new Date();
            const diffTime = Math.abs(now.getTime() - due.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            // Simple fine calc: $0.50 per day
            const fine = diffDays * 0.50;

            return (
              <motion.div
                key={tx.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.6 + index * 0.1 }}
                className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium text-foreground">{tx.book_title}</h4>
                    {/* Author not available in current view, omitting or could fetch */}
                    <p className="text-sm text-muted-foreground mt-1">
                      Borrowed by: <span className="text-foreground">{tx.member_name}</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-amber-500">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm font-medium">{diffDays} days</span>
                    </div>
                    <p className="text-sm text-destructive font-medium mt-1">
                      Fine: ${fine.toFixed(2)}
                    </p>
                  </div>
                </div>
              </motion.div>
            )
          })
        )}
      </div>
    </motion.div>
  );
}
