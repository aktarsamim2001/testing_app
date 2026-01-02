"use client";

import { useState } from 'react';
import { useRouter } from "next/navigation";
import { useAppDispatch, useLoadingStatus, useAuthError } from '@/hooks/useRedux';
import { loginUser } from '@/store/slices/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Eye, EyeOff, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';

const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export default function AdminAuth() {
  const dispatch = useAppDispatch();
  const loadingStatus = useLoadingStatus();
  const error = useAuthError();
  const { toast } = useToast();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();

    // Custom email validation
    if (!email) {
      toast({
        title: 'Email Required',
        description: 'Please enter your email address.',
        variant: 'destructive',
      });
      return;
    }
    // Simple email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        title: 'Invalid Email',
        description: 'Please enter a valid email address.',
        variant: 'destructive',
      });
      return;
    }

    // Password validation
    if (!password) {
      toast({
        title: 'Password Required',
        description: 'Please enter your password.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const result = await dispatch(
        loginUser({
          email,
          password,
          user_type: 'admin'
        })
      ).unwrap();

      if (result.token) {
        toast({
          title: 'Success!',
          description: 'Signed in successfully. Redirecting...',
          variant: 'success'
        });

        setTimeout(() => {
          router.push('/admin');
        }, 1000);
      } else {
        toast({
          title: 'Success!',
          description: result.message || 'Please check your email for verification',
          variant: 'success'
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
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">Admin Access</CardTitle>
                <CardDescription>Sign in to the admin panel</CardDescription>
              </div>
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

          <form onSubmit={handleSignIn} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@partnerscale.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
            </div>

            <Button type="submit" className="w-full" disabled={loadingStatus}>
              {loadingStatus ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          {/* <div className="mt-6 pt-6 border-t">
            <p className="text-sm text-muted-foreground text-center">
              Not an admin?{' '}
              <button
                onClick={() => router.push('/auth/user')}
                className="text-primary hover:underline font-medium"
              >
                Sign in as Brand or Creator
              </button>
            </p>
          </div> */}
        </CardContent>
      </Card>
    </div>
  );
}