import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ServerCrash, ArrowLeft } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  const { t } = useTranslation();
  return (
    <div className="flex-1 flex items-center justify-center px-4 py-8">
      <Card className="max-w-md w-full">
        <CardContent className="p-8 flex flex-col items-center text-center gap-4">
          <ServerCrash className="h-12 w-12 text-muted-foreground" />
          <div className="text-2xl font-semibold">404</div>
          <div className="text-sm text-muted-foreground">{t('general.not-found')}</div>
          <Button asChild variant="outline" className="gap-2 mt-2">
            <Link to="/"><ArrowLeft className="h-4 w-4" /> Home</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
