import React from 'react';
import {useTranslation} from 'react-i18next';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Alert, AlertDescription} from '@/components/ui/alert';
import {Info as InfoIcon, AlertTriangle} from 'lucide-react';
import SwaggerUI from 'swagger-ui-react';

import 'swagger-ui-react/swagger-ui.css';
import './api.css';

export default function Api() {
    const {t} = useTranslation();
    return (
        <div className="px-4 py-4">
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base">API</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Alert className="border-amber-500/50 bg-amber-50/50 text-amber-800 dark:border-amber-400/40 dark:bg-amber-950/20 dark:text-amber-200 [&>svg]:text-amber-600 dark:[&>svg]:text-amber-300">
                        <AlertTriangle className="h-4 w-4"/>
                        <AlertDescription>
                            {t('api.undocumented-warning')}
                        </AlertDescription>
                    </Alert>
                    <Alert>
                        <InfoIcon className="h-4 w-4"/>
                        <AlertDescription>
                            Live OpenAPI documentation served from
                            <code className="mx-1 px-1 py-0.5 rounded bg-muted text-foreground/90 text-xs">
                                api.scplist.kr/openapi.json
                            </code>
                            — try requests directly from the page.
                        </AlertDescription>
                    </Alert>
                    <div className="api-swagger-host bg-white rounded-lg overflow-x-auto">
                        <SwaggerUI url="https://api.scplist.kr/openapi.json"/>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
