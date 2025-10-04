import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LanguageSelector } from "@/components/LanguageSelector";
import { useState, useEffect } from "react";
import { Clock, Calendar, Globe2 } from "lucide-react";
import { useTranslation } from 'react-i18next';

export const LanguageRegionalSettings = () => {
  const { t } = useTranslation();
  const [timeFormat, setTimeFormat] = useState<'12h' | '24h'>(
    (localStorage.getItem('time-format') as '12h' | '24h') || '12h'
  );
  const [dateFormat, setDateFormat] = useState<string>(
    localStorage.getItem('date-format') || 'MM/DD/YYYY'
  );
  const [timezone, setTimezone] = useState<string>(
    localStorage.getItem('timezone') || Intl.DateTimeFormat().resolvedOptions().timeZone
  );

  useEffect(() => {
    localStorage.setItem('time-format', timeFormat);
  }, [timeFormat]);

  useEffect(() => {
    localStorage.setItem('date-format', dateFormat);
  }, [dateFormat]);

  useEffect(() => {
    localStorage.setItem('timezone', timezone);
  }, [timezone]);

  const timezones = [
    'America/New_York',
    'America/Los_Angeles',
    'America/Chicago',
    'America/Denver',
    'Europe/London',
    'Europe/Paris',
    'Europe/Berlin',
    'Asia/Tokyo',
    'Asia/Shanghai',
    'Asia/Dubai',
    'Asia/Jerusalem',
    'Australia/Sydney',
    'Pacific/Auckland',
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Globe2 className="w-5 h-5 text-primary" />
            <CardTitle>{t('language.title')}</CardTitle>
          </div>
          <CardDescription>
            {t('language.description')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label className="text-base font-semibold mb-3 block">{t('language.appLanguage')}</Label>
            <LanguageSelector />
          </div>

          <div>
            <Label htmlFor="timezone" className="text-base font-semibold mb-3 block">
              <Clock className="w-4 h-4 inline mr-2" />
              {t('language.timezone')}
            </Label>
            <Select value={timezone} onValueChange={setTimezone}>
              <SelectTrigger id="timezone">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {timezones.map((tz) => (
                  <SelectItem key={tz} value={tz}>
                    {tz.replace('_', ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="time-format" className="text-base font-semibold mb-3 block">
              <Clock className="w-4 h-4 inline mr-2" />
              {t('language.timeFormat')}
            </Label>
            <Select value={timeFormat} onValueChange={(v) => setTimeFormat(v as '12h' | '24h')}>
              <SelectTrigger id="time-format">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="12h">12-hour (e.g., 2:30 PM)</SelectItem>
                <SelectItem value="24h">24-hour (e.g., 14:30)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="date-format" className="text-base font-semibold mb-3 block">
              <Calendar className="w-4 h-4 inline mr-2" />
              {t('language.dateFormat')}
            </Label>
            <Select value={dateFormat} onValueChange={setDateFormat}>
              <SelectTrigger id="date-format">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MM/DD/YYYY">MM/DD/YYYY (US)</SelectItem>
                <SelectItem value="DD/MM/YYYY">DD/MM/YYYY (EU/IL)</SelectItem>
                <SelectItem value="YYYY-MM-DD">YYYY-MM-DD (ISO)</SelectItem>
                <SelectItem value="DD.MM.YYYY">DD.MM.YYYY (DE)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
