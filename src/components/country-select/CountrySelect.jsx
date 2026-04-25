import React, {useEffect, useMemo} from 'react';
import Select from 'react-select';
import getStyles from "../SelectCustomStyles";
import getCountryName from "../../i18n/i18n-countries";
import {useTranslation} from "react-i18next";
import {connect} from "react-redux";
import {bindActionCreators} from "@reduxjs/toolkit";
import * as countryListActions from "../../modules/countryList";
import Flag from 'react-world-flags'

import "./country-select.css";

const CountrySelect = (
    {
        countryFetching,
        isoCodes,

        value,
        onChange,

        CountryListActions
    }
) => {
    const {t} = useTranslation();

    const customStyles = useMemo(() => {
        return {
            ...getStyles(),
            container: (provided) => ({
                ...provided,
                flex: '1 1 auto',
                width: '1%'
            }),
            multiValue: (provided) => ({
                ...provided
            }),
            multiValueLabel: (provided) => ({
                ...provided,
                backgroundColor: '#adb5bd'
            }),
            multiValueRemove: (provided) => ({
                ...provided,
                cursor: 'pointer',
                backgroundColor: '#949ca3'
            })
        };
    }, []);

    useEffect(() => {
        CountryListActions.getCountryList();
    }, [CountryListActions])

    const countryOptions = isoCodes.map(isoCode => {
        const isoCodeName = getCountryName(isoCode);

        return {
            value: isoCode,
            label: isoCodeName || isoCode
        }
    });

    const findCountryOptions = () => {
        return countryOptions.filter(countryOption => {
            return value.includes(countryOption.value);
        })
    }

    const handleChangeCountryFilter = (options) => {
        onChange(options.map(option => option.value))
    }

    const selectedOptions = findCountryOptions();
    return (
        <Select
            closeMenuOnSelect={false}
            isMulti
            options={countryOptions}
            styles={customStyles}
            placeholder={t('select.placeholder')}
            noOptionsMessage={() => t('select.empty')}
            formatOptionLabel={country => (
                <div className="country-option">
                    <Flag code={country.value}/>
                    <span className="country-name">{country.label}</span>
                </div>
            )}
            isLoading={countryFetching}

            value={selectedOptions}
            onChange={handleChangeCountryFilter}
        />
    )
}

export default connect(
    (state) => ({
        countryFetching: state.countryList.fetching,
        isoCodes: state.countryList.data
    }),
    (dispatch) => ({
        CountryListActions: bindActionCreators(countryListActions, dispatch)
    })
)(CountrySelect);
