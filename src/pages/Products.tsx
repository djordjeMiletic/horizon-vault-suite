import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Shield, TrendingUp, Clock } from 'lucide-react';

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
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl">{product.name}</CardTitle>
                      <CardDescription className="text-sm text-muted-foreground mt-1">
                        {product.provider}
                      </CardDescription>
                    </div>
                    <Badge variant="secondary">{product.type}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
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
                      <Button className="w-full">Learn More</Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
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

          <div className="text-center mt-12">
            <p className="text-muted-foreground mb-4">
              Ready to start offering these products to your clients?
            </p>
            <Link to="/login">
              <Button size="lg">Access Advisor Portal</Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Products;