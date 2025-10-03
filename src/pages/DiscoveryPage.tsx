import { EnhancedSearchDiscovery } from '@/components/EnhancedSearchDiscovery';
import { Card, CardContent } from '@/components/ui/card';
import { Compass } from 'lucide-react';

const DiscoveryPage = () => {
  const handleSearch = (query: string, filters: any) => {
    console.log('Search:', query, 'Filters:', filters);
    // Implement search logic here
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="px-4 py-6 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold fashion-text-gradient flex items-center justify-center gap-2">
            <Compass className="w-6 h-6" />
            DISCOVER
          </h1>
          <p className="text-muted-foreground">Find your perfect style match</p>
        </div>

        {/* Enhanced Search & Discovery */}
        <EnhancedSearchDiscovery onSearch={handleSearch} />

        {/* Featured Collections */}
        <Card>
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-4 text-foreground">Featured Collections</h3>
            <div className="grid grid-cols-2 gap-3">
              {['New Arrivals', 'Best Sellers', 'Seasonal Picks', 'Eco-Friendly'].map((collection) => (
                <div
                  key={collection}
                  className="aspect-square rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center text-center p-4 cursor-pointer hover:scale-105 transition-transform"
                >
                  <span className="font-medium">{collection}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DiscoveryPage;
