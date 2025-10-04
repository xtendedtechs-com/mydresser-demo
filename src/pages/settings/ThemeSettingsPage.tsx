import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ThemeSettingsPanel } from "@/components/settings/ThemeSettingsPanel";
import ThemeCustomizer from "@/components/ThemeCustomizer";
import { AdvancedThemeCustomizer } from "@/components/settings/AdvancedThemeCustomizer";
import { LanguageRegionalSettings } from "@/components/settings/LanguageRegionalSettings";
import { useTranslation } from 'react-i18next';

const ThemeSettingsPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/account')}
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">{t('theme.title')}</h1>
              <p className="text-muted-foreground">{t('theme.description')}</p>
            </div>
          </div>

          <LanguageRegionalSettings />
          <ThemeSettingsPanel />
          <AdvancedThemeCustomizer />
          <ThemeCustomizer />
        </div>
      </div>
    </div>
  );
};

export default ThemeSettingsPage;
