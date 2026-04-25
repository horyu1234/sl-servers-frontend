import React, {useEffect, useState} from 'react';
import {useTranslation} from "react-i18next";
import {connect} from "react-redux";
import {bindActionCreators} from "@reduxjs/toolkit";
import {useParams} from "react-router-dom";
import * as serverInfoActions from "../../modules/serverInfo";
import ServerDistance from "../../components/ServerDistance";
import {Alert} from "react-bootstrap";
import GraphOption from "../../components/GraphOption";
import TrendGraph from "../../components/TrendGraph";
import {getServerGraphAPI} from "../../apiClient";

const Info = (
    {
        isServerInfoFetching,
        isServerInfoError,

        server,

        ServerInfoActions
    }
) => {
    const [showDaylightAlert, setShowDaylightAlert] = useState(true);
    const [fluxResponse, setFluxResponse] = useState(null);
    const [isGraphError, setGraphError] = useState(false);

    const {t} = useTranslation();
    const {serverId} = useParams();

    useEffect(() => {
        if (!isNumber(serverId)) return;

        ServerInfoActions.getServerInfo(serverId)
    }, [ServerInfoActions, serverId])

    useEffect(() => {
        updateGraph({
            aggregateEvery: '5m',
            startTime: '-1w',
        });
    }, [])

    const isNumber = () => {
        return !isNaN(parseInt(serverId));
    }

    const updateGraph = (options) => {
        if (!isNumber(serverId)) return;
        setFluxResponse(null);
        setGraphError(false);

        getServerGraphAPI(serverId, options).then(res => {
            setFluxResponse(res.data);
        }).catch(error => {
            setGraphError(true);
        })
    }

    const handleUpdateGraphOption = (options) => {
        updateGraph(options);
    }

    if (!isNumber(serverId) || server === null) {
        return (
            <div className="container">
                <div className="bg-body-tertiary rounded" style={{padding: "20px", marginTop: "20px"}}>
                    <h3 className="col-12 text-center">{t('server-info.title')}</h3>
                    <Alert variant="danger" className="mt-3 mb-0">
                        {t('server-info.not-exist')}
                    </Alert>
                </div>
            </div>
        );
    }

    if (isServerInfoError) {
        return (
            <div className="container">
                <div className="bg-body-tertiary rounded" style={{padding: "20px", marginTop: "20px"}}>
                    <h3 className="col-12 text-center">{t('server-info.title')}</h3>
                    <Alert variant="danger" className="mt-3 mb-0">
                        {t('general.server-error')}
                    </Alert>
                </div>
            </div>
        );
    }

    return (
        <div className="container">
            <div className="bg-body-tertiary rounded" style={{padding: "20px", marginTop: "20px"}}>
                <h3 className="col-12 text-center">{t('server-info.title')}</h3>

                {/*{isServerInfoFetching && <Alert variant="info" className="mt-3 mb-0">*/}
                {/*    {t('server-info.loading')}*/}
                {/*</Alert>}*/}

                <div className="col-12" dangerouslySetInnerHTML={{__html: server.info}}/>
                <div className="row" style={{marginTop: "20px", fontSize: "14pt"}}>
                    <div className="col-md-6" style={{textAlign: "right"}}>
                        {t('server-info.status.name')}
                    </div>
                    <div className="col-md-6">
                        {server.online ? <span style={{color: '#81C784'}}>
                            {t('server-info.status.online')}
                        </span> : <span style={{color: '#E57373'}}>
                            {t('server-info.status.offline')}
                        </span>}
                    </div>
                </div>
                <div className="row">
                    <div className="col-6">
                        <div className="row" style={{marginTop: '20px'}}>
                            <div className="col-md-4">{t('server-info.address')}</div>
                            <div className="col-md-8">
                                {`${server.ip}:${server.port}`}
                            </div>
                        </div>
                        <div className="row" style={{marginTop: '20px'}}>
                            <div className="col-md-4">{t('server-info.players')}</div>
                            <div className="col-md-8">{server.players}</div>
                        </div>
                    </div>
                    <div className="col-6">
                        <div className="row" style={{marginTop: '20px'}}>
                            <div className="col-md-4">{t('server-info.pastebin')}</div>
                            <div className="col-md-8">
                                <a target="_blank" rel="noreferrer"
                                   href={`https://pastebin.com/${server.pastebin}`}>{server.pastebin}</a>
                            </div>
                        </div>
                        <div className="row" style={{marginTop: '20px'}}>
                            <div className="col-md-4">{t('server-info.distance')}</div>
                            <div className="col-md-8">
                                <ServerDistance kmDistance={server.distance}/>
                            </div>
                        </div>
                    </div>

                    <h3 className="col-12 text-center" style={{marginTop: '20px'}}>{t('server-info.statistics')}</h3>
                    {showDaylightAlert &&
                        <Alert variant="info" style={{width: "100%", marginLeft: "15px", marginRight: "15px"}}
                               onClose={() => setShowDaylightAlert(false)} dismissible>
                            {t('server-info.daylight-saving-time')}
                        </Alert>}

                    <div className="col-12">
                        <GraphOption onUpdate={handleUpdateGraphOption}/>

                        {!fluxResponse && !isGraphError && <Alert variant="info" style={{width: "100%"}}>
                            {t('server-info.graph.loading')}
                        </Alert>}
                        {isGraphError && <Alert variant="danger" style={{width: "100%"}}>
                            {t('general.server-error')}
                        </Alert>}

                        {!isGraphError && fluxResponse && <TrendGraph
                            layers={[
                                {
                                    type: "line",
                                    x: "_time",
                                    y: "_value",
                                    fill: ['version'],
                                    lineWidth: 2,
                                    shadeBelow: true,
                                    shadeBelowOpacity: 0.3,
                                }
                            ]}
                            fluxResponse={fluxResponse}
                        />}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default connect(
    (state) => ({
        isServerInfoFetching: state.serverInfo.fetching,
        isServerInfoError: state.serverInfo.error,

        server: state.serverInfo.data,
    }),
    (dispatch) => ({
        ServerInfoActions: bindActionCreators(serverInfoActions, dispatch),
    })
)(Info);
