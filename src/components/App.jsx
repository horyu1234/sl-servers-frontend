import React from 'react';
import {BrowserRouter, Route, Routes} from 'react-router-dom';
import Container from "./Container";

const Info = React.lazy(() => import('../pages/info/Info'));
const List = React.lazy(() => import('../pages/list/List'));
const Map = React.lazy(() => import('../pages/map/Map'));
const Stats = React.lazy(() => import('../pages/stats/Stats'));
const Credit = React.lazy(() => import('../pages/credit/Credit'));
const Api = React.lazy(() => import('../pages/api/Api'));
const NotFound = React.lazy(() => import('../pages/NotFound'));

const Loading = () => (
    <div className="d-flex justify-content-center align-items-center" style={{height: '100vh'}}>
        <div className="spinner-border text-primary" role="status" style={{width: '3rem', height: '3rem'}}>
            <span className="visually-hidden">Loading...</span>
        </div>
    </div>
);

const App = () => (
    <BrowserRouter>
        <React.Suspense fallback={<Loading />}>
            <Routes>
                <Route path="/" element={<Container view={<List/>}/>}/>
                <Route path="/servers/:serverId" element={<Container view={<Info/>}/>}/>
                <Route path="/stats" element={<Container view={<Stats/>}/>}/>
                <Route path="/map" element={<Container view={<Map/>}/>}/>
                <Route path="/credit" element={<Container view={<Credit/>}/>}/>
                <Route path="/api" element={<Container view={<Api/>}/>}/>
                <Route path="*" element={<Container view={<NotFound/>}/>}/>
            </Routes>
        </React.Suspense>
    </BrowserRouter>
);

export default App;
