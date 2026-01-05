
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export interface Transaction {
    id: string;
    book_id: string;
    member_id: string;
    type: 'issue' | 'return';
    issue_date: string;
    due_date: string;
    return_date?: string;
    status: 'active' | 'returned' | 'overdue';
    fine?: number;
    // Joined fields
    book_title?: string;
    book_isbn?: string;
    member_name?: string;
    member_email?: string;
}

export const useTransactions = () => {
    return useQuery({
        queryKey: ['transactions'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('transactions_view') // Use the view for easy access to joined data
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data as Transaction[];
        },
    });
};

export const useIssueBook = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ bookTitle, bookIsbn, memberName, memberEmail }: { bookTitle: string, bookIsbn: string, memberName: string, memberEmail: string }) => {

            // 1. Find Book ID
            const { data: books, error: bookError } = await supabase
                .from('books')
                .select('id, available')
                .ilike('title', bookTitle) // Basic fuzzy match or exact match
                .eq('isbn', bookIsbn)
                .limit(1);

            if (bookError || !books || books.length === 0) {
                throw new Error('Book not found. Please ensure exact Title and ISBN.');
            }
            const book = books[0];

            if (book.available <= 0) {
                throw new Error('Book is not available.');
            }

            // 2. Find Member ID
            const { data: members, error: memberError } = await supabase
                .from('members')
                .select('id')
                .ilike('name', memberName)
                .eq('email', memberEmail)
                .limit(1);

            if (memberError || !members || members.length === 0) {
                // Optionally create member if not exists? No, restrict to existing members.
                throw new Error('Member not found. Please ensure exact Name and Email.');
            }
            const member = members[0];

            // 3. Create Transaction
            const issueDate = new Date();
            const dueDate = new Date();
            dueDate.setDate(dueDate.getDate() + 14);

            const { data, error } = await supabase
                .from('transactions')
                .insert([{
                    book_id: book.id,
                    member_id: member.id,
                    type: 'issue',
                    issue_date: issueDate.toISOString().split('T')[0],
                    due_date: dueDate.toISOString().split('T')[0],
                    status: 'active'
                }])
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
            queryClient.invalidateQueries({ queryKey: ['books'] }); // Update availability
            toast.success('Book issued successfully');
        },
        onError: (error: any) => {
            toast.error('Error issuing book', { description: error.message });
        },
    });
};

// ... (existing imports)

export const useBorrowBook = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (bookId: string) => {
            // 1. Get Current User
            const { data: { user }, error: userError } = await supabase.auth.getUser();
            if (userError || !user) throw new Error('You must be logged in to borrow a book.');

            // 2. Get Member ID
            const { data: member, error: memberError } = await supabase
                .from('members')
                .select('id')
                .eq('user_id', user.id)
                .single();

            if (memberError || !member) throw new Error('Member profile not found.');

            // 3. Check Book Availability
            const { data: book, error: bookError } = await supabase
                .from('books')
                .select('available')
                .eq('id', bookId)
                .single();

            if (bookError || !book) throw new Error('Book not found.');
            if (book.available <= 0) throw new Error('Book is currently unavailable.');

            // 4. Create Transaction
            const issueDate = new Date();
            const dueDate = new Date();
            dueDate.setDate(dueDate.getDate() + 14);

            const { data, error } = await supabase
                .from('transactions')
                .insert([{
                    book_id: bookId,
                    member_id: member.id,
                    type: 'issue',
                    issue_date: issueDate.toISOString().split('T')[0],
                    due_date: dueDate.toISOString().split('T')[0],
                    status: 'active'
                }])
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
            queryClient.invalidateQueries({ queryKey: ['books'] });
            toast.success('Book borrowed successfully');
        },
        onError: (error: any) => {
            toast.error('Error borrowing book', { description: error.message });
        },
    });
};





export const useReturnBook = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            const returnDate = new Date().toISOString().split('T')[0];
            const { error } = await supabase
                .from('transactions')
                .update({
                    type: 'return',
                    status: 'returned',
                    return_date: returnDate
                })
                .eq('id', id);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
            queryClient.invalidateQueries({ queryKey: ['books'] });
            toast.success('Book returned successfully');
        },
        onError: (error: any) => {
            toast.error('Error returning book', { description: error.message });
        },
    });
};
