import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shirt, ShirtIcon, Watch, Crown, ShoppingBag, Settings, Plus } from 'lucide-react';
import { useWardrobe } from '@/hooks/useWardrobe';

interface WardrobeVectorProps {
  onAddItem?: () => void;
}

const WardrobeVector = ({ onAddItem }: WardrobeVectorProps) => {
  const { items, getItemsByCategory } = useWardrobe();

  const wardrobeLayout = {
    hangingRods: [
      { id: 'rod1', name: 'Main Hanging Rod', items: getItemsByCategory('Outerwear').concat(getItemsByCategory('Formal')) },
      { id: 'rod2', name: 'Secondary Rod', items: getItemsByCategory('Dresses') }
    ],
    shelves: [
      { id: 'shelf1', name: 'Folded Items - Top', items: getItemsByCategory('Tops') },
      { id: 'shelf2', name: 'Folded Items - Middle', items: getItemsByCategory('Bottoms') },
      { id: 'shelf3', name: 'Underwear & Sleepwear', items: getItemsByCategory('Underwear') }
    ],
    drawers: [
      { id: 'drawer1', name: 'Accessories Drawer', items: getItemsByCategory('Accessories') },
      { id: 'drawer2', name: 'Activewear Drawer', items: getItemsByCategory('Activewear') }
    ],
    shoeRack: {
      id: 'shoes',
      name: 'Shoe Rack',
      items: getItemsByCategory('Shoes')
    }
  };

  const getItemIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'tops':
      case 'outerwear':
      case 'formal':
        return <Shirt className="w-3 h-3" />;
      case 'bottoms':
        return <ShirtIcon className="w-3 h-3" />;
      case 'accessories':
        return <Watch className="w-3 h-3" />;
      case 'shoes':
        return <Crown className="w-3 h-3" />;
      default:
        return <ShoppingBag className="w-3 h-3" />;
    }
  };

  const getItemColor = (category: string) => {
    const colors = {
      'tops': 'bg-blue-100 border-blue-200',
      'bottoms': 'bg-green-100 border-green-200',
      'outerwear': 'bg-purple-100 border-purple-200',
      'dresses': 'bg-pink-100 border-pink-200',
      'shoes': 'bg-yellow-100 border-yellow-200',
      'accessories': 'bg-red-100 border-red-200',
      'activewear': 'bg-orange-100 border-orange-200',
      'underwear': 'bg-gray-100 border-gray-200',
      'formal': 'bg-indigo-100 border-indigo-200'
    };
    return colors[category.toLowerCase() as keyof typeof colors] || 'bg-gray-100 border-gray-200';
  };

  return (
    <div className="space-y-6">
      {/* Wardrobe Header */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/60 rounded-lg flex items-center justify-center">
                <Shirt className="w-4 h-4 text-white" />
              </div>
              My Digital Wardrobe
            </CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Configure
              </Button>
              <Button size="sm" onClick={onAddItem}>
                <Plus className="w-4 h-4 mr-2" />
                Add Item
              </Button>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Total items: {items.length} • Last updated: Today
          </p>
        </CardHeader>
      </Card>

      {/* 3D Wardrobe Visualization */}
      <Card>
        <CardContent className="p-6">
          <div className="wardrobe-container">
            {/* Wardrobe Frame */}
            <div className="relative bg-gradient-to-b from-gray-50 to-gray-100 border-2 border-gray-200 rounded-2xl p-6 min-h-[500px]">
              
              {/* Top Hanging Rod Section */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-2 bg-gray-400 rounded-full flex-1"></div>
                  <Badge variant="outline" className="text-xs">Hanging Rod</Badge>
                </div>
                <div className="grid grid-cols-8 gap-2 min-h-[100px] bg-white/50 rounded-lg p-3 border border-gray-200">
                  {wardrobeLayout.hangingRods.flatMap(rod => rod.items).slice(0, 8).map((item, index) => (
                    <div
                      key={item.id}
                      className={`${getItemColor(item.category)} rounded-lg p-2 border flex flex-col items-center justify-center cursor-pointer hover:shadow-md transition-all group relative`}
                      title={item.name}
                    >
                      {getItemIcon(item.category)}
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <div className="mt-1 text-[10px] text-center font-medium text-gray-600 truncate w-full">
                        {item.name.substring(0, 6)}...
                      </div>
                    </div>
                  ))}
                  {/* Empty slots */}
                  {Array.from({ length: Math.max(0, 8 - wardrobeLayout.hangingRods.flatMap(rod => rod.items).length) }).map((_, index) => (
                    <div
                      key={`empty-hanging-${index}`}
                      className="border-2 border-dashed border-gray-300 rounded-lg p-2 flex items-center justify-center cursor-pointer hover:border-primary/50 transition-colors"
                      onClick={onAddItem}
                    >
                      <Plus className="w-4 h-4 text-gray-400" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Middle Shelves Section */}
              <div className="mb-6">
                <div className="space-y-3">
                  {wardrobeLayout.shelves.map((shelf, shelfIndex) => (
                    <div key={shelf.id}>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="h-1 bg-gray-300 rounded-full flex-1"></div>
                        <Badge variant="outline" className="text-xs">{shelf.name}</Badge>
                      </div>
                      <div className="grid grid-cols-6 gap-2 min-h-[60px] bg-white/50 rounded-lg p-2 border border-gray-200">
                        {shelf.items.slice(0, 6).map((item) => (
                          <div
                            key={item.id}
                            className={`${getItemColor(item.category)} rounded-md p-1.5 border flex flex-col items-center justify-center cursor-pointer hover:shadow-sm transition-all group relative`}
                            title={item.name}
                          >
                            {getItemIcon(item.category)}
                            <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div className="mt-0.5 text-[8px] text-center font-medium text-gray-600 truncate w-full">
                              {item.name.substring(0, 4)}
                            </div>
                          </div>
                        ))}
                        {/* Empty slots */}
                        {Array.from({ length: Math.max(0, 6 - shelf.items.length) }).map((_, index) => (
                          <div
                            key={`empty-shelf-${shelfIndex}-${index}`}
                            className="border-2 border-dashed border-gray-300 rounded-md p-1.5 flex items-center justify-center cursor-pointer hover:border-primary/50 transition-colors"
                            onClick={onAddItem}
                          >
                            <Plus className="w-3 h-3 text-gray-400" />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Drawers & Shoe Rack */}
              <div className="grid grid-cols-2 gap-4">
                {/* Drawers */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="text-xs">Drawers</Badge>
                  </div>
                  <div className="space-y-2">
                    {wardrobeLayout.drawers.map((drawer) => (
                      <div key={drawer.id} className="bg-white/50 rounded-lg p-2 border border-gray-200">
                        <div className="grid grid-cols-4 gap-1">
                          {drawer.items.slice(0, 4).map((item) => (
                            <div
                              key={item.id}
                              className={`${getItemColor(item.category)} rounded p-1 border flex items-center justify-center cursor-pointer hover:shadow-sm transition-all`}
                              title={item.name}
                            >
                              {getItemIcon(item.category)}
                            </div>
                          ))}
                          {Array.from({ length: Math.max(0, 4 - drawer.items.length) }).map((_, index) => (
                            <div
                              key={`empty-drawer-${index}`}
                              className="border border-dashed border-gray-300 rounded p-1 flex items-center justify-center cursor-pointer hover:border-primary/50 transition-colors"
                              onClick={onAddItem}
                            >
                              <Plus className="w-2 h-2 text-gray-400" />
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Shoe Rack */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="text-xs">Shoe Rack</Badge>
                  </div>
                  <div className="bg-white/50 rounded-lg p-2 border border-gray-200 min-h-[100px]">
                    <div className="grid grid-cols-3 gap-2">
                      {wardrobeLayout.shoeRack.items.slice(0, 6).map((item) => (
                        <div
                          key={item.id}
                          className={`${getItemColor(item.category)} rounded p-2 border flex flex-col items-center justify-center cursor-pointer hover:shadow-sm transition-all group relative`}
                          title={item.name}
                        >
                          {getItemIcon(item.category)}
                          <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        </div>
                      ))}
                      {Array.from({ length: Math.max(0, 6 - wardrobeLayout.shoeRack.items.length) }).map((_, index) => (
                        <div
                          key={`empty-shoe-${index}`}
                          className="border-2 border-dashed border-gray-300 rounded p-2 flex items-center justify-center cursor-pointer hover:border-primary/50 transition-colors"
                          onClick={onAddItem}
                        >
                          <Plus className="w-3 h-3 text-gray-400" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Wardrobe Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{getItemsByCategory('Tops').length}</div>
            <div className="text-xs text-muted-foreground">Tops</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{getItemsByCategory('Bottoms').length}</div>
            <div className="text-xs text-muted-foreground">Bottoms</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{getItemsByCategory('Shoes').length}</div>
            <div className="text-xs text-muted-foreground">Shoes</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{getItemsByCategory('Accessories').length}</div>
            <div className="text-xs text-muted-foreground">Accessories</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WardrobeVector;