import { useState, useCallback } from 'react';

export interface VTOHistoryItem {
  id: string;
  imageUrl: string;
  timestamp: number;
  outfitId: string;
  processingTime: number;
}

export const useVTOHistory = () => {
  const [history, setHistory] = useState<VTOHistoryItem[]>([]);
  const [comparisonMode, setComparisonMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const addToHistory = useCallback((item: Omit<VTOHistoryItem, 'id' | 'timestamp'>) => {
    const newItem: VTOHistoryItem = {
      ...item,
      id: `vto-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now()
    };
    
    setHistory(prev => [newItem, ...prev].slice(0, 20)); // Keep last 20
    return newItem;
  }, []);

  const removeFromHistory = useCallback((id: string) => {
    setHistory(prev => prev.filter(item => item.id !== id));
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
    setSelectedItems([]);
  }, []);

  const toggleComparison = useCallback(() => {
    setComparisonMode(prev => !prev);
    if (!comparisonMode) {
      setSelectedItems([]);
    }
  }, [comparisonMode]);

  const toggleItemSelection = useCallback((id: string) => {
    setSelectedItems(prev => {
      if (prev.includes(id)) {
        return prev.filter(itemId => itemId !== id);
      }
      if (prev.length < 2) {
        return [...prev, id];
      }
      return prev;
    });
  }, []);

  const getComparisonItems = useCallback(() => {
    return history.filter(item => selectedItems.includes(item.id));
  }, [history, selectedItems]);

  return {
    history,
    comparisonMode,
    selectedItems,
    addToHistory,
    removeFromHistory,
    clearHistory,
    toggleComparison,
    toggleItemSelection,
    getComparisonItems
  };
};
