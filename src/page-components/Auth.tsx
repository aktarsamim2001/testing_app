"use client";

import { useState, useEffect } from 'react';
import { useRouter } from "next/navigation";
import { useAppDispatch, useLoadingStatus, useAuthError, useIsAuthenticated } from '@/hooks/useRedux';
import { registerUser, loginUser } from '@/store/slices/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Building2, Video, Shield, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';

const signUpSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  user_type: z.enum(['brand', 'creator'], { required_error: 'Please select your role' }),
  companyName: z.string().optional(),
  phone: z.string().optional(),
  channelType: z.enum(['blogger', 'linkedin', 'youtube']).optional(),
  platformHandle: z.string().optional(),
});

const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
  user_type: z.enum(['admin', 'brand', 'creator'], { required_error: 'Please select your role' })
});

export default function Auth() {
  const dispatch = useAppDispatch();
  const loadingStatus = useLoadingStatus();
  const error = useAuthError();
  const isAuthenticated = useIsAuthenticated();
  const { toast } = useToast();
  const router = useRouter();

  const [isSignUp, setIsSignUp] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [userType, setUserType] = useState<'brand' | 'creator' | 'admin'>('brand');
  const [companyName, setCompanyName] = useState('');
  const [phone, setPhone] = useState('');
  const [channelType, setChannelType] = useState<'blogger' | 'linkedin' | 'youtube'>('blogger');
  const [platformHandle, setPlatformHandle] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const demoAccounts = [
    {
      type: 'Admin',
      icon: Shield,
      email: 'admin@partnerscale.com',
      password: '12345678',
      user_type: 'admin',
      description: 'Access admin panel for platform management'
    },

  ];

  const fillDemoCredentials = (email: string, password: string, type: 'admin' | 'brand' | 'creator') => {
    setEmail(email);
    setPassword(password);
    setUserType(type);
    setIsSignUp(false);
    toast({
      title: 'Demo credentials filled',
      description: 'Click Sign In to continue'
    });
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors({});
    
    try {
      signUpSchema.parse({ 
        fullName, 
        email, 
        password, 
        user_type: userType as 'brand' | 'creator',
        companyName: userType === 'brand' ? companyName : undefined,
        phone: userType === 'brand' ? phone : undefined,
        channelType: userType === 'creator' ? channelType : undefined,
        platformHandle: userType === 'creator' ? platformHandle : undefined,
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        const errors: Record<string, string> = {};
        err.errors.forEach((error) => {
          const path = error.path[0] as string;
          errors[path] = error.message;
        });
        setValidationErrors(errors);
        toast({
          title: 'Validation Error',
          description: err.errors[0].message,
          variant: 'destructive'
        });
        return;
      }
    }

    try {
      const result = await dispatch(
        registerUser({
          name: fullName,
          email,
          password,
          user_type: userType as 'brand' | 'creator',
          company_name: userType === 'brand' ? companyName : undefined,
          phone: userType === 'brand' ? phone : undefined,
          channel_type: userType === 'creator' ? channelType : undefined,
          platform_handle: userType === 'creator' ? platformHandle : undefined,
        })
      ).unwrap();
      
      // If we got a token, redirect to dashboard
      if (result.token) {
        toast({
          title: 'Success!',
          description: 'Account created successfully. Redirecting...'
        });

        // Redirect after successful signup
        setTimeout(() => {
          const redirectPath = userType === 'brand' ? '/brand' : '/creator';
          router.push(redirectPath);
        }, 1000);
      } else {
        // No token - user needs verification or other action
        toast({
          title: 'Success!',
          description: result.message || 'Please check your email for verification'
        });
      }
    } catch (err: any) {
      toast({
        title: 'Sign Up Failed',
        description: err || 'An error occurred during sign up',
        variant: 'destructive'
      });
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors({});
    
    try {
      signInSchema.parse({ 
        email, 
        password,
        user_type: userType as 'admin' | 'brand' | 'creator'
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        const errors: Record<string, string> = {};
        err.errors.forEach((error) => {
          const path = error.path[0] as string;
          errors[path] = error.message;
        });
        setValidationErrors(errors);
        toast({
          title: 'Validation Error',
          description: err.errors[0].message,
          variant: 'destructive'
        });
        return;
      }
    }

    try {
      const result = await dispatch(
        loginUser({
          email,
          password,
          user_type: userType as 'admin' | 'brand' | 'creator'
        })
      ).unwrap();

      // If we got a token, redirect to dashboard
      if (result.token) {
        toast({
          title: 'Success!',
          description: 'Signed in successfully. Redirecting...'
        });

        // Redirect after successful login
        setTimeout(() => {
          const redirectPath = userType === 'admin' ? '/admin' : userType === 'brand' ? '/brand' : '/creator';
          console.log("Redirecting to:", redirectPath);
          router.push(redirectPath);
        }, 1000);
      } else {
        // No token - user needs verification or other action
        toast({
          title: 'Success!',
          description: result.message || 'Please check your email for verification'
        });
      }
    } catch (err: any) {
      console.error("Login failed:", err);
      toast({
        title: 'Sign In Failed',
        description: err || 'Invalid email or password',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Welcome</CardTitle>
              <CardDescription>Sign in to access your account</CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/')}
              className="h-8 w-8 p-0"
              title="Back to Home"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert className="mb-4 border-red-500 bg-red-500/10">
              <AlertDescription className="text-red-500">{error}</AlertDescription>
            </Alert>
          )}

          <Tabs value={isSignUp ? 'signup' : 'signin'} onValueChange={(v) => setIsSignUp(v === 'signup')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin" className="space-y-4">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-role">Sign In As</Label>
                  <Select value={userType} onValueChange={(value: any) => setUserType(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="brand">Brand</SelectItem>
                      <SelectItem value="creator">Creator</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

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
                  {validationErrors.email && (
                    <p className="text-sm text-red-500">{validationErrors.email}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signin-password">Password</Label>
                  <div className="relative">
                    <Input
                      id="signin-password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {validationErrors.password && (
                    <p className="text-sm text-red-500">{validationErrors.password}</p>
                  )}
                </div>
                <Button type="submit" className="w-full" disabled={loadingStatus}>
                  {loadingStatus ? 'Signing in...' : 'Sign In'}
                </Button>
              </form>

              {/* Demo Accounts Section */}
              <div className="mt-6 pt-6 border-t space-y-4">
                <h3 className="text-sm font-semibold">Try Demo Accounts</h3>
                <div className="space-y-3">
                  {demoAccounts.map((account) => {
                    const Icon = account.icon;
                    return (
                      <Alert key={account.email} className="bg-muted/50">
                        <Icon className="h-4 w-4" />
                        <AlertDescription className="ml-6">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-sm">{account.type}</span>
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() => fillDemoCredentials(account.email, account.password, account.user_type)}
                              >
                                Use
                              </Button>
                            </div>
                            <p className="text-xs text-muted-foreground">{account.description}</p>
                            <div className="text-xs font-mono space-y-1">
                              <div className="bg-background rounded px-2 py-1 truncate">{account.email}</div>
                              <div className="bg-background rounded px-2 py-1">{account.password}</div>
                            </div>
                          </div>
                        </AlertDescription>
                      </Alert>
                    );
                  })}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="signup" className="space-y-4">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="role">I am a</Label>
                  <Select value={userType} onValueChange={(value: any) => setUserType(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="brand">Brand (SAAS Company)</SelectItem>
                      <SelectItem value="creator">Creator (Influencer/Partner)</SelectItem>
                    </SelectContent>
                  </Select>
                  {validationErrors.user_type && (
                    <p className="text-sm text-red-500">{validationErrors.user_type}</p>
                  )}
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
                  {validationErrors.fullName && (
                    <p className="text-sm text-red-500">{validationErrors.fullName}</p>
                  )}
                </div>

                {userType === 'brand' && (
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

                {userType === 'creator' && (
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
                  {validationErrors.email && (
                    <p className="text-sm text-red-500">{validationErrors.email}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <div className="relative">
                    <Input
                      id="signup-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="At least 8 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {validationErrors.password && (
                    <p className="text-sm text-red-500">{validationErrors.password}</p>
                  )}
                </div>
                <Button type="submit" className="w-full" disabled={loadingStatus}>
                  {loadingStatus ? 'Creating account...' : 'Create Account'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
