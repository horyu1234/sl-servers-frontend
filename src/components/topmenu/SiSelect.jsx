import React, {useMemo} from 'react';
import Select from "react-select";
import getStyles from "../SelectCustomStyles";
import {connect} from "react-redux";
import {bindActionCreators} from "@reduxjs/toolkit";
import * as settingActions from "../../modules/setting";

const SiSelect = (
    {
        si,

        SettingActions
    }
) => {
    const customStyles = useMemo(() => getStyles(140), []);
    const siOptions = [{
        "value": "km",
        "label": "Kilometers (km)"
    }, {
        "value": "mi",
        "label": "Miles (mi)"
    }];

    const handleChangeSi = (option) => {
        SettingActions.changeSi(option.value);
    }

    return (
        <Select
            classNamePrefix="select"
            isSearchable
            name="lang-select"
            options={siOptions}
            styles={customStyles}

            value={siOptions.find(option => option.value === si)}
            onChange={handleChangeSi}
        />
    );
}

export default connect(
    (state) => ({
        si: state.setting.si
    }),
    (dispatch) => ({
        SettingActions: bindActionCreators(settingActions, dispatch)
    })
)(SiSelect);
