import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Shield, Building2, Eye, EyeOff, Lock } from 'lucide-react';
import { useMerchantProfile } from '@/hooks/useMerchantProfile';

interface MerchantProfileFormProps {
  onComplete?: () => void;
}

const MerchantProfileForm = ({ onComplete }: MerchantProfileFormProps) => {
  const {
    profile,
    sensitiveData,
    loading,
    createProfile,
    updateProfile,
    fetchSensitiveData,
    clearSensitiveData
  } = useMerchantProfile();

  const [formData, setFormData] = useState({
    business_name: profile?.business_name || '',
    business_type: profile?.business_type || '',
    tax_id: '',
    business_address: {
      street: '',
      city: '',
      state: '',
      zip: '',
      country: ''
    },
    contact_info: {
      email: '',
      phone: '',
      website: ''
    }
  });

  const [showSensitiveData, setShowSensitiveData] = useState(false);
  const [isEditing, setIsEditing] = useState(!profile);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddressChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      business_address: {
        ...prev.business_address,
        [field]: value
      }
    }));
  };

  const handleContactChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      contact_info: {
        ...prev.contact_info,
        [field]: value
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (profile) {
        await updateProfile(formData);
      } else {
        await createProfile(formData);
      }
      
      setIsEditing(false);
      onComplete?.();
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const handleViewSensitiveData = async () => {
    if (!showSensitiveData && !sensitiveData) {
      await fetchSensitiveData();
    }
    setShowSensitiveData(!showSensitiveData);
  };

  const businessTypes = [
    'Retail',
    'Boutique', 
    'Online Store',
    'Consignment',
    'Designer',
    'Brand',
    'Manufacturer',
    'Distributor',
    'Other'
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <Building2 className="h-8 w-8 text-primary" />
          <h2 className="text-2xl font-bold">
            {profile ? 'Merchant Profile' : 'Create Merchant Profile'}
          </h2>
        </div>
        <p className="text-muted-foreground">
          Secure business information with encrypted sensitive data
        </p>
      </div>

      {profile && (
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>Your sensitive business data is encrypted and secure.</span>
            <Badge variant={profile.verification_status === 'verified' ? 'default' : 'secondary'}>
              {profile.verification_status || 'pending'}
            </Badge>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>
              Public business information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="businessName">Business Name *</Label>
              <Input
                id="businessName"
                value={formData.business_name}
                onChange={(e) => handleInputChange('business_name', e.target.value)}
                placeholder="Enter your business name"
                disabled={!isEditing}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="businessType">Business Type</Label>
              <Select
                value={formData.business_type}
                onValueChange={(value) => handleInputChange('business_type', value)}
                disabled={!isEditing}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select business type" />
                </SelectTrigger>
                <SelectContent>
                  {businessTypes.map((type) => (
                    <SelectItem key={type} value={type.toLowerCase()}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {!isEditing && (
              <Button 
                variant="outline" 
                onClick={() => setIsEditing(true)}
                className="w-full"
              >
                Edit Profile
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Sensitive Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Sensitive Information
            </CardTitle>
            <CardDescription>
              Encrypted and secure business data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isEditing ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="taxId">Tax ID / EIN</Label>
                  <Input
                    id="taxId"
                    type="password"
                    value={formData.tax_id}
                    onChange={(e) => handleInputChange('tax_id', e.target.value)}
                    placeholder="Enter tax identification number"
                  />
                  <p className="text-xs text-muted-foreground">
                    This will be encrypted before storage
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Business Address</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      placeholder="Street"
                      value={formData.business_address.street}
                      onChange={(e) => handleAddressChange('street', e.target.value)}
                    />
                    <Input
                      placeholder="City"
                      value={formData.business_address.city}
                      onChange={(e) => handleAddressChange('city', e.target.value)}
                    />
                    <Input
                      placeholder="State"
                      value={formData.business_address.state}
                      onChange={(e) => handleAddressChange('state', e.target.value)}
                    />
                    <Input
                      placeholder="ZIP Code"
                      value={formData.business_address.zip}
                      onChange={(e) => handleAddressChange('zip', e.target.value)}
                    />
                  </div>
                  <Input
                    placeholder="Country"
                    value={formData.business_address.country}
                    onChange={(e) => handleAddressChange('country', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Contact Information</Label>
                  <Input
                    placeholder="Business Email"
                    type="email"
                    value={formData.contact_info.email}
                    onChange={(e) => handleContactChange('email', e.target.value)}
                  />
                  <Input
                    placeholder="Business Phone"
                    type="tel"
                    value={formData.contact_info.phone}
                    onChange={(e) => handleContactChange('phone', e.target.value)}
                  />
                  <Input
                    placeholder="Website"
                    type="url"
                    value={formData.contact_info.website}
                    onChange={(e) => handleContactChange('website', e.target.value)}
                  />
                </div>
              </>
            ) : (
              <div className="space-y-4">
                {profile && (
                  <Button 
                    variant="outline" 
                    onClick={handleViewSensitiveData}
                    className="w-full"
                    disabled={loading}
                  >
                    {loading ? (
                      'Loading...'
                    ) : (
                      <>
                        {showSensitiveData ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                        {showSensitiveData ? 'Hide' : 'View'} Sensitive Data
                      </>
                    )}
                  </Button>
                )}

                {showSensitiveData && sensitiveData && (
                  <div className="space-y-2 p-3 bg-muted rounded-lg">
                    <div>
                      <Label className="text-xs">Tax ID</Label>
                      <p className="text-sm font-mono">
                        {sensitiveData.tax_id ? '••••••••••••' + (sensitiveData.tax_id.slice(-4) || '') : 'Not provided'}
                      </p>
                    </div>
                    <div>
                      <Label className="text-xs">Business Address</Label>
                      <p className="text-sm">
                        {sensitiveData.business_address ? 
                          `${sensitiveData.business_address.street || ''} ${sensitiveData.business_address.city || ''}` :
                          'Not provided'
                        }
                      </p>
                    </div>
                    <div>
                      <Label className="text-xs">Contact Email</Label>
                      <p className="text-sm">
                        {sensitiveData.contact_info?.email || 'Not provided'}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        clearSensitiveData();
                        setShowSensitiveData(false);
                      }}
                      className="w-full mt-2"
                    >
                      Clear from memory
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {isEditing && (
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  All sensitive information (Tax ID, addresses, contact details) will be encrypted before storage.
                  Only you can decrypt and access this data.
                </AlertDescription>
              </Alert>
              
              <div className="flex gap-2">
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? 'Saving...' : profile ? 'Update Profile' : 'Create Profile'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsEditing(false)}
                  disabled={loading}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MerchantProfileForm;