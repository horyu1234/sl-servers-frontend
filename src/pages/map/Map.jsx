import React, {useEffect} from 'react';
import {useTranslation} from "react-i18next";
import {useDispatch, useSelector} from "react-redux";
import {getServerMap} from "../../modules/serverMap";
import {MapContainer, Marker, Popup, TileLayer, Tooltip} from 'react-leaflet';

import './map.css'

const Map = () => {
    const {t} = useTranslation();
    const {fetching, data} = useSelector(state => ({
        fetching: state.serverMap.fetching,
        data: state.serverMap.data
    }))
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(getServerMap());
    }, [dispatch])

    if (fetching) return null;
    return (
        <div className="container-fluid">
            <div className="bg-body-tertiary rounded" style={{padding: "20px", marginTop: "20px"}}>
                <h3 className="col-12 text-center">{t('all-server-map.title')}</h3>
                <div className="col-12">
                    <MapContainer
                        className="markercluster-map"
                        center={[30.0, 31.0]}
                        zoom={2}
                        minZoom={2}
                        maxZoom={18}
                    >
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                        />

                        {data.map(serverLoc => (
                            <Marker key={serverLoc.serverId}
                                    position={[serverLoc.location.lat, serverLoc.location.long]}
                            >
                                <Tooltip>
                                    <span>Server ID: {serverLoc.serverId}</span>
                                </Tooltip>
                                <Popup minWidth={200} closeButton={true}>
                                    <div dangerouslySetInnerHTML={{__html: serverLoc.info}}/>
                                    <br/>
                                    <br/>
                                    <a target="_blank" rel="noreferrer"
                                       href={`/servers/${serverLoc.serverId}`}
                                       style={{fontSize: '10pt'}}
                                    >
                                        {t('all-server-map.server-info-btn')}
                                    </a>
                                </Popup>
                            </Marker>
                        ))}
                    </MapContainer>
                </div>
            </div>
        </div>
    )
}

export default Map;
