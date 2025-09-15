import { useState } from 'react';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Chrome, Eye, EyeOff } from 'lucide-react';
import { useSession } from '@/state/SessionContext';
import { demoLogin } from '@/services/auth';
import type { UserSession } from '@/types/api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { user, setUser } = useSession();
  const navigate = useNavigate();
  const { toast } = useToast();

  const getDefaultRoute = (role: UserSession["role"]) => {
    switch (role) {
      case 'Advisor': return '/advisor/dashboard';
      case 'Manager': return '/manager/dashboard';
      case 'Administrator': return '/admin/dashboard';
      case 'Client': return '/client/dashboard';
      case 'ReferralPartner': return '/referral/dashboard';
      default: return '/';
    }
  };

  if (user) {
    const defaultRoute = getDefaultRoute(user.role);
    return <Navigate to={defaultRoute} replace />;
  }

  const demoAccounts = [
    { email: 'sarah.johnson@event-horizon.test', password: 'advisor', role: 'Advisor' as const, description: 'Full advisory portal access' },
    { email: 'manager@event-horizon.test', password: 'manager', role: 'Manager' as const, description: 'Advisory portal with management features' },
    { email: 'referral@event-horizon.test', password: 'referral', role: 'ReferralPartner' as const, description: 'Reports access only' },
    { email: 'admin@event-horizon.test', password: 'admin', role: 'Administrator' as const, description: 'Admin and HR portal access' },
    { email: 'client@event-horizon.test', password: 'client', role: 'Client' as const, description: 'Client portal with cases and documents' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    
    // Find matching demo account
    const account = demoAccounts.find(acc => acc.email === email && acc.password === password);
    if (!account) {
      toast({
        title: 'Login failed',
        description: 'Invalid credentials. Please try again.',
        variant: 'destructive'
      });
      return;
    }
    
    setIsLoading(true);
    try {
      const user = await demoLogin(account.email, account.role);
      setUser(user);
      toast({
        title: 'Login successful',
        description: `Welcome back, ${user.displayName || user.email}!`
      });
      navigate(getDefaultRoute(user.role));
    } catch (error) {
      toast({
        title: 'Login failed',
        description: 'Authentication failed. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      // Use first demo account for Google login
      const user = await demoLogin(demoAccounts[0].email, demoAccounts[0].role);
      setUser(user);
      toast({
        title: 'Login successful',
        description: `Welcome back, ${user.displayName || user.email}!`
      });
      navigate(getDefaultRoute(user.role));
    } catch (error) {
      toast({
        title: 'Login failed',
        description: 'Google SSO failed. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <Link to="/" className="inline-flex items-center space-x-2 mb-6">
            <div className="w-10 h-10 bg-gradient-accent rounded-lg flex items-center justify-center">
              <span className="text-background font-bold">EH</span>
            </div>
            <span className="text-2xl font-bold text-foreground">Event Horizon</span>
          </Link>
          <h1 className="text-3xl font-bold text-foreground">Portal Access</h1>
          <p className="text-muted-foreground mt-2">Sign in to access your dashboard</p>
        </div>

        <Card className="bg-card/80 backdrop-blur border-border/50">
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>Enter your credentials to continue</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            <Separator />

            <Button 
              variant="outline" 
              className="w-full" 
              onClick={handleGoogleLogin}
              disabled={isLoading}
            >
              <Chrome className="mr-2 h-4 w-4" />
              Sign in with Google (Demo)
            </Button>

            <Separator />

            <div>
              <p className="text-sm font-medium mb-3">Demo Accounts - Quick Login</p>
              <div className="space-y-2">
                {demoAccounts.map((account) => (
                  <div key={account.email} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                    <div>
                      <Badge variant="secondary" className="capitalize">{account.role}</Badge>
                      <p className="text-xs text-muted-foreground mt-1">{account.description}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleQuickLogin(account.email, account.password)}
                    >
                      Use
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-center pt-4">
              <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
                ← Back to Home
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;