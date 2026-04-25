import React, {useEffect, useState} from 'react';
import {useTranslation} from "react-i18next";
import CountrySelect from "../../components/country-select/CountrySelect";
import ModLoaderChart from "./ModLoaderChart";
import GraphOption from "../../components/GraphOption";
import {Alert} from "react-bootstrap";
import TrendGraph from "../../components/TrendGraph";
import {toast} from "react-toastify";
import {getCountryTrendAPI} from "../../apiClient";

const Stats = () => {
    const [fluxResponse, setFluxResponse] = useState(null);
    const [isServerError, setServerError] = useState(false);
    const [showAll, setShowAll] = useState(true);
    const [isoCodes, setIsoCodes] = useState([]);
    const {t} = useTranslation();

    useEffect(() => {
        updateGraph(['ALL'], {
            aggregateEvery: '5m',
            startTime: '-1w',
        });
    }, [])

    const updateGraph = (isoCodes, options) => {
        setFluxResponse(null);
        setServerError(false);

        getCountryTrendAPI(isoCodes, options).then(res => {
            setFluxResponse(res.data);
        }).catch(error => {
            setServerError(true);
        })
    }

    const handleUpdateGraphOption = (options) => {
        const resultIsoCodes = [];
        if (showAll) resultIsoCodes.push('ALL');

        resultIsoCodes.push(...isoCodes);
        if (resultIsoCodes.length === 0) {
            setFluxResponse(null);
            toast.warn(t('all-stats.users.graph.empty-country'));
            return;
        }

        updateGraph(resultIsoCodes, options);
    }

    return (
        <div className="container">
            <div className="bg-body-tertiary rounded" style={{padding: "20px", marginTop: "20px"}}>
                <h3 className="col-12 text-center">{t('all-stats.users.title')}</h3>

                <div className="col-12 mb-3">
                    <div className="input-group">
                        <label className="col-form-label" style={{width: '160px'}}>
                            {t('all-stats.users.show-all.name')}
                        </label>
                        <div className="form-check form-switch mt-1">
                            <input type="checkbox" className="form-check-input" id="show-all"
                                   checked={showAll} onChange={() => setShowAll(!showAll)}/>
                            <label className="form-check-label" htmlFor="show-all"/>
                        </div>
                    </div>
                </div>

                <div className="col-12 mb-3">
                    <div className="input-group">
                        <label className="col-form-label" htmlFor="users-compare-country" style={{width: '160px'}}>
                            {t('all-stats.users.select-compare-country.name')}
                        </label>
                        <CountrySelect
                            value={isoCodes}
                            onChange={setIsoCodes}
                        />
                    </div>
                </div>

                <div className="col-12">
                    <GraphOption onUpdate={handleUpdateGraphOption}/>

                    {!fluxResponse && !isServerError && <Alert variant="info" style={{width: "100%"}}>
                        {t('server-info.graph.loading')}
                    </Alert>}
                    {isServerError && <Alert variant="danger" style={{width: "100%"}}>
                        {t('general.server-error')}
                    </Alert>}

                    {!isServerError && fluxResponse && <TrendGraph
                        layers={[
                            {
                                type: "line",
                                x: "_time",
                                y: "_value",
                                fill: ['iso_code'],
                                lineWidth: 2,
                            }
                        ]}
                        fluxResponse={fluxResponse}
                    />}
                </div>
            </div>

            <div className="bg-body-tertiary rounded" style={{padding: "20px", marginTop: "20px"}}>
                <h3 className="col-12 text-center">{t('all-stats.mod-loader.title')}</h3>
                <div className="col-12">
                    <div id="mod-loader-chart">
                        <div style={{margin: '10px'}}>
                            <ModLoaderChart/>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Stats;
