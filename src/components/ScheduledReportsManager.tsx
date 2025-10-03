import { useState } from 'react';
import { Clock, Mail, Calendar, Plus, Trash2, Edit, Play, Pause } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

interface ScheduledReport {
  id: string;
  name: string;
  type: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  format: string;
  recipients: string[];
  enabled: boolean;
  next_run: string;
  last_run?: string;
}

export const ScheduledReportsManager = () => {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newReport, setNewReport] = useState({
    name: '',
    type: 'wardrobe',
    frequency: 'weekly' as const,
    format: 'pdf',
    recipients: '',
    enabled: true,
  });

  const [scheduledReports, setScheduledReports] = useState<ScheduledReport[]>([
    {
      id: '1',
      name: 'Weekly Wardrobe Summary',
      type: 'wardrobe',
      frequency: 'weekly',
      format: 'pdf',
      recipients: ['user@example.com'],
      enabled: true,
      next_run: new Date(Date.now() + 86400000 * 3).toISOString(),
      last_run: new Date(Date.now() - 86400000 * 4).toISOString(),
    },
    {
      id: '2',
      name: 'Monthly Sales Report',
      type: 'marketplace',
      frequency: 'monthly',
      format: 'excel',
      recipients: ['admin@example.com'],
      enabled: true,
      next_run: new Date(Date.now() + 86400000 * 15).toISOString(),
      last_run: new Date(Date.now() - 86400000 * 15).toISOString(),
    },
  ]);

  const handleCreateReport = () => {
    if (!newReport.name || !newReport.recipients) {
      toast({
        title: 'Incomplete Information',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    const report: ScheduledReport = {
      id: Date.now().toString(),
      ...newReport,
      recipients: newReport.recipients.split(',').map(e => e.trim()),
      next_run: new Date(Date.now() + 86400000).toISOString(),
    };

    setScheduledReports([...scheduledReports, report]);
    setDialogOpen(false);
    setNewReport({
      name: '',
      type: 'wardrobe',
      frequency: 'weekly',
      format: 'pdf',
      recipients: '',
      enabled: true,
    });

    toast({
      title: 'Scheduled Report Created',
      description: `"${report.name}" will run ${report.frequency}`,
    });
  };

  const handleToggleReport = (id: string) => {
    setScheduledReports(scheduledReports.map(report =>
      report.id === id ? { ...report, enabled: !report.enabled } : report
    ));

    const report = scheduledReports.find(r => r.id === id);
    toast({
      title: report?.enabled ? 'Report Paused' : 'Report Resumed',
      description: report?.enabled
        ? 'The scheduled report has been paused'
        : 'The scheduled report has been resumed',
    });
  };

  const handleDeleteReport = (id: string) => {
    setScheduledReports(scheduledReports.filter(report => report.id !== id));
    toast({
      title: 'Report Deleted',
      description: 'The scheduled report has been removed',
    });
  };

  const handleRunNow = (id: string) => {
    const report = scheduledReports.find(r => r.id === id);
    toast({
      title: 'Report Running',
      description: `"${report?.name}" is being generated and will be sent shortly`,
    });
  };

  const getFrequencyBadge = (frequency: string): "default" | "secondary" | "outline" => {
    const colors: Record<string, "default" | "secondary" | "outline"> = {
      daily: 'default',
      weekly: 'secondary',
      monthly: 'outline',
      quarterly: 'outline',
    };
    return colors[frequency] || 'default';
  };

  return (
    <div className="space-y-6">
      {/* Header with Create Button */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Scheduled Reports</CardTitle>
              <CardDescription>
                Automate report generation and delivery
              </CardDescription>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Schedule
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Create Scheduled Report</DialogTitle>
                  <DialogDescription>
                    Configure automatic report generation and delivery
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="schedule-name">Report Name</Label>
                    <Input
                      id="schedule-name"
                      placeholder="e.g., Weekly Analytics Report"
                      value={newReport.name}
                      onChange={(e) => setNewReport({ ...newReport, name: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Report Type</Label>
                    <Select value={newReport.type} onValueChange={(val) => setNewReport({ ...newReport, type: val })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="wardrobe">Wardrobe Analytics</SelectItem>
                        <SelectItem value="marketplace">Marketplace Performance</SelectItem>
                        <SelectItem value="financial">Financial Report</SelectItem>
                        <SelectItem value="analytics">User Analytics</SelectItem>
                        <SelectItem value="sustainability">Sustainability Impact</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Frequency</Label>
                    <Select value={newReport.frequency} onValueChange={(val: any) => setNewReport({ ...newReport, frequency: val })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="quarterly">Quarterly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Format</Label>
                    <Select value={newReport.format} onValueChange={(val) => setNewReport({ ...newReport, format: val })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pdf">PDF Document</SelectItem>
                        <SelectItem value="csv">CSV Spreadsheet</SelectItem>
                        <SelectItem value="excel">Excel Workbook</SelectItem>
                        <SelectItem value="json">JSON Data</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="recipients">Email Recipients</Label>
                    <Input
                      id="recipients"
                      placeholder="email@example.com, another@example.com"
                      value={newReport.recipients}
                      onChange={(e) => setNewReport({ ...newReport, recipients: e.target.value })}
                    />
                    <p className="text-xs text-muted-foreground">
                      Separate multiple emails with commas
                    </p>
                  </div>

                  <Button onClick={handleCreateReport} className="w-full">
                    Create Schedule
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
      </Card>

      {/* Scheduled Reports List */}
      <div className="space-y-3">
        {scheduledReports.map((report) => (
          <Card key={report.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold truncate">{report.name}</h3>
                    <Badge variant={getFrequencyBadge(report.frequency)} className="capitalize">
                      {report.frequency}
                    </Badge>
                    <Badge variant={report.enabled ? 'default' : 'outline'}>
                      {report.enabled ? 'Active' : 'Paused'}
                    </Badge>
                  </div>

                  <div className="space-y-1 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3 w-3" />
                      <span>Next run: {new Date(report.next_run).toLocaleDateString()}</span>
                    </div>
                    {report.last_run && (
                      <div className="flex items-center gap-2">
                        <Clock className="h-3 w-3" />
                        <span>Last run: {new Date(report.last_run).toLocaleDateString()}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Mail className="h-3 w-3" />
                      <span>{report.recipients.length} recipient(s)</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleRunNow(report.id)}
                    disabled={!report.enabled}
                  >
                    <Play className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleToggleReport(report.id)}
                  >
                    {report.enabled ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeleteReport(report.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {scheduledReports.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Clock className="h-12 w-12 mx-auto mb-3 opacity-50 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">No scheduled reports yet</p>
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Schedule
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
