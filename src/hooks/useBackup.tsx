import { useState, useEffect } from 'react';
import { backupService, WardrobeBackup } from '@/services/backupService';

export const useBackup = () => {
  const [backups, setBackups] = useState<WardrobeBackup[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [restoring, setRestoring] = useState(false);

  const fetchBackups = async () => {
    setLoading(true);
    const data = await backupService.getBackups();
    setBackups(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchBackups();
  }, []);

  const createBackup = async (name: string, notes?: string) => {
    setCreating(true);
    const id = await backupService.createBackup(name, 'manual', notes);
    if (id) {
      await fetchBackups();
    }
    setCreating(false);
    return id;
  };

  const restoreBackup = async (backupId: string) => {
    setRestoring(true);
    const success = await backupService.restoreBackup(backupId);
    setRestoring(false);
    return success;
  };

  const deleteBackup = async (backupId: string) => {
    const success = await backupService.deleteBackup(backupId);
    if (success) {
      await fetchBackups();
    }
    return success;
  };

  const downloadBackup = async (backupId: string) => {
    await backupService.downloadBackup(backupId);
  };

  return {
    backups,
    loading,
    creating,
    restoring,
    createBackup,
    restoreBackup,
    deleteBackup,
    downloadBackup,
    refetch: fetchBackups
  };
};
