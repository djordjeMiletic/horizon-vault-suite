import { useState } from 'react';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import { useAuth, getDefaultRoute } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Chrome, Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login, mockGoogleLogin, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  if (isAuthenticated) {
    return <Navigate to="/advisor/dashboard" replace />;
  }

  const demoAccounts = [
    { email: 'advisor@advisor.com', password: 'advisor', role: 'Advisor', description: 'Full advisory portal access' },
    { email: 'manager@manager.com', password: 'manager', role: 'Manager', description: 'Advisory portal with management features' },
    { email: 'referral@referral.com', password: 'referral', role: 'Referral Partner', description: 'Reports access only' },
    { email: 'admin@admin.com', password: 'admin', role: 'Administrator', description: 'Admin and HR portal access' },
    { email: 'client@client.com', password: 'client', role: 'Client', description: 'Client portal with cases and documents' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    
    setIsLoading(true);
    try {
      const user = await login(email, password);
      toast({
        title: 'Login successful',
        description: `Welcome back, ${user.name}!`
      });
      navigate(getDefaultRoute(user.role));
    } catch (error) {
      toast({
        title: 'Login failed',
        description: 'Invalid credentials. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      const user = await mockGoogleLogin();
      toast({
        title: 'Login successful',
        description: `Welcome back, ${user.name}!`
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