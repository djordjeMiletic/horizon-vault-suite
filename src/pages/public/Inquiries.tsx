import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { inquiriesService } from '@/services/inquiries';
import { useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Mail, Phone, MessageSquare } from 'lucide-react';

const PublicInquiries = () => {
  const createInquiryMutation = useMutation({
    mutationFn: inquiriesService.create
  });

  const { toast } = useToast();
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;

    const newInquiry = {
      name: form.name,
      email: form.email,
      phone: form.phone,
      message: form.message,
      source: 'Website'
    };

    createInquiryMutation.mutate(newInquiry, {
      onSuccess: () => {
        setForm({ name: '', email: '', phone: '', message: '' });
        toast({
          title: "Thank you for your inquiry!",
          description: "We've received your message and will get back to you soon.",
        });
      },
      onError: () => {
        toast({
          title: "Error",
          description: "There was a problem submitting your inquiry. Please try again.",
          variant: "destructive"
        });
      }
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary text-primary-foreground py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
          <p className="text-xl opacity-90">
            We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </div>
      </div>

      {/* Contact Form Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-2">
          {/* Contact Information */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Get in Touch</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Email</p>
                    <p className="text-muted-foreground">contact@company.com</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Phone</p>
                    <p className="text-muted-foreground">+44 20 1234 5678</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Live Chat</p>
                    <p className="text-muted-foreground">Available Mon-Fri, 9am-5pm</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Office Hours</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Monday - Friday</span>
                    <span>9:00 AM - 5:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Saturday</span>
                    <span>10:00 AM - 2:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sunday</span>
                    <span>Closed</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <Card>
            <CardHeader>
              <CardTitle>Send us a Message</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={form.name}
                    onChange={(e) => setForm({...form, name: e.target.value})}
                    placeholder="Your full name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({...form, email: e.target.value})}
                    placeholder="your.email@example.com"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={form.phone}
                    onChange={(e) => setForm({...form, phone: e.target.value})}
                    placeholder="Your phone number"
                  />
                </div>
                <div>
                  <Label htmlFor="message">Message *</Label>
                  <Textarea
                    id="message"
                    value={form.message}
                    onChange={(e) => setForm({...form, message: e.target.value})}
                    placeholder="Tell us how we can help you..."
                    rows={5}
                    required
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={!form.name || !form.email || !form.message || createInquiryMutation.isPending}
                >
                  {createInquiryMutation.isPending ? 'Sending...' : 'Send Message'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PublicInquiries;