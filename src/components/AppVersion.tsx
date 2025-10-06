import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Info } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ChangelogItem {
  category: string;
  items: string[];
}

interface AppVersionData {
  id: string;
  version: string;
  release_date: string;
  changelog: ChangelogItem[];
  is_current: boolean;
  created_at: string;
}

export const AppVersion = () => {
  const { data: currentVersion } = useQuery<AppVersionData>({
    queryKey: ["app-version"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("app_versions" as any)
        .select("*")
        .eq("is_current", true)
        .single();

      if (error) throw error;
      return data as unknown as AppVersionData;
    },
  });

  if (!currentVersion) return null;

  const changelog = currentVersion.changelog;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-foreground">
          <Info className="w-3 h-3 mr-1" />
          {currentVersion.version}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>MyDresser {currentVersion.version}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-6">
            <div>
              <p className="text-sm text-muted-foreground mb-4">
                Released {new Date(currentVersion.release_date).toLocaleDateString()}
              </p>
            </div>

            {changelog.map((section, idx) => (
              <div key={idx} className="space-y-2">
                <h3 className="font-semibold text-lg">{section.category}</h3>
                <ul className="space-y-1.5 ml-4">
                  {section.items.map((item, itemIdx) => (
                    <li key={itemIdx} className="text-sm text-muted-foreground flex items-start">
                      <span className="mr-2">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
