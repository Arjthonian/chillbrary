import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Filter, ArrowRight, ArrowLeft, Clock, DollarSign, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useTransactions, useIssueBook, useReturnBook, Transaction } from '@/hooks/useTransactions';

const transactionTypes = ['All', 'issue', 'return'];
const statusTypes = ['All', 'active', 'returned', 'overdue'];

export default function Transactions() {
  const { data: transactions = [], isLoading } = useTransactions();
  const issueBookMutation = useIssueBook();
  const returnBookMutation = useReturnBook();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [isIssueDialogOpen, setIsIssueDialogOpen] = useState(false);

  const filteredTransactions = transactions.filter((tx) => {
    const bookTitle = tx.book_title || '';
    const memberName = tx.member_name || '';
    const bookIsbn = tx.book_isbn || '';

    const matchesSearch =
      bookTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      memberName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bookIsbn.includes(searchQuery);
    const matchesType = selectedType === 'All' || tx.type === selectedType;
    const matchesStatus = selectedStatus === 'All' || tx.status === selectedStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleIssueBook = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    // We need strict matching or better UI (Select/Combobox) for Book/Member selection.
    // The current UI relies on typing names. The hook I wrote expects exact/fuzzy match via API.

    issueBookMutation.mutate({
      bookTitle: formData.get('bookTitle') as string,
      bookIsbn: formData.get('bookIsbn') as string,
      memberName: formData.get('memberName') as string,
      memberEmail: formData.get('memberEmail') as string,
    }, {
      onSuccess: () => {
        setIsIssueDialogOpen(false);
      }
    });
  };

  const handleReturnBook = (id: string) => {
    returnBookMutation.mutate(id);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <Clock className="w-4 h-4 text-primary" />;
      case 'returned':
        return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      case 'overdue':
        return <AlertCircle className="w-4 h-4 text-destructive" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-primary/10 text-primary border-primary/20';
      case 'returned':
        return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'overdue':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      default:
        return '';
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">Transactions</h1>
            <p className="text-muted-foreground mt-1">Track book issues, returns, and fines</p>
          </div>
          <Dialog open={isIssueDialogOpen} onOpenChange={setIsIssueDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 glow-primary">
                <Plus className="w-4 h-4" />
                Issue Book
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle className="font-display">Issue a Book</DialogTitle>
                <DialogDescription>
                  Issue a book to a library member.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleIssueBook} className="space-y-4">
                <div className="grid gap-4">
                  <div>
                    <Label htmlFor="bookTitle">Book Title</Label>
                    <Input id="bookTitle" name="bookTitle" placeholder="Enter book title" required />
                  </div>
                  <div>
                    <Label htmlFor="bookIsbn">ISBN</Label>
                    <Input id="bookIsbn" name="bookIsbn" placeholder="978-XXXXXXXXXX" required />
                  </div>
                  <div>
                    <Label htmlFor="memberName">Member Name</Label>
                    <Input id="memberName" name="memberName" placeholder="Enter member name" required />
                  </div>
                  <div>
                    <Label htmlFor="memberEmail">Member Email</Label>
                    <Input id="memberEmail" name="memberEmail" type="email" placeholder="member@example.com" required />
                  </div>
                </div>
                <div className="flex justify-end gap-3">
                  <Button type="button" variant="outline" onClick={() => setIsIssueDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={issueBookMutation.isPending}>
                    {issueBookMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Issue Book
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <div className="glass-card p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by book, member, or ISBN..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-full sm:w-[140px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                {transactionTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type === 'All' ? 'All Types' : type.charAt(0).toUpperCase() + type.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-full sm:w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {statusTypes.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status === 'All' ? 'All Status' : status.charAt(0).toUpperCase() + status.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Transactions List */}
        <div className="space-y-4">
          {filteredTransactions.map((tx, index) => (
            <motion.div
              key={tx.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`glass-card p-6 border ${getStatusColor(tx.status)}`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl ${tx.type === 'issue' ? 'bg-primary/10' : 'bg-emerald-500/10'}`}>
                    {tx.type === 'issue' ? (
                      <ArrowRight className="w-5 h-5 text-primary" />
                    ) : (
                      <ArrowLeft className="w-5 h-5 text-emerald-500" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-display font-semibold text-foreground">{tx.book_title}</h3>
                    <p className="text-sm text-muted-foreground font-mono">{tx.book_isbn}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {tx.type === 'issue' ? 'Issued to' : 'Returned by'}: <span className="text-foreground">{tx.member_name}</span>
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                  <div className="text-sm">
                    <p className="text-muted-foreground">Issue Date</p>
                    <p className="font-medium text-foreground">{tx.issue_date}</p>
                  </div>
                  <div className="text-sm">
                    <p className="text-muted-foreground">Due Date</p>
                    <p className="font-medium text-foreground">{tx.due_date}</p>
                  </div>
                  {tx.return_date && (
                    <div className="text-sm">
                      <p className="text-muted-foreground">Return Date</p>
                      <p className="font-medium text-foreground">{tx.return_date}</p>
                    </div>
                  )}
                  {tx.fine && (
                    <div className="text-sm">
                      <p className="text-muted-foreground">Fine</p>
                      <p className="font-medium text-destructive flex items-center gap-1">
                        <DollarSign className="w-3 h-3" />
                        {tx.fine.toFixed(2)}
                      </p>
                    </div>
                  )}
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${getStatusColor(tx.status)}`}>
                    {getStatusIcon(tx.status)}
                    <span className="text-sm font-medium capitalize">{tx.status}</span>
                  </div>
                  {tx.status === 'active' && (
                    <Button size="sm" onClick={() => handleReturnBook(tx.id)}>
                      <ArrowLeft className="w-4 h-4 mr-1" />
                      Return
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredTransactions.length === 0 && (
          <div className="glass-card p-12 text-center">
            <h3 className="font-display text-xl font-semibold text-foreground">No transactions found</h3>
            <p className="text-muted-foreground mt-2">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
