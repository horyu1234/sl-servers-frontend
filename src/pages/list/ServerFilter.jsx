import React from "react";
import CountrySelect from "../../components/country-select/CountrySelect";
import YesNoFilter from "../../components/YesNoFilter";
import SortType from "../../components/SortType";
import {useTranslation} from "react-i18next";
import {connect} from "react-redux";
import {bindActionCreators} from "@reduxjs/toolkit";
import * as serverFilterActions from "../../modules/serverFilter";
import * as serverListActions from "../../modules/serverList";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faArrowsRotate} from "@fortawesome/free-solid-svg-icons";

const ServerFilter = (
    {
        serverListFetching,
        searchFilter,
        countryFilter,
        hideEmptyServer,
        hideFullServer,
        friendlyFire,
        whitelist,
        modded,
        sort,

        ServerFilterActions,
        ServerListActions
    }
) => {
    const {t} = useTranslation();

    const updateServerList = () => {
        if (serverListFetching) return;
        ServerListActions.getServerList();
    }

    const handleChangeSearchFilter = (e) => {
        ServerFilterActions.changeSearch(e.target.value);
    }

    const handleKeyPressSearchFilter = (e) => {
        if (e.key !== 'Enter') return;
        updateServerList();
    }

    const handleChangeCountryFilter = (value) => {
        ServerFilterActions.changeCountry(value);
        updateServerList();
    }

    const handleChangeHideEmpty = (e) => {
        ServerFilterActions.changeHideEmpty(e.target.checked);
        updateServerList();
    }

    const handleChangeHideFull = (e) => {
        ServerFilterActions.changeHideFull(e.target.checked);
        updateServerList();
    }

    const handleChangeFriendlyFire = (value) => {
        ServerFilterActions.changeFriendlyFire(value);
        updateServerList();
    }

    const handleChangeWhitelist = (value) => {
        ServerFilterActions.changeWhitelist(value);
        updateServerList();
    }

    const handleChangeModded = (value) => {
        ServerFilterActions.changeModded(value);
        updateServerList();
    }

    const handleChangeSortType = (value) => {
        ServerFilterActions.changeSortType(value);
        updateServerList();
    }

    return (
        <div className="filter-container card main-card">
            <div className="card-body py-3">
                <div className="row">
                    <div id="search-option" className="col-sm-12 col-md-8">
                        <div className="form-group mb-3">
                            <div className="input-group">
                                <label className="col-form-label search-option-name fw-bold" htmlFor="server-search">
                                    {t('filter-option.server-search.name')}
                                </label>

                                <input type="text" className="form-control"
                                    placeholder={t('filter-option.server-search.placeholder')}
                                    value={searchFilter} onChange={handleChangeSearchFilter}
                                    onKeyDown={handleKeyPressSearchFilter}
                                />

                                <div className="input-group-append">
                                    <button className="btn btn-primary" type="button" onClick={updateServerList}>
                                        {t('filter-option.server-search.search-btn')}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="form-group mb-3">
                            <div className="input-group text-start">
                                <label className="col-form-label search-option-name fw-bold" htmlFor="country-filter">
                                    {t('filter-option.country-filter')}
                                </label>
                                <CountrySelect
                                    value={countryFilter}
                                    onChange={handleChangeCountryFilter}
                                />
                            </div>
                        </div>

                        <div className="filter-options row">
                            <div className="col-sm-12 col-md-4">
                                <div className="form-check form-switch mb-2">
                                    <input type="checkbox" className="form-check-input" id="hide-empty-server"
                                        checked={hideEmptyServer} onChange={handleChangeHideEmpty}
                                    />
                                    <label className="form-check-label" htmlFor="hide-empty-server">
                                        {t('filter-option.hide-empty')}
                                    </label>
                                </div>

                                <div className="form-check form-switch">
                                    <input type="checkbox" className="form-check-input" id="hide-full-server"
                                        checked={hideFullServer} onChange={handleChangeHideFull}
                                    />
                                    <label className="form-check-label" htmlFor="hide-full-server">
                                        {t('filter-option.hide-full')}
                                    </label>
                                </div>
                            </div>

                            <div className="col-sm-12 col-md-6 col-lg-4 mt-sm-3"/>
                            <div className="col-sm-12 col-md-6 col-lg-4 mt-sm-3 d-flex justify-content-end">
                                <button className="btn btn-primary"
                                    type="button"
                                    onClick={updateServerList}
                                    disabled={serverListFetching}
                                >
                                    <FontAwesomeIcon icon={faArrowsRotate} className="me-3"/> 
                                    {t(`filter-option.${serverListFetching ? 'refreshing' : 'refresh-btn'}`)}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="col-sm-12 col-md-4 mt-md-0 mt-4" id="search-filter">
                        <div className="filter-options-title mb-3 fw-bold border-bottom pb-2">
                            {t('filter-option.filter-options-title')}
                        </div>
                        
                        <div className="yes-no-filter mb-3">
                            <YesNoFilter
                                title={t('filter-option.yes-no-filter.friendly-fire')}
                                value={friendlyFire}
                                onChange={handleChangeFriendlyFire}
                            />
                        </div>

                        <div className="yes-no-filter mb-3">
                            <YesNoFilter
                                title={t('filter-option.yes-no-filter.whitelist')}
                                value={whitelist}
                                onChange={handleChangeWhitelist}
                            />
                        </div>

                        <div className="yes-no-filter mb-3">
                            <YesNoFilter
                                title={t('filter-option.yes-no-filter.modded')}
                                value={modded}
                                onChange={handleChangeModded}
                            />
                        </div>

                        <div className="yes-no-filter">
                            <SortType
                                value={sort}
                                onChange={handleChangeSortType}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default connect(
    (state) => ({
        serverListFetching: state.serverList.fetching,
        searchFilter: state.serverFilter.searchFilter,
        countryFilter: state.serverFilter.countryFilter,
        hideEmptyServer: state.serverFilter.hideEmptyServer,
        hideFullServer: state.serverFilter.hideFullServer,
        friendlyFire: state.serverFilter.friendlyFire,
        whitelist: state.serverFilter.whitelist,
        modded: state.serverFilter.modded,
        sort: state.serverFilter.sort
    }),
    (dispatch) => ({
        ServerFilterActions: bindActionCreators(serverFilterActions, dispatch),
        ServerListActions: bindActionCreators(serverListActions, dispatch)
    })
)(ServerFilter);