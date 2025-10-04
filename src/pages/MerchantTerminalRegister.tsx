import { MerchantRegister } from '@/components/merchant/MerchantRegister';

const MerchantTerminalRegister = () => {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">POS Register</h1>
        <p className="text-muted-foreground">Process in-store sales and transactions</p>
      </div>
      
      <MerchantRegister />
    </div>
  );
};

export default MerchantTerminalRegister;
