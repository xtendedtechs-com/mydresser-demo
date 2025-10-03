import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Download, Clock, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ReportBuilder } from '@/components/ReportBuilder';
import { DataExportManager } from '@/components/DataExportManager';
import { ScheduledReportsManager } from '@/components/ScheduledReportsManager';

export default function ReportsAnalyticsPage() {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <Button
        variant="ghost"
        onClick={() => navigate('/account')}
        className="mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Account
      </Button>

      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Reports & Data Export</h1>
        <p className="text-muted-foreground">
          Generate custom reports, export your data, and schedule automated reports
        </p>
      </div>

      <Tabs defaultValue="builder" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="builder">
            <FileText className="mr-2 h-4 w-4" />
            Report Builder
          </TabsTrigger>
          <TabsTrigger value="export">
            <Download className="mr-2 h-4 w-4" />
            Data Export
          </TabsTrigger>
          <TabsTrigger value="scheduled">
            <Clock className="mr-2 h-4 w-4" />
            Scheduled Reports
          </TabsTrigger>
        </TabsList>

        <TabsContent value="builder">
          <ReportBuilder />
        </TabsContent>

        <TabsContent value="export">
          <DataExportManager />
        </TabsContent>

        <TabsContent value="scheduled">
          <ScheduledReportsManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}
