
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    CardFooter,
} from '@/components/ui/card';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, User, ShieldCheck } from 'lucide-react';

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
});

export default function Login() {
    const [isLoading, setIsLoading] = useState(false);
    const [loginType, setLoginType] = useState<'member' | 'admin'>('member');
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || '/dashboard';

    const form = useForm<z.infer<typeof loginSchema>>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: '',
            password: '',
        },
    });

    const onSubmit = async (values: z.infer<typeof loginSchema>) => {
        setIsLoading(true);
        try {
            const { data: authData, error } = await supabase.auth.signInWithPassword({
                email: values.email,
                password: values.password,
            });

            if (error) {
                throw error;
            }

            if (loginType === 'admin') {
                // Check if user is actually an admin
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', authData.user.id)
                    .single();

                if (!profile || profile.role !== 'admin') {
                    await supabase.auth.signOut();
                    throw new Error('Unauthorized access. Admin privileges required.');
                }
            }

            toast.success(`Logged in as ${loginType}`);
            navigate(from, { replace: true });
        } catch (error: any) {
            toast.error('Login failed', {
                description: error.message || 'Please check your credentials',
            });
            // Ensure signOut on failure if session started
            if (error.message.includes('Unauthorized')) {
                await supabase.auth.signOut();
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <Card className="w-full max-w-md border-primary/20 bg-card/50 backdrop-blur-sm">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold font-display text-center">Welcome back</CardTitle>
                    <CardDescription className="text-center">
                        Sign in to continue to Lumina Library
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="member" onValueChange={(v) => setLoginType(v as 'member' | 'admin')} className="w-full mb-6">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="member" className="flex items-center gap-2">
                                <User className="w-4 h-4" />
                                Member
                            </TabsTrigger>
                            <TabsTrigger value="admin" className="flex items-center gap-2">
                                <ShieldCheck className="w-4 h-4" />
                                Admin
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input placeholder="name@example.com" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Password</FormLabel>
                                        <FormControl>
                                            <Input type="password" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit" className="w-full glow-primary" disabled={isLoading}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Sign In as {loginType === 'admin' ? 'Admin' : 'Member'}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
                <CardFooter className="flex justify-center">
                    <p className="text-sm text-muted-foreground">
                        Don't have an account?{' '}
                        <Link to="/signup" className="text-primary hover:underline">
                            Sign up
                        </Link>
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
}
