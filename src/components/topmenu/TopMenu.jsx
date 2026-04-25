import React from 'react';
import {Form, Nav, Navbar, Container} from "react-bootstrap";
import {NavLink} from "react-router-dom";
import {useTranslation} from "react-i18next";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faChartPie, faList, faMap, faGears, faCode} from "@fortawesome/free-solid-svg-icons";
import LanguageSelect from "./LanguageSelect";
import SiSelect from "./SiSelect";

const TopMenu = () => {
    const {t} = useTranslation();

    return (
        <Navbar expand="lg" variant="dark" className="navbar-main py-2" sticky="top">
            <Container fluid>
                <Navbar.Brand href="/" className="d-flex align-items-center">
                    <img 
                        src="/favicon-32x32.png" 
                        alt="Logo" 
                        width="24" 
                        height="24" 
                        className="d-inline-block align-top me-2" 
                    />
                    <span>{t('navbar.title')}</span>
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav"/>
                <Navbar.Collapse id="basic-navbar-nav" className="justify-content-between">
                    <Nav>
                        <NavLink className="nav-link px-3" end to="/">
                            <FontAwesomeIcon icon={faList} className="me-3"/> {t('navbar.server-list')}
                        </NavLink>
                        <NavLink className="nav-link px-3" to="/stats">
                            <FontAwesomeIcon icon={faChartPie} className="me-3"/> {t('navbar.all-stats')}
                        </NavLink>
                        <NavLink className="nav-link px-3" to="/map">
                            <FontAwesomeIcon icon={faMap} className="me-3"/> {t('navbar.all-server-map')}
                        </NavLink>
                        <NavLink className="nav-link px-3" to="/api">
                            <FontAwesomeIcon icon={faGears} className="me-3"/> API
                        </NavLink>
                        <NavLink className="nav-link px-3" to="/credit">
                            <FontAwesomeIcon icon={faCode} className="me-3"/> {t('navbar.credit') || 'Credit'}
                        </NavLink>
                    </Nav>
                    
                    <Nav className="top-menu-select-group">
                        <div className="selector-item px-3 py-1 border-start border-secondary d-flex align-items-center">
                            <div className="me-2 text-light select-label">{t('navbar.language')}</div>
                            <LanguageSelect/>
                        </div>
                        <div className="selector-item px-3 py-1 border-start border-secondary d-flex align-items-center">
                            <div className="me-2 text-light select-label">{t('navbar.unit')}</div>
                            <div style={{minWidth: "140px"}}>
                                <SiSelect/>
                            </div>
                        </div>
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    )
}

export default TopMenu;
