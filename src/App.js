import React, {Component} from 'react';
import './App.css';
import TorrestSideNav, {snAll, snSettings} from "./components/SideNav";
import Settings, {getSettings} from "./components/Settings";
import styled from 'styled-components';
import 'bootstrap/dist/css/bootstrap.min.css';
import {withAlert} from "react-alert";

const Main = styled.main`
    position: relative;
    transition: all .2s;
    margin-left: ${props => (props.expanded ? 240 : 64)}px;
`;

const Disable = () => (<div style={{
    zIndex: 2000,
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
        this.setState({shutdown: true});
    };

    setExpanded = expanded => {
        this.setState({expanded: expanded});
    };

    setSelected = selected => {
        this.setState({selected: selected});
    };

    updatePaused = () => {
        const paused = this.state.paused;
        if (paused) {
            // TODO: Resume
            this.props.alert.show("Service resumed")
        } else {
            // TODO: Pause
            this.props.alert.show("Service paused")
        }
        this.setState({paused: !paused});
    };

    renderSelected() {
        switch (this.state.selected) {
            case snAll:
                // TODO
                return "";
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