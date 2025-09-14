import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/lib/auth';

const Unauthorized = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <Card className="max-w-md w-full bg-card/80 backdrop-blur border-border/50">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <Shield className="h-8 w-8 text-destructive" />
          </div>
          <CardTitle className="text-2xl">Access Denied</CardTitle>
          <CardDescription>
            You don't have permission to access this page.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {user && (
            <div className="bg-muted/50 p-3 rounded-lg">
              <p className="text-sm">
                <span className="font-medium">Current Role:</span> {user.role}<br />
                <span className="font-medium">User:</span> {user.name}
              </p>
            </div>
          )}
          
          <p className="text-sm text-muted-foreground text-center">
            This section is restricted to specific user roles. Please contact your administrator 
            if you believe you should have access to this area.
          </p>
          
          <div className="flex flex-col space-y-2">
            <Button asChild>
              <Link to="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Return to Home
              </Link>
            </Button>
            
            {user && (
              <Button variant="outline" asChild>
                <Link to={
                  user.role === 'advisor' || user.role === 'manager' ? '/advisor/dashboard' :
                  user.role === 'referral' ? '/advisor/reports' :
                  user.role === 'admin' ? '/admin/compliance' :
                  user.role === 'client' ? '/client/cases' : '/'
                }>
                  Go to My Dashboard
                </Link>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Unauthorized;