import React, {useEffect} from 'react';
import {connect} from "react-redux";
import {bindActionCreators} from "@reduxjs/toolkit";
import {Container, Row, Col, Card} from "react-bootstrap";
import ServerFilter from "./ServerFilter";
import ServerStats from "./ServerStats";
import ServerList from "./ServerList";
import * as serverListActions from '../../modules/serverList';

import "./list.css";

const List = (
    {
        ServerListActions
    }
) => {
    useEffect(() => {
        ServerListActions.getServerList();
    }, [ServerListActions]);

    return (
        <Container fluid className="main-container">
            <Row className="mb-4">
                <Col>
                    <ServerFilter/>
                </Col>
            </Row>
            
            <Row className="mb-4">
                <Col>
                    <ServerStats/>
                </Col>
            </Row>
            
            <Row className="mb-4">
                <Col>
                    <Card className="main-card">
                        <Card.Body>
                            <ServerList/>
                            
                            <div className="mt-3">
                                <small className="maxmind-credit">
                                    This product includes GeoLite2 data created by MaxMind, available from <a
                                    href="https://www.maxmind.com" target="_blank" rel="noreferrer">maxmind.com</a>
                                </small>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    )
}

export default connect(
    (state) => ({}),
    (dispatch) => ({
        ServerListActions: bindActionCreators(serverListActions, dispatch)
    })
)(List);
