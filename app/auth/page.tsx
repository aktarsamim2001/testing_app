"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Copy, Building2, Video, Shield } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import { z } from 'zod';


const signUpSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['brand', 'creator'], { required_error: 'Please select your role' }),
  companyName: z.string().optional(),
  phone: z.string().optional(),
  channelType: z.enum(['blogger', 'linkedin', 'youtube']).optional(),
  platformHandle: z.string().optional(),
});

const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
});

export default function Auth() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'brand' | 'creator'>('brand');
  const [companyName, setCompanyName] = useState('');
  const [phone, setPhone] = useState('');
  const [channelType, setChannelType] = useState<'blogger' | 'linkedin' | 'youtube'>('blogger');
  const [platformHandle, setPlatformHandle] = useState('');
  const [loading, setLoading] = useState(false);
  // const { signUp, signIn, user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const user = null; // TODO: Replace with actual user from useAuth

  const demoAccounts = [
    {
      type: 'Admin',
      icon: Shield,
      email: 'admin@partnerscale.com',
      password: 'AdminDemo123!',
      description: 'Access admin panel for platform management'
    },
    {
      type: 'Brand',
      icon: Building2,
      email: 'demo-brand@partnerscale.com',
      password: 'DemoBrand123!',
      description: 'Access brand dashboard to manage campaigns'
    },
    {
      type: 'Creator',
      icon: Video,
      email: 'demo-creator@partnerscale.com',
      password: 'DemoCreator123!',
      description: 'Access creator dashboard to view campaigns'
    }
  ];

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied!',
      description: `${label} copied to clipboard`
    });
  };

  const fillDemoCredentials = (email: string, password: string) => {
    setEmail(email);
    setPassword(password);
    toast({
      title: 'Demo credentials filled',
      description: 'Click Sign In to continue'
    });
  };

  const setupDemoAccounts = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual Supabase setup
      // const { data, error } = await supabase.functions.invoke('setup-demo-accounts', {
      //   body: {}
      // });

      // if (error) throw error;

      toast({
        title: 'Demo accounts created!',
        description: 'All demo accounts have been set up successfully. You can now sign in.'
      });
    } catch (error) {
      console.error('Setup error:', error);
      toast({
        title: 'Setup completed',
        description: 'Demo accounts are ready to use',
        variant: 'default'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      // Redirect based on user role
      const checkRoleAndRedirect = async () => {
        // TODO: Replace with actual Supabase query
        // const { data } = await supabase
        //   .from('user_roles')
        //   .select('role')
        //   .eq('user_id', user.id);
        
        // const roles = data?.map(r => r.role) || [];
        
        // if (roles.includes('admin')) {
        //   router.push('/admin');
        // } else if (roles.includes('brand')) {
        //   router.push('/brand');
        // } else if (roles.includes('creator')) {
        //   router.push('/creator');
        // } else {
        //   router.push('/');
        // }
      };
      
      checkRoleAndRedirect();
    }
  }, [user, router]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      signUpSchema.parse({ 
        fullName, 
        email, 
        password, 
        role,
        companyName: role === 'brand' ? companyName : undefined,
        phone: role === 'brand' ? phone : undefined,
        channelType: role === 'creator' ? channelType : undefined,
        platformHandle: role === 'creator' ? platformHandle : undefined,
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        toast({
          title: 'Validation Error',
          description: err.errors[0].message,
          variant: 'destructive'
        });
        return;
      }
    }

    setLoading(true);
    // TODO: Replace with actual signUp implementation
    // const { error } = await signUp({
    //   email,
    //   password,
    //   fullName,
    //   role,
    //   companyName: role === 'brand' ? companyName : undefined,
    //   phone: role === 'brand' ? phone : undefined,
    //   channelType: role === 'creator' ? channelType : undefined,
    //   platformHandle: role === 'creator' ? platformHandle : undefined,
    // });
    
    // if (error) {
    //   toast({
    //     title: 'Sign Up Failed',
    //     description: error.message,
    //     variant: 'destructive'
    //   });
    // } else {
    toast({
      title: 'Success!',
      description: 'Account created successfully. You can now sign in.'
    });
    setIsSignUp(false);
    // }
    setLoading(false);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      signInSchema.parse({ email, password });
    } catch (err) {
      if (err instanceof z.ZodError) {
        toast({
          title: 'Validation Error',
          description: err.errors[0].message,
          variant: 'destructive'
        });
        return;
      }
    }

    setLoading(true);
    // TODO: Replace with actual signIn implementation
    // const { error } = await signIn(email, password);
    
    // if (error) {
    //   toast({
    //     title: 'Sign In Failed',
    //     description: error.message,
    //     variant: 'destructive'
    //   });
    // }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Welcome</CardTitle>
          <CardDescription>Sign in to access your account</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={isSignUp ? 'signup' : 'signin'} onValueChange={(v) => setIsSignUp(v === 'signup')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">Email</Label>
                  <Input
                    id="signin-email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signin-password">Password</Label>
                  <Input
                    id="signin-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Signing in...' : 'Sign In'}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="role">I am a</Label>
                  <Select value={role} onValueChange={(value: 'brand' | 'creator') => setRole(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="brand">Brand (SAAS Company)</SelectItem>
                      <SelectItem value="creator">Creator (Influencer/Partner)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-name">Full Name</Label>
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>

                {role === 'brand' && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="companyName">Company Name</Label>
                      <Input
                        id="companyName"
                        placeholder="Acme Inc"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone (optional)</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+1 (555) 000-0000"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                    </div>
                  </>
                )}

                {role === 'creator' && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="channelType">Channel Type</Label>
                      <Select value={channelType} onValueChange={(value: any) => setChannelType(value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="blogger">Blogger</SelectItem>
                          <SelectItem value="linkedin">LinkedIn Influencer</SelectItem>
                          <SelectItem value="youtube">YouTuber</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="platformHandle">Platform Handle (optional)</Label>
                      <Input
                        id="platformHandle"
                        placeholder="@username"
                        value={platformHandle}
                        onChange={(e) => setPlatformHandle(e.target.value)}
                      />
                    </div>
                  </>
                )}

                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="At least 8 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Creating account...' : 'Create Account'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
