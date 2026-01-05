import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export interface Book {
    id: string;
    title: string;
    author: string;
    isbn: string;
    category: string;
    quantity: number;
    available: number;
    cover_url: string;
    owner_id: string | null;
}

export const useBooks = () => {
    return useQuery({
        queryKey: ['books'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('books')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data as Book[];
        },
    });
};

export const useAddBook = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (newBook: Omit<Book, 'id' | 'available' | 'cover_url' | 'owner_id'> & { coverImage?: File }) => {
            let coverUrl = 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=200&h=300&fit=crop';

            // 1. Get Current User for owner_id
            const { data: { user }, error: userError } = await supabase.auth.getUser();
            if (userError || !user) throw new Error('You must be logged in to add a book.');

            if (newBook.coverImage) {
                const file = newBook.coverImage;
                const fileExt = file.name.split('.').pop();
                const fileName = `${Math.random()}.${fileExt}`;
                const filePath = `${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('book-covers')
                    .upload(filePath, file);

                if (uploadError) {
                    throw uploadError;
                }

                const { data: { publicUrl } } = supabase.storage
                    .from('book-covers')
                    .getPublicUrl(filePath);

                coverUrl = publicUrl;
            }

            const bookData = {
                title: newBook.title,
                author: newBook.author,
                isbn: newBook.isbn,
                category: newBook.category,
                quantity: newBook.quantity,
                available: newBook.quantity,
                cover_url: coverUrl,
                owner_id: user.id // Explicitly set owner_id
            };

            const { data, error } = await supabase
                .from('books')
                .insert([bookData])
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['books'] });
            toast.success('Book added successfully');
        },
        onError: (error: any) => {
            toast.error('Error adding book', { description: error.message });
        },
    });
};

export const useUpdateBook = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, updates, coverImage }: { id: string, updates: Partial<Omit<Book, 'id' | 'created_at' | 'owner_id'>>, coverImage?: File }) => {
            let coverUrl = updates.cover_url;

            if (coverImage) {
                const file = coverImage;
                const fileExt = file.name.split('.').pop();
                const fileName = `${Math.random()}.${fileExt}`;
                const filePath = `${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('book-covers')
                    .upload(filePath, file);

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage
                    .from('book-covers')
                    .getPublicUrl(filePath);

                coverUrl = publicUrl;
            }

            const activeUpdates = { ...updates };
            if (coverUrl) activeUpdates.cover_url = coverUrl;

            const { data, error } = await supabase
                .from('books')
                .update(activeUpdates)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['books'] });
            toast.success('Book updated successfully');
        },
        onError: (error: any) => {
            toast.error('Error updating book', { description: error.message });
        },
    });
};

export const useDeleteBook = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase
                .from('books')
                .delete()
                .eq('id', id);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['books'] });
            toast.success('Book deleted successfully');
        },
        onError: (error: any) => {
            toast.error('Error deleting book', { description: error.message });
        },
    });
};
