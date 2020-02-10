import React, {Component} from 'react';
import './App.css';
import TorrestSideNav, {snAll, snSettings} from "./components/SideNav";
import Settings, {getSettings} from "./components/Settings";
import Torrents from "./components/Torrents";
import styled from 'styled-components';
import '@fortawesome/fontawesome-free/css/all.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import {withAlert} from "react-alert";
import axios from "axios";

const Main = styled.main`
    position: relative;
    transition: all .2s;
    margin-left: ${props => (props.expanded ? 240 : 64)}px;
`;

const Disable = () => (<div style={{
    zIndex: 2001,
    position: "fixed",
    background: "black",
    width: "100%",
    height: "100%",
    opacity: 0.5
}}/>);

class App extends Component {
    constructor(props) {
        super(props);

        this.state = {
            shutdown: false,
            paused: false,
            expanded: false,
            selected: snAll
        };

        this.settings = getSettings();
    }

    setShutdown = () => {
        axios.get(`${this.settings.baseUrl}/shutdown`)
            .then(() => this.setState({shutdown: true}))
            .catch((e) => {
                console.log(e);
                this.props.alert.error("Failed shutting down");
            });
    };

    setExpanded = expanded => {
        this.setState({expanded: expanded});
    };

    setSelected = selected => {
        this.setState({selected: selected});
    };

    updatePaused = () => {
        const paused = this.state.paused;
        axios.get(`${this.settings.baseUrl}/${paused ? "resume" : "pause"}`)
            .then(() => {
                this.setState({paused: !paused});
                this.props.alert.show(`Service ${paused ? "resumed" : "paused"}`);
            })
            .catch((e) => {
                console.log(e);
                this.props.alert.error(`Failed ${paused ? "resuming" : "pausing"}`);
            });
    };

    renderSelected() {
        switch (this.state.selected) {
            case snAll:
                return <Torrents settings={this.settings} alert={this.props.alert}/>;
            case snSettings:
                return <Settings settings={this.settings} alert={this.props.alert}/>;
            default:
        }
        return ""
    }

    render() {
        return (
            <div className="App">
                {this.state.shutdown && <Disable/>}
                <TorrestSideNav
                    selected={this.state.selected}
                    paused={this.state.paused}
                    setSelected={this.setSelected}
                    setExpanded={this.setExpanded}
                    onPause={this.updatePaused}
                    onShutdown={this.setShutdown}
                />
                <Main expanded={this.state.expanded}>
                    {this.renderSelected()}
                </Main>
            </div>
        );
    }
}

export default withAlert()(App)