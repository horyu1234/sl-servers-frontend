import React from 'react';
import {useTranslation} from "react-i18next";

const NotFound = () => {
    const {t} = useTranslation();

    return (
        <div className="container">
            <div className="bg-body-tertiary rounded" style={{padding: "20px", marginTop: "20px"}}>
                {t('general.not-found')}
            </div>
        </div>
    )
}

export default NotFound;
