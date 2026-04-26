import React from 'react';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Alert, AlertDescription} from '@/components/ui/alert';
import {Info as InfoIcon} from 'lucide-react';
import SwaggerUI from 'swagger-ui-react';

import 'swagger-ui-react/swagger-ui.css';
import './api.css';

export default function Api() {
    return (
        <div className="px-4 py-4">
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base">API</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
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
                    <div className="api-swagger-host bg-white rounded-lg overflow-hidden">
                        <SwaggerUI url="https://backend.scplist.kr/openapi.json"/>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
