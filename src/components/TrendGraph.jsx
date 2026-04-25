import React from 'react';
import {Plot} from '@influxdata/giraffe';
import {useTranslation} from "react-i18next";
import getCountryName from "../i18n/i18n-countries";

const TrendGraph = ({layers, fluxResponse}) => {
    const {t} = useTranslation();

    const timeText = (unixTime) => {
        const time = new Date(unixTime);
        return time.toLocaleDateString() + ' ' + time.toLocaleTimeString();
    }

    const style = {
        height: "400px",
    };

    const config = {
        fluxResponse: fluxResponse,
        layers: layers,
        valueFormatters: {
            _time: time => timeText(time),
            _value: val => `${val}${t('server-info.graph.visitor-suffix') || ''}`,
            iso_code: isoCode => {
                if (isoCode === 'ALL') return t('all-stats.users.graph.all-country')

                const isoCodeName = getCountryName(isoCode);
                return isoCodeName || isoCode;
            },
        },
        yAxisLabel: t('server-info.graph.visitors'),
        legendFont: "1em 'Inter Variable', Inter",
        tickFont: "0.85em 'Inter Variable', Inter",
    };

    return (
        <div style={style}>
            <Plot config={config}/>
        </div>
    );
}

export default TrendGraph;
