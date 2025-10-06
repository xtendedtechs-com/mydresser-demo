import { MerchantInventoryManager } from '@/components/merchant/MerchantInventoryManager';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

const MerchantTerminalInventory = () => {
  const handleLogout = async () => {
    await supabase.auth.signOut();
    // Optional: redirect to home/login handled by router guards
  };

  return (
    <div className="container mx-auto p-6">
      <header className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Merchant Inventory</h1>
        <Button variant="outline" onClick={handleLogout}>Logout</Button>
      </header>
      <main>
        <MerchantInventoryManager />
      </main>
    </div>
  );
};

export default MerchantTerminalInventory;
