import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

interface PrivacyPolicyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PrivacyPolicyDialog({ open, onOpenChange }: PrivacyPolicyDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Privacy Policy</DialogTitle>
          <DialogDescription>
            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-6 text-sm">
            <section>
              <h3 className="text-base font-semibold mb-2">1. Introduction</h3>
              <p className="text-muted-foreground">
                Welcome to MyDresser. We respect your privacy and are committed to protecting your personal data. 
                This privacy policy explains how we collect, use, and safeguard your information when you use our 
                AI-powered fashion assistant platform.
              </p>
            </section>

            <Separator />

            <section>
              <h3 className="text-base font-semibold mb-2">2. Data We Collect</h3>
              <div className="space-y-3 text-muted-foreground">
                <div>
                  <h4 className="font-medium text-foreground mb-1">2.1 Account Information</h4>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Email address, full name, and profile information</li>
                    <li>Profile photos and avatar images</li>
                    <li>Authentication credentials (encrypted)</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium text-foreground mb-1">2.2 Wardrobe Data</h4>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Photos of clothing items you upload</li>
                    <li>Item descriptions, categories, and metadata</li>
                    <li>Outfit combinations and preferences</li>
                    <li>Wear frequency and laundry tracking data</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium text-foreground mb-1">2.3 Usage Data</h4>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Feature usage and interaction patterns</li>
                    <li>Style preferences and AI recommendations</li>
                    <li>Social interactions (posts, comments, reactions)</li>
                    <li>Marketplace transactions and reviews</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium text-foreground mb-1">2.4 Technical Data</h4>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Device information and browser type</li>
                    <li>IP address and location data (for weather-based suggestions)</li>
                    <li>Session information and analytics</li>
                  </ul>
                </div>
              </div>
            </section>

            <Separator />

            <section>
              <h3 className="text-base font-semibold mb-2">3. How We Use Your Data</h3>
              <div className="space-y-2 text-muted-foreground">
                <p>We use your personal data to:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Provide personalized outfit recommendations using AI</li>
                  <li>Enable wardrobe management and organization features</li>
                  <li>Facilitate marketplace transactions and social interactions</li>
                  <li>Improve our services through analytics and machine learning</li>
                  <li>Send important notifications about your account and features</li>
                  <li>Comply with legal obligations and prevent fraud</li>
                </ul>
              </div>
            </section>

            <Separator />

            <section>
              <h3 className="text-base font-semibold mb-2">4. Data Sharing and Disclosure</h3>
              <div className="space-y-2 text-muted-foreground">
                <p>We do not sell your personal data. We may share your information with:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li><strong>Other Users:</strong> Public profile information, posts, and marketplace listings (based on your privacy settings)</li>
                  <li><strong>Service Providers:</strong> Cloud hosting (Supabase), payment processors, and analytics tools</li>
                  <li><strong>Legal Requirements:</strong> When required by law or to protect our rights and users</li>
                  <li><strong>Business Transfers:</strong> In the event of a merger or acquisition</li>
                </ul>
              </div>
            </section>

            <Separator />

            <section>
              <h3 className="text-base font-semibold mb-2">5. Data Security</h3>
              <p className="text-muted-foreground">
                We implement industry-standard security measures to protect your data:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2 mt-2 text-muted-foreground">
                <li>End-to-end encryption for sensitive data</li>
                <li>Multi-factor authentication (MFA) support</li>
                <li>Regular security audits and monitoring</li>
                <li>Secure data storage with Supabase (SOC 2 Type II certified)</li>
                <li>Row-Level Security (RLS) policies for database access control</li>
              </ul>
            </section>

            <Separator />

            <section>
              <h3 className="text-base font-semibold mb-2">6. Your Privacy Rights (GDPR)</h3>
              <div className="space-y-2 text-muted-foreground">
                <p>Under GDPR and similar regulations, you have the right to:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li><strong>Access:</strong> Request a copy of your personal data</li>
                  <li><strong>Rectification:</strong> Correct inaccurate or incomplete data</li>
                  <li><strong>Erasure:</strong> Request deletion of your account and data</li>
                  <li><strong>Portability:</strong> Export your data in machine-readable formats</li>
                  <li><strong>Restriction:</strong> Limit how we process your data</li>
                  <li><strong>Objection:</strong> Opt-out of certain data processing activities</li>
                  <li><strong>Withdraw Consent:</strong> Revoke consent for data processing at any time</li>
                </ul>
                <p className="mt-3">
                  To exercise these rights, visit your Account Settings or contact us at privacy@mydresser.ai
                </p>
              </div>
            </section>

            <Separator />

            <section>
              <h3 className="text-base font-semibold mb-2">7. Data Retention</h3>
              <p className="text-muted-foreground">
                We retain your personal data as long as your account is active or as needed to provide services. 
                When you delete your account, we will permanently delete your data within 30 days, except where 
                we are required to retain it for legal or legitimate business purposes (e.g., transaction records 
                for accounting).
              </p>
            </section>

            <Separator />

            <section>
              <h3 className="text-base font-semibold mb-2">8. Cookies and Tracking</h3>
              <p className="text-muted-foreground">
                We use essential cookies for authentication and session management. We do not use third-party 
                advertising cookies. You can control cookie preferences in your browser settings.
              </p>
            </section>

            <Separator />

            <section>
              <h3 className="text-base font-semibold mb-2">9. Children's Privacy</h3>
              <p className="text-muted-foreground">
                MyDresser is not intended for users under 13 years of age. We do not knowingly collect personal 
                information from children under 13. If we become aware that we have collected such data, we will 
                delete it promptly.
              </p>
            </section>

            <Separator />

            <section>
              <h3 className="text-base font-semibold mb-2">10. International Data Transfers</h3>
              <p className="text-muted-foreground">
                Your data may be transferred to and processed in countries outside your residence. We ensure 
                appropriate safeguards are in place, including Standard Contractual Clauses approved by the 
                European Commission.
              </p>
            </section>

            <Separator />

            <section>
              <h3 className="text-base font-semibold mb-2">11. Changes to This Policy</h3>
              <p className="text-muted-foreground">
                We may update this privacy policy from time to time. We will notify you of significant changes 
                via email or in-app notification. Continued use of MyDresser after changes constitutes acceptance 
                of the updated policy.
              </p>
            </section>

            <Separator />

            <section>
              <h3 className="text-base font-semibold mb-2">12. Contact Us</h3>
              <div className="text-muted-foreground space-y-1">
                <p>If you have questions about this privacy policy or your data, contact us:</p>
                <p><strong>Email:</strong> privacy@mydresser.ai</p>
                <p><strong>Data Protection Officer:</strong> dpo@mydresser.ai</p>
                <p><strong>Address:</strong> MyDresser Inc., [Address to be added]</p>
              </div>
            </section>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
