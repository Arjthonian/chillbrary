
import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Loader2, Moon, Sun, User, Shield, Bell } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Settings() {
    const { theme, toggleTheme } = useTheme();
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);

    // Form definitions could be separate, but simple enough here
    const [email, setEmail] = useState(user?.email || '');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const updates: { email?: string; password?: string } = {};
            if (email !== user?.email) updates.email = email;
            if (password) {
                if (password !== confirmPassword) {
                    throw new Error("Passwords don't match");
                }
                updates.password = password;
            }

            if (Object.keys(updates).length === 0) {
                toast.info('No changes to update');
                return;
            }

            const { error } = await supabase.auth.updateUser(updates);

            if (error) throw error;

            toast.success('Profile updated successfully');
            setPassword('');
            setConfirmPassword('');
        } catch (error: any) {
            toast.error('Error updating profile', { description: error.message });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <MainLayout>
            <div className="space-y-6 max-w-4xl mx-auto">
                <div>
                    <h1 className="font-display text-3xl font-bold text-foreground">Settings</h1>
                    <p className="text-muted-foreground mt-1">Manage your preferences and account settings.</p>
                </div>

                {/* Appearance Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card p-6 space-y-6"
                >
                    <div className="flex items-center gap-3 border-b border-border pb-4">
                        <Sun className="w-5 h-5 text-primary" />
                        <h2 className="text-xl font-semibold">Appearance</h2>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <Label className="text-base">Dark Mode</Label>
                            <p className="text-sm text-muted-foreground">
                                Switch between light and dark themes.
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Sun className="w-4 h-4 text-muted-foreground" />
                            <Switch
                                checked={theme === 'dark'}
                                onCheckedChange={toggleTheme}
                            />
                            <Moon className="w-4 h-4 text-muted-foreground" />
                        </div>
                    </div>
                </motion.div>

                {/* Account Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="glass-card p-6 space-y-6"
                >
                    <div className="flex items-center gap-3 border-b border-border pb-4">
                        <User className="w-5 h-5 text-primary" />
                        <h2 className="text-xl font-semibold">Account</h2>
                    </div>

                    <form onSubmit={handleUpdateProfile} className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email Address</Label>
                            <Input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="password">New Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Leave blank to keep current"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="confirm-password">Confirm Password</Label>
                                <Input
                                    id="confirm-password"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Confirm new password"
                                />
                            </div>
                        </div>

                        <Button type="submit" disabled={isLoading} className="mt-4">
                            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Save Changes
                        </Button>
                    </form>
                </motion.div>

                {/* Notifications Section (Placeholder) */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="glass-card p-6 space-y-6 opacity-75"
                >
                    <div className="flex items-center gap-3 border-b border-border pb-4">
                        <Bell className="w-5 h-5 text-primary" />
                        <h2 className="text-xl font-semibold">Notifications</h2>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label>Email Notifications</Label>
                                <p className="text-sm text-muted-foreground">Receive updates about your account activity.</p>
                            </div>
                            <Switch disabled checked={true} />
                        </div>
                        <div className="p-3 bg-secondary/50 rounded-lg text-sm text-muted-foreground flex items-center gap-2">
                            <Shield className="w-4 h-4" />
                            <span>Notification settings are managed by your administrator.</span>
                        </div>
                    </div>
                </motion.div>

            </div>
        </MainLayout>
    );
}
