import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useBackup } from '@/hooks/useBackup';
import { Database, Download, RotateCcw, Trash2, Plus, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export const BackupManager = () => {
  const { backups, loading, creating, restoring, createBackup, restoreBackup, deleteBackup, downloadBackup, refetch } = useBackup();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [backupName, setBackupName] = useState('');
  const [backupNotes, setBackupNotes] = useState('');

  const handleCreateBackup = async () => {
    if (!backupName.trim()) return;
    const id = await createBackup(backupName, backupNotes);
    if (id) {
      setIsCreateDialogOpen(false);
      setBackupName('');
      setBackupNotes('');
    }
  };

  const handleRestoreBackup = async (backupId: string) => {
    const success = await restoreBackup(backupId);
    if (success) {
      window.location.reload();
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              Wardrobe Backups
            </CardTitle>
            <CardDescription>
              Create and restore backups of your entire wardrobe
            </CardDescription>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Backup
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Backup</DialogTitle>
                <DialogDescription>
                  Save a snapshot of your current wardrobe, items, outfits, and collections
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="backup-name">Backup Name *</Label>
                  <Input
                    id="backup-name"
                    placeholder="e.g., Before reorganization"
                    value={backupName}
                    onChange={(e) => setBackupName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="backup-notes">Notes (Optional)</Label>
                  <Textarea
                    id="backup-notes"
                    placeholder="Add any notes about this backup..."
                    value={backupNotes}
                    onChange={(e) => setBackupNotes(e.target.value)}
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateBackup} disabled={!backupName.trim() || creating}>
                  {creating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Create Backup
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : backups.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Database className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No backups yet</p>
            <p className="text-sm">Create your first backup to protect your wardrobe data</p>
          </div>
        ) : (
          <div className="space-y-3">
            {backups.map((backup) => (
              <Card key={backup.id} className="border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium truncate">{backup.backup_name}</h4>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                          {backup.backup_type}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>{backup.item_count} items • {formatDistanceToNow(new Date(backup.created_at), { addSuffix: true })}</p>
                        {backup.notes && <p className="text-xs italic">{backup.notes}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => downloadBackup(backup.id)}
                        title="Download backup"
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="ghost"
                            disabled={restoring}
                            title="Restore backup"
                          >
                            {restoring ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Restore Backup?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will replace all your current wardrobe data with the backup from{' '}
                              <strong>{formatDistanceToNow(new Date(backup.created_at), { addSuffix: true })}</strong>.
                              Your current data will be permanently deleted. This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleRestoreBackup(backup.id)}>
                              Restore Backup
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="ghost"
                            title="Delete backup"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Backup?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete the backup "{backup.backup_name}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteBackup(backup.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
