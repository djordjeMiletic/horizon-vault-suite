// Update this page (the content is just a fallback if you fail to update the page)

import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, TrendingUp, Users, FileText, ArrowRight } from 'lucide-react';

const Index = () => {
  const highlights = [
    {
      icon: TrendingUp,
      title: 'Commissions & Margins',
      description: 'Transparent commission structures with detailed margin tracking and performance-based bonuses.'
    },
    {
      icon: FileText,
      title: 'Client Documents',
      description: 'Streamlined document management with version control, e-signatures, and audit trails.'
    },
    {
      icon: Shield,
      title: 'Compliance Workflow',
      description: 'Automated compliance checking with real-time monitoring and regulatory reporting.'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Navigation */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-accent rounded-lg flex items-center justify-center">
                <span className="text-background font-bold text-sm">EH</span>
              </div>
              <span className="font-semibold text-lg">Event Horizon</span>
            </Link>
            
            <nav className="hidden md:flex items-center space-x-6">
              <Link to="/" className="text-primary font-medium">About</Link>
              <Link to="/products" className="text-muted-foreground hover:text-foreground">Products</Link>
              <Link to="/offices" className="text-muted-foreground hover:text-foreground">Offices</Link>
              <Link to="/contact" className="text-muted-foreground hover:text-foreground">Contact</Link>
            </nav>

            <Link to="/login">
              <Button variant="default">Portal Access</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Hero Section - 2 columns */}
          <div className="lg:col-span-2 space-y-8">
            <div className="text-center lg:text-left">
              <h1 className="text-5xl lg:text-6xl font-bold mb-6 bg-gradient-accent bg-clip-text text-transparent">
                Event Horizon Advice Group
              </h1>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl">
                Empowering financial advisors with cutting-edge technology and comprehensive 
                commission tracking. Navigate the future of financial advisory services with confidence.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/products">
                  <Button size="lg" className="w-full sm:w-auto">
                    Explore Products
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/contact">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto">
                    Get in Touch
                  </Button>
                </Link>
              </div>
            </div>

            {/* About Section */}
            <div className="grid md:grid-cols-3 gap-6">
              {highlights.map((highlight, index) => (
                <Card key={index} className="bg-card/80 backdrop-blur border-border/50 hover:bg-card/90 transition-all duration-300">
                  <CardHeader>
                    <highlight.icon className="h-8 w-8 text-primary mb-3" />
                    <CardTitle className="text-lg">{highlight.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-sm">
                      {highlight.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Sign In Panel - 1 column */}
          <div className="lg:col-span-1">
            <Card className="bg-card/90 backdrop-blur border-border/50 shadow-elegant">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Portal Access</CardTitle>
                <CardDescription>
                  Sign in as Advisor, Manager, Referral Partner, Administrator, or Client.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <Badge variant="secondary">Advisor</Badge>
                      <p className="text-xs text-muted-foreground mt-1">Full advisory portal</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <Badge variant="secondary">Manager</Badge>
                      <p className="text-xs text-muted-foreground mt-1">Management features</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <Badge variant="secondary">Administrator</Badge>
                      <p className="text-xs text-muted-foreground mt-1">Admin & compliance</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <Badge variant="secondary">Client</Badge>
                      <p className="text-xs text-muted-foreground mt-1">Client portal access</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Link to="/login" className="block">
                    <Button className="w-full" size="lg">
                      Sign In
                    </Button>
                  </Link>
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    disabled
                    title="Demo only"
                  >
                    Sign Up (Demo Only)
                  </Button>
                </div>

                <div className="text-center">
                  <p className="text-xs text-muted-foreground">
                    Secure access to your financial dashboard
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
