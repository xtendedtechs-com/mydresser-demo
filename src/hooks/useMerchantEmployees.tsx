import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface MerchantEmployee {
  id: string;
  merchant_id: string;
  employee_name: string;
  employee_email: string;
  employee_phone: string | null;
  position: string;
  location_id: string | null;
  permissions: {
    can_process_sales: boolean;
    can_manage_inventory: boolean;
    can_view_reports: boolean;
  };
  hourly_rate: number | null;
  hire_date: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useMerchantEmployees = () => {
  const [employees, setEmployees] = useState<MerchantEmployee[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchEmployees = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('merchant_employees')
        .select('*')
        .eq('merchant_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEmployees((data || []) as MerchantEmployee[]);
    } catch (error: any) {
      toast({
        title: 'Error fetching employees',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const addEmployee = async (employeeData: Partial<MerchantEmployee>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('merchant_employees')
        .insert({
          merchant_id: user.id,
          ...employeeData,
        } as any)
        .select()
        .single();

      if (error) throw error;

      setEmployees([data as MerchantEmployee, ...employees]);
      toast({
        title: 'Employee added',
        description: 'Employee has been added successfully',
      });
      return data;
    } catch (error: any) {
      toast({
        title: 'Error adding employee',
        description: error.message,
        variant: 'destructive',
      });
      throw error;
    }
  };

  const updateEmployee = async (id: string, updates: Partial<MerchantEmployee>) => {
    try {
      const { data, error } = await supabase
        .from('merchant_employees')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setEmployees(employees.map(emp => emp.id === id ? (data as MerchantEmployee) : emp));
      toast({
        title: 'Employee updated',
        description: 'Employee information has been updated',
      });
      return data;
    } catch (error: any) {
      toast({
        title: 'Error updating employee',
        description: error.message,
        variant: 'destructive',
      });
      throw error;
    }
  };

  const deleteEmployee = async (id: string) => {
    try {
      const { error } = await supabase
        .from('merchant_employees')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setEmployees(employees.filter(emp => emp.id !== id));
      toast({
        title: 'Employee removed',
        description: 'Employee has been removed from the system',
      });
    } catch (error: any) {
      toast({
        title: 'Error removing employee',
        description: error.message,
        variant: 'destructive',
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchEmployees();

    const channel = supabase
      .channel('merchant_employees_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'merchant_employees',
        },
        () => {
          fetchEmployees();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    employees,
    loading,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    refetch: fetchEmployees,
  };
};
