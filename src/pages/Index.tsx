// Update this page (the content is just a fallback if you fail to update the page)

import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Users, FileText, ArrowRight, Shield, BarChart3, Handshake } from 'lucide-react';
import heroImage from '@/assets/hero-advisory.jpg';

const Index = () => {
  const highlights = [
    {
      icon: BarChart3,
      title: 'Commissions & Margins',
      description: 'Transparent commission structures with detailed margin tracking and performance-based bonuses.'
    },
    {
      icon: FileText,
      title: 'Client Documents',
      description: 'Streamlined document management with version control, e-signatures, and audit trails.'
    },
    {
      icon: Handshake,
      title: 'Compliance Workflow',
      description: 'Automated compliance checking with real-time monitoring and regulatory reporting.'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <header className="border-b border-border bg-primary/95 backdrop-blur">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
                <span className="text-accent-foreground font-bold text-sm">EH</span>
              </div>
              <span className="font-semibold text-lg text-primary-foreground">Event Horizon</span>
            </Link>
            
            <nav className="hidden md:flex items-center space-x-6">
              <Link to="/" className="text-accent font-medium">About</Link>
              <Link to="/products" className="text-primary-foreground/80 hover:text-primary-foreground">Products</Link>
              <Link to="/offices" className="text-primary-foreground/80 hover:text-primary-foreground">Offices</Link>
              <Link to="/contact" className="text-primary-foreground/80 hover:text-primary-foreground">Contact</Link>
            </nav>

            <Link to="/login">
              <Button className="bg-accent hover:bg-accent/90 text-accent-foreground">Portal Access</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section with Background Image */}
      <section 
        className="relative min-h-[70vh] flex items-center justify-center bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${heroImage})`
        }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-hero"></div>
        
        {/* Content */}
        <div className="relative z-10 container max-w-5xl mx-auto px-6 text-center">
          <h1 className="text-2xl md:text-4xl font-bold mb-6 text-white">
            Event Horizon Advice Group
          </h1>
          <p className="text-base md:text-lg text-white/90 mb-8 max-w-3xl mx-auto">
            Empowering financial advisors with cutting-edge technology and comprehensive 
            commission tracking. Navigate the future of financial advisory services with confidence.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/products">
              <Button size="lg" className="w-full sm:w-auto bg-accent hover:bg-accent/90 text-accent-foreground">
                Explore Products
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link to="/contact">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                Get in Touch
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Highlights Section */}
      <main className="container max-w-5xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-3 gap-6 md:gap-8">
          {highlights.map((highlight, index) => (
            <Card key={index} className="bg-card border-border hover:shadow-card transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                  <highlight.icon className="h-6 w-6 text-accent" />
                </div>
                <CardTitle className="text-lg text-card-foreground">{highlight.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm text-muted-foreground">
                  {highlight.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Index;
