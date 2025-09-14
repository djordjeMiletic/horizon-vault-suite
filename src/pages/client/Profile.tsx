import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { User, Mail, Phone, MapPin, Shield, Calendar, Save, Camera } from 'lucide-react';

const Profile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || 'Jennifer Lee',
    email: user?.email || 'client@client.com',
    phone: '+44 20 7946 0962',
    preferredContact: 'email',
    address: {
      street: '123 Main Street',
      city: 'London',
      postalCode: 'SW1A 1AA',
      country: 'United Kingdom'
    },
    timezone: 'Europe/London',
    notifications: {
      email: true,
      sms: false,
      push: true
    }
  });

  const handleSave = () => {
    // In a real app, this would save to backend
    setIsEditing(false);
    toast({
      title: "Profile updated",
      description: "Your profile information has been saved.",
    });
  };

  const handleCancel = () => {
    // Reset to original values
    setProfileData({
      name: user?.name || 'Jennifer Lee',
      email: user?.email || 'client@client.com',
      phone: '+44 20 7946 0962',
      preferredContact: 'email',
      address: {
        street: '123 Main Street',
        city: 'London',
        postalCode: 'SW1A 1AA',
        country: 'United Kingdom'
      },
      timezone: 'Europe/London',
      notifications: {
        email: true,
        sms: false,
        push: true
      }
    });
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Profile</h1>
        {!isEditing ? (
          <Button onClick={() => setIsEditing(true)}>
            <User className="mr-2 h-4 w-4" />
            Edit Profile
          </Button>
        ) : (
          <div className="space-x-2">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          </div>
        )}
      </div>

      <div className="grid gap-6">
        {/* Profile Header */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Avatar className="w-20 h-20">
                  <AvatarImage src={user?.avatar} alt={profileData.name} />
                  <AvatarFallback className="text-lg">
                    {profileData.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                {isEditing && (
                  <Button
                    size="icon"
                    variant="outline"
                    className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full"
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <div>
                <h2 className="text-2xl font-bold">{profileData.name}</h2>
                <p className="text-muted-foreground">{profileData.email}</p>
                <div className="flex items-center space-x-2 mt-2">
                  <Badge variant="secondary">Client</Badge>
                  <Badge variant="outline">
                    <Calendar className="mr-1 h-3 w-3" />
                    Member since Feb 2023
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Personal Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={profileData.name}
                  onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                  disabled={!isEditing}
                />
              </div>
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                  disabled={!isEditing}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                  disabled={!isEditing}
                />
              </div>
              <div>
                <Label htmlFor="contact-preference">Preferred Contact Method</Label>
                <Select
                  value={profileData.preferredContact}
                  onValueChange={(value) => setProfileData({...profileData, preferredContact: value})}
                  disabled={!isEditing}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="phone">Phone</SelectItem>
                    <SelectItem value="sms">SMS</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Address Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="h-5 w-5" />
              <span>Address</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="street">Street Address</Label>
              <Input
                id="street"
                value={profileData.address.street}
                onChange={(e) => setProfileData({
                  ...profileData,
                  address: {...profileData.address, street: e.target.value}
                })}
                disabled={!isEditing}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={profileData.address.city}
                  onChange={(e) => setProfileData({
                    ...profileData,
                    address: {...profileData.address, city: e.target.value}
                  })}
                  disabled={!isEditing}
                />
              </div>
              <div>
                <Label htmlFor="postalCode">Postal Code</Label>
                <Input
                  id="postalCode"
                  value={profileData.address.postalCode}
                  onChange={(e) => setProfileData({
                    ...profileData,
                    address: {...profileData.address, postalCode: e.target.value}
                  })}
                  disabled={!isEditing}
                />
              </div>
              <div>
                <Label htmlFor="country">Country</Label>
                <Select
                  value={profileData.address.country}
                  onValueChange={(value) => setProfileData({
                    ...profileData,
                    address: {...profileData.address, country: value}
                  })}
                  disabled={!isEditing}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                    <SelectItem value="Ireland">Ireland</SelectItem>
                    <SelectItem value="Germany">Germany</SelectItem>
                    <SelectItem value="France">France</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security & Privacy */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span>Security & Privacy</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium">Google Account</p>
                  <p className="text-sm text-muted-foreground">Connected for secure authentication</p>
                </div>
              </div>
              <Badge variant="outline" className="text-green-600 border-green-600">
                Connected
              </Badge>
            </div>

            <Separator />

            <div>
              <h4 className="font-medium mb-3">Two-Factor Authentication</h4>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">SMS Authentication</p>
                  <p className="text-sm text-muted-foreground">Receive verification codes via SMS</p>
                </div>
                <Badge variant="outline">
                  Disabled
                </Badge>
              </div>
            </div>

            <Separator />

            <div>
              <h4 className="font-medium mb-3">Data & Privacy</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>• Your data is encrypted and stored securely</p>
                <p>• We never share your information with third parties</p>
                <p>• You can request a copy of your data at any time</p>
                <Button variant="outline" size="sm" className="mt-3">
                  Download My Data
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;