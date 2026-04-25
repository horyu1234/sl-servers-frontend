import React from 'react';
import languages from "../../data/language.json";
import thirdPartyLicenses from "../../data/third-party-licenses.json";
import {groupBy} from "lodash";
import {Alert} from "react-bootstrap";

const Credit = () => {
    const thirdPartyNames = Object.keys(thirdPartyLicenses);
    const thirdPartyLicenseList = thirdPartyNames.map(thirdPartyName => {
        const thirdPartyLc = thirdPartyLicenses[thirdPartyName];
        thirdPartyLc.name = thirdPartyName;

        return thirdPartyLc;
    });

    const groupedLicenses = groupBy(thirdPartyLicenseList, 'licenses')

    return (
        <>
            <div className="bg-body-tertiary rounded" style={{padding: '20px', marginTop: '20px'}}>
                <h1 className="text-center">Site localization contributors</h1>
                <ul>
                    {languages.map(language => (
                        <React.Fragment key={language.code}>
                            <li>{language.name}</li>
                            {language.contributors.length > 0 && <ul>
                                {language.contributors.map((contributor, idx) => (
                                    <li key={idx}>{contributor}</li>
                                ))}
                            </ul>}
                        </React.Fragment>
                    ))}
                </ul>
            </div>
            <div className="bg-body-tertiary rounded" style={{padding: '20px', marginTop: '20px'}}>
                <h1 className="text-center">Third Party Licenses</h1>

                {Object.keys(groupedLicenses).map((licenseName, licenseIdx) => (
                    <React.Fragment key={licenseIdx}>
                        <Alert variant="primary" className="mb-0 mt-4">
                            {licenseName}
                        </Alert>

                        {groupedLicenses[licenseName].map((thirdParty, thirdPartyIdx) => (
                            <span key={`${licenseIdx}-${thirdPartyIdx}`}
                                  className="me-3">
                            {thirdParty.name} <a
                                href={thirdParty.licenseUrl} target="_blank"
                                rel="noreferrer">License</a>
                        </span>
                        ))}
                    </React.Fragment>
                ))}
            </div>
        </>
    )
}

export default Credit;
