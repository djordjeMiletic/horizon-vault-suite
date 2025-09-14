import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ArrowLeft, Shield, TrendingUp, Clock, Users, Heart, Umbrella, Star } from 'lucide-react';

import productsData from '@/mocks/seed/products.json';

const Products = () => {
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
              <Link to="/" className="text-muted-foreground hover:text-foreground">About</Link>
              <Link to="/products" className="text-primary font-medium">Products</Link>
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
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center space-x-2 mb-6">
            <Link to="/" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <span className="text-muted-foreground">/</span>
            <span className="text-foreground">Products</span>
          </div>

          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Our Product Portfolio</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Comprehensive life insurance solutions designed to protect what matters most to you and your family.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {productsData.map((product) => (
              <Card key={product.id} className="bg-card/80 backdrop-blur border-border/50 hover:bg-card/90 transition-all duration-300">
                <CardHeader className="p-5 md:p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Shield className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-xl">{product.name}</CardTitle>
                        <CardDescription className="text-sm text-muted-foreground mt-1">
                          {product.provider}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge variant="secondary">{product.type}</Badge>
                  </div>
                  <div className="flex space-x-2 mt-3">
                    <Badge variant="outline">Rate {(product.commissionRate * 100)}%</Badge>
                    <Badge variant="outline">Margin {(product.margin * 100)}%</Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-5 md:p-6 pt-0">
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {product.description}
                  </p>
                  
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center space-x-2 text-sm">
                      <Shield className="h-4 w-4 text-primary" />
                      <span>Commission Rate: {(product.commissionRate * 100)}%</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <TrendingUp className="h-4 w-4 text-primary" />
                      <span>Margin: {(product.margin * 100)}%</span>
                    </div>
                  </div>

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="secondary" className="w-full hover:bg-secondary/70">
                        Learn More
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg md:max-w-2xl w-[92vw] mx-auto p-4 md:p-6 lg:p-8 rounded-2xl shadow-2xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle className="flex items-center justify-between">
                          {product.name}
                          <Badge variant="secondary">{product.type}</Badge>
                        </DialogTitle>
                        <DialogDescription>
                          {product.provider} • Comprehensive Details
                        </DialogDescription>
                      </DialogHeader>
                      
                      <div className="space-y-6">
                        <div>
                          <h4 className="font-medium mb-2">Description</h4>
                          <p className="text-sm text-muted-foreground">{product.description}</p>
                        </div>

                        <div>
                          <h4 className="font-medium mb-3">Key Features</h4>
                          <ul className="space-y-2">
                            {product.features.map((feature, index) => (
                              <li key={index} className="flex items-start space-x-2 text-sm">
                                <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                                <span>{feature}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <Separator />

                        <div>
                          <h4 className="font-medium mb-3">Commission Structure</h4>
                          <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>APE Example:</span>
                              <span className="font-medium">£{product.commissionExample.ape.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Commission Rate:</span>
                              <span className="font-medium">{product.commissionExample.rate}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Commission Amount:</span>
                              <span className="font-medium text-primary">£{product.commissionExample.commission}</span>
                            </div>
                            <p className="text-xs text-muted-foreground pt-2">
                              {product.commissionExample.note}
                            </p>
                          </div>
                        </div>

                        {product.bands.length > 0 && (
                          <div>
                            <h4 className="font-medium mb-3">Performance Bands</h4>
                            <div className="space-y-2">
                              {product.bands.map((band, index) => (
                                <div key={index} className="flex justify-between text-sm bg-muted/30 p-2 rounded">
                                  <span>£{band.threshold.toLocaleString()}+ threshold</span>
                                  <span className="text-primary">+{(band.rateAdjustment * 100)}% rate bonus</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            ))}
          </div>

          
          {/* Additional Content Sections */}
          <div className="mt-16 space-y-12">
            {/* Key Benefits */}
            <section>
              <h2 className="text-3xl font-bold text-center mb-8">Key Benefits</h2>
              <div className="grid md:grid-cols-2 gap-6 md:gap-8">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Heart className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Comprehensive Coverage</h3>
                    <p className="text-sm text-muted-foreground">
                      Protect your family's financial future with extensive life insurance coverage tailored to your needs.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Competitive Returns</h3>
                    <p className="text-sm text-muted-foreground">
                      Benefit from industry-leading rates and performance-driven returns on your investment.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Umbrella className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Financial Security</h3>
                    <p className="text-sm text-muted-foreground">
                      Ensure long-term financial stability and peace of mind for you and your loved ones.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Star className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Expert Support</h3>
                    <p className="text-sm text-muted-foreground">
                      Access professional guidance from experienced financial advisors throughout your journey.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Who it's for */}
            <section>
              <h2 className="text-3xl font-bold text-center mb-8">Who Our Products Serve</h2>
              <div className="max-w-3xl mx-auto text-center">
                <p className="text-muted-foreground leading-relaxed">
                  Our life insurance solutions are designed for families seeking financial protection, 
                  small and medium enterprises looking to safeguard key personnel, and high-net-worth 
                  individuals requiring sophisticated wealth planning strategies. Whether you're a young 
                  professional starting your financial journey, a growing family with dependents, or 
                  approaching retirement with legacy planning needs, our comprehensive product range 
                  offers tailored solutions to meet your unique circumstances.
                </p>
              </div>
            </section>

            {/* Compliance Note */}
            <section>
              <div className="bg-accent-surface/20 border border-accent-surface/30 rounded-lg p-6 text-center">
                <p className="text-sm font-medium text-foreground">
                  Illustrative information only. Not financial advice.
                </p>
              </div>
            </section>

            {/* FAQ */}
            <section>
              <h2 className="text-3xl font-bold text-center mb-8">Frequently Asked Questions</h2>
              <div className="max-w-3xl mx-auto">
                <Accordion type="single" collapsible className="space-y-4">
                  <AccordionItem value="eligibility">
                    <AccordionTrigger>What are the eligibility requirements?</AccordionTrigger>
                    <AccordionContent>
                      <p className="text-muted-foreground">
                        Eligibility varies by product but generally includes age requirements (typically 18-75), 
                        health assessments, and residency status. Some products may require minimum premium 
                        levels or financial underwriting for larger coverage amounts.
                      </p>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="payouts">
                    <AccordionTrigger>How do payout timelines work?</AccordionTrigger>
                    <AccordionContent>
                      <p className="text-muted-foreground">
                        Standard claims are typically processed within 10-15 business days once all required 
                        documentation is received. Complex cases may take longer for thorough review. 
                        Emergency advances may be available in certain circumstances.
                      </p>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="fees">
                    <AccordionTrigger>What fees are involved?</AccordionTrigger>
                    <AccordionContent>
                      <p className="text-muted-foreground">
                        Our products feature transparent fee structures with no hidden charges. 
                        Management fees, policy fees, and surrender charges (where applicable) are clearly 
                        outlined in your product documentation. Many products offer fee waivers for 
                        long-term commitments.
                      </p>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="switching">
                    <AccordionTrigger>Can I switch between products?</AccordionTrigger>
                    <AccordionContent>
                      <p className="text-muted-foreground">
                        Yes, we offer flexible switching options between compatible products. 
                        Transfers may be subject to certain terms and conditions, and we recommend 
                        consulting with your advisor to ensure the switch aligns with your financial goals 
                        and circumstances.
                      </p>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Products;