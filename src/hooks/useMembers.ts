import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export interface Member {
    id: string;
    name: string;
    email: string;
    phone: string;
    membership_type: 'student' | 'faculty' | 'general';
    status: 'active' | 'inactive';
    join_date: string;
    avatar_url: string;
    // books_issued is not in the table, we might need to count it or join it.
    // For now we will calculate it or add a column if needed. 
    // The SQL didn't have books_issued column, but we can count from transactions.
}

export const useMembers = () => {
    return useQuery({
        queryKey: ['members'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('members')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data as Member[];
        },
    });
};

export const useAddMember = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (newMember: Omit<Member, 'id' | 'status' | 'join_date' | 'avatar_url'>) => {
            const memberData = {
                ...newMember,
                status: 'active',
                join_date: new Date().toISOString().split('T')[0],
                avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
            };

            const { data, error } = await supabase
                .from('members')
                .insert([memberData])
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['members'] });
            toast.success('Member added successfully');
        },
        onError: (error: any) => {
            toast.error('Error adding member', { description: error.message });
        },
    });
};

export const useDeleteMember = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase
                .from('members')
                .delete()
                .eq('id', id);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['members'] });
            toast.success('Member deleted successfully');
        },
        onError: (error: any) => {
            toast.error('Error deleting member', { description: error.message });
        },
    });
};

export const useUpdateMemberStatus = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, status }: { id: string; status: 'active' | 'inactive' }) => {
            const { error } = await supabase
                .from('members')
                .update({ status })
                .eq('id', id);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['members'] });
            toast.success('Member status updated');
        },
        onError: (error: any) => {
            toast.error('Error updating status', { description: error.message });
        },
    });
};
