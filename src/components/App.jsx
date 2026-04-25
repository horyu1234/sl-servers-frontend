import React from 'react';
import {BrowserRouter, Route, Routes} from 'react-router-dom';
import Container from "./shell/Container";

const Info = React.lazy(() => import('../pages/info/Info'));
const List = React.lazy(() => import('../pages/list/List'));
const Map = React.lazy(() => import('../pages/map/Map'));
const Stats = React.lazy(() => import('../pages/stats/Stats'));
const Credit = React.lazy(() => import('../pages/credit/Credit'));
const Api = React.lazy(() => import('../pages/api/Api'));
const NotFound = React.lazy(() => import('../pages/NotFound'));

const Loading = () => (
    <div className="flex items-center justify-center" style={{height: '100vh'}}>
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
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
