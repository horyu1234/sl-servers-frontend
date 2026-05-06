import React from 'react';
import {useTranslation} from 'react-i18next';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Alert, AlertDescription, AlertTitle} from '@/components/ui/alert';
import {Button} from '@/components/ui/button';
import {Info as InfoIcon, AlertTriangle, ExternalLink} from 'lucide-react';
import SwaggerUI from 'swagger-ui-react';

import 'swagger-ui-react/swagger-ui.css';
import './api.css';

export default function Api() {
    const {t} = useTranslation();
    const hostname = window.location.hostname;
    const isLocalHost = hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1';

    return (
        <div className="px-3 py-3 sm:px-4 sm:py-4">
            <Card className="min-w-0">
                <CardHeader className="pb-3">
                    <CardTitle className="text-base">API</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Alert className="border-red-500/50 bg-red-50/80 text-red-900 dark:border-red-400/40 dark:bg-red-950/30 dark:text-red-100 [&>svg]:text-red-600 dark:[&>svg]:text-red-300">
                        <AlertTriangle className="h-4 w-4"/>
                        <AlertTitle>{t('api.host-warning-title')}</AlertTitle>
                        <AlertDescription className="leading-relaxed">
                            {t('api.host-warning-before')}
                            <code className="mx-1 px-1 py-0.5 rounded bg-red-100 text-red-950 text-xs dark:bg-red-900/60 dark:text-red-50">
                                api.scplist.kr
                            </code>
                            {t('api.host-warning-middle')}
                            <code className="mx-1 px-1 py-0.5 rounded bg-red-100 text-red-950 text-xs dark:bg-red-900/60 dark:text-red-50">
                                backend.scplist.kr
                            </code>
                            {t('api.host-warning-after')}
                        </AlertDescription>
                    </Alert>
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
                    {isLocalHost ? (
                        <div className="rounded-lg border border-border bg-background/45 p-6 text-center sm:p-8">
                            <div className="mx-auto max-w-xl space-y-4">
                                <div className="text-lg font-semibold text-foreground">OpenAPI preview is disabled on localhost</div>
                                <p className="text-sm leading-6 text-muted-foreground">
                                    The remote OpenAPI host blocks this local origin, so the embedded Swagger frame would only show a CORS error here.
                                    Use the production API page for the live interactive documentation.
                                </p>
                                <Button asChild className="gap-2">
                                    <a href="https://scplist.kr/api" target="_blank" rel="noreferrer">
                                        Open production docs
                                        <ExternalLink className="h-4 w-4"/>
                                    </a>
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="api-swagger-host overflow-x-auto rounded-lg bg-white">
                            <SwaggerUI url="https://api.scplist.kr/openapi.json"/>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
