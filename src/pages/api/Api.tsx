import React from 'react';
import {useTranslation} from 'react-i18next';
import {Alert, AlertDescription, AlertTitle} from '@/components/ui/alert';
import {Button} from '@/components/ui/button';
import {Info as InfoIcon, AlertTriangle, ExternalLink} from 'lucide-react';
import SwaggerUI from 'swagger-ui-react';
import {PageHeader} from '../../components/shared/PageHeader';
import {DocBlocks} from '../../components/site/DocBlocks';
import {usePageHead} from '../../lib/hooks/usePageHead';
import {useSiteContext} from '../../lib/hooks/useSiteContext';
import {docModel} from '../../site/pages/docs';

import 'swagger-ui-react/swagger-ui.css';
import './api.css';

export default function Api() {
    const {t} = useTranslation();
    const guide = docModel(useSiteContext(), 'api');
    usePageHead(guide);
    const hostname = window.location.hostname;
    const isLocalHost = hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1';

    return (
        <div className="mx-auto w-full max-w-screen-2xl px-3 py-4 sm:px-4 sm:py-6">
            <PageHeader className="mb-4" title="API" description={guide?.intro[0]}/>
            <div className="min-w-0 space-y-3">
                    <Alert className="border-destructive/40 bg-destructive/10 [&>svg]:text-destructive">
                        <AlertTriangle className="h-4 w-4"/>
                        <AlertTitle>{t('api.host-warning-title')}</AlertTitle>
                        <AlertDescription className="leading-relaxed">
                            {t('api.host-warning-before')}
                            <wbr/>
                            <code className="mx-1 rounded bg-muted px-1 py-0.5 text-xs text-foreground">
                                api.scplist.kr
                            </code>
                            {t('api.host-warning-middle')}
                            <wbr/>
                            <code className="mx-1 rounded bg-muted px-1 py-0.5 text-xs text-foreground">
                                backend.scplist.kr
                            </code>
                            <wbr/>
                            {t('api.host-warning-after')}
                        </AlertDescription>
                    </Alert>
                    <Alert className="border-warning/40 bg-warning/10 [&>svg]:text-warning">
                        <AlertTriangle className="h-4 w-4"/>
                        <AlertDescription>
                            {t('api.undocumented-warning')}
                        </AlertDescription>
                    </Alert>
                    <Alert>
                        <InfoIcon className="h-4 w-4"/>
                        <AlertDescription>
                            {t('api.live-docs-before')}
                            <wbr/>
                            <code className="mx-1 px-1 py-0.5 rounded bg-muted text-foreground/90 text-xs">
                                api.scplist.kr/openapi.json
                            </code>
                            <wbr/>
                            {t('api.live-docs-after')}
                        </AlertDescription>
                    </Alert>
                    {guide?.blocks && (
                        <div className="max-w-4xl pb-2">
                            <DocBlocks blocks={guide.blocks}/>
                        </div>
                    )}
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
                        <div className="api-swagger-host overflow-x-auto rounded-lg">
                            <SwaggerUI url="https://api.scplist.kr/openapi.json"/>
                        </div>
                    )}
            </div>
        </div>
    );
}
