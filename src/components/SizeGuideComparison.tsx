import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Ruler, TrendingUp, Globe, AlertCircle } from "lucide-react";

export const SizeGuideComparison = () => {
  const sizeChart = {
    brand: "Universal",
    category: "Tops",
    measurements: [
      { size: "XS", chest: "81-86", waist: "66-71", length: "68" },
      { size: "S", chest: "86-91", waist: "71-76", length: "70" },
      { size: "M", chest: "91-97", waist: "76-81", length: "72" },
      { size: "L", chest: "97-102", waist: "81-86", length: "74" },
      { size: "XL", chest: "102-107", waist: "86-91", length: "76" },
    ],
  };

  const brandComparison = [
    {
      brand: "Zara",
      yourSize: "M",
      fitType: "Slim Fit",
      note: "Runs small - consider sizing up",
      confidence: 85,
    },
    {
      brand: "H&M",
      yourSize: "M",
      fitType: "Regular Fit",
      note: "True to size",
      confidence: 92,
    },
    {
      brand: "Uniqlo",
      yourSize: "L",
      fitType: "Asian Fit",
      note: "Runs smaller than US/EU sizes",
      confidence: 88,
    },
    {
      brand: "Ralph Lauren",
      yourSize: "S",
      fitType: "Classic Fit",
      note: "Runs large - size down recommended",
      confidence: 90,
    },
  ];

  const regionalSizes = [
    { region: "US/UK", size: "M", chest: "38-40", waist: "32-34" },
    { region: "EU", size: "50", chest: "96-101", waist: "81-86" },
    { region: "Asian", size: "L", chest: "92-96", waist: "78-82" },
    { region: "JP", size: "3", chest: "96-101", waist: "81-86" },
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Ruler className="h-5 w-5 text-primary" />
          <CardTitle>Size Guide & Comparison</CardTitle>
        </div>
        <CardDescription>
          Compare sizes across brands and regions for the perfect fit
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="chart">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="chart">Size Chart</TabsTrigger>
            <TabsTrigger value="brands">Brand Compare</TabsTrigger>
            <TabsTrigger value="regional">Regional</TabsTrigger>
          </TabsList>

          {/* Standard Size Chart */}
          <TabsContent value="chart" className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-medium">Category: {sizeChart.category}</p>
                <p className="text-xs text-muted-foreground">All measurements in cm</p>
              </div>
              <Badge variant="outline">Standard Sizing</Badge>
            </div>

            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Size</TableHead>
                    <TableHead>Chest</TableHead>
                    <TableHead>Waist</TableHead>
                    <TableHead>Length</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sizeChart.measurements.map((row) => (
                    <TableRow key={row.size}>
                      <TableCell className="font-medium">{row.size}</TableCell>
                      <TableCell>{row.chest}</TableCell>
                      <TableCell>{row.waist}</TableCell>
                      <TableCell>{row.length}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg">
              <div className="flex gap-2">
                <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    How to Measure
                  </p>
                  <ul className="text-xs text-blue-700 dark:text-blue-300 mt-1 space-y-1">
                    <li>• Chest: Measure around the fullest part</li>
                    <li>• Waist: Measure around natural waistline</li>
                    <li>• Length: Measure from shoulder to hem</li>
                  </ul>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Brand Comparison */}
          <TabsContent value="brands" className="space-y-4">
            <div className="space-y-3">
              {brandComparison.map((brand) => (
                <div key={brand.brand} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold">{brand.brand}</p>
                      <p className="text-sm text-muted-foreground">{brand.fitType}</p>
                    </div>
                    <Badge variant="secondary" className="text-lg font-bold">
                      {brand.yourSize}
                    </Badge>
                  </div>
                  <p className="text-sm mb-2">{brand.note}</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full bg-primary"
                        style={{ width: `${brand.confidence}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {brand.confidence}% match
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <Button className="w-full" variant="outline">
              <TrendingUp className="mr-2 h-4 w-4" />
              Analyze More Brands
            </Button>
          </TabsContent>

          {/* Regional Sizes */}
          <TabsContent value="regional" className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Globe className="h-5 w-5 text-primary" />
              <p className="text-sm font-medium">International Size Conversion</p>
            </div>

            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Region</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Chest (cm)</TableHead>
                    <TableHead>Waist (cm)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {regionalSizes.map((row) => (
                    <TableRow key={row.region}>
                      <TableCell className="font-medium">{row.region}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{row.size}</Badge>
                      </TableCell>
                      <TableCell>{row.chest}</TableCell>
                      <TableCell>{row.waist}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="p-3 bg-muted rounded-lg">
              <p className="text-xs text-muted-foreground">
                <AlertCircle className="h-3 w-3 inline mr-1" />
                Note: Asian sizing typically runs 1-2 sizes smaller than US/EU sizing
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
