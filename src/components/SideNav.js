import React, {Component} from "react";
import SideNav, {Nav, NavIcon, NavItem, NavText, Toggle} from "@trendmicro/react-sidenav";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCogs, faMagnet, faPause, faPlay, faPowerOff} from "@fortawesome/free-solid-svg-icons";
import {library} from "@fortawesome/fontawesome-svg-core"
import "@trendmicro/react-sidenav/dist/react-sidenav.css";
import styled from 'styled-components';

library.add(faMagnet, faCogs, faPause, faPlay, faPowerOff);

export const snAll = "all";
export const snSettings = "settings";
export const snPauseResume = "pause_resume";
export const snShutdown = "shutdown";

const StyledNav = styled(Nav)`
    && [class*="sidenav-navitem--"],
    && [class*="sidenav-navitem--"]:hover {
        [class*="navitem--"] {
            [class*="navicon--"] {
                &, * {
                    color: white;
                }
            }
            [class*="navtext--"] {
                &, * {
                    color: white;
                }
            }
        }
    }
`;
StyledNav.defaultProps = Nav.defaultProps;

export default class TorrestSideNav extends Component {
    constructor(props) {
        super(props);

        this.state = {
            minHeight: 0
        };
    }

    componentDidMount() {
        this.setState({
            minHeight: document.getElementById('nav').clientHeight +
                document.getElementById('toggle').clientHeight
        })
    }

    render() {
        return (
            <SideNav style={{minHeight: this.state.minHeight, backgroundColor: "#343a40", opacity: 0.9}}
                     onSelect={selected => this.props.setSelected(selected)}
                     onToggle={expanded => this.props.setExpanded(expanded)}>
                <Toggle id="toggle"/>
                <StyledNav defaultSelected={this.props.selected} id="nav">
                    <NavItem eventKey={snAll}>
                        <NavIcon>
                            <FontAwesomeIcon icon={faMagnet} style={{fontSize: "1.75em", verticalAlign: "middle"}}/>
                        </NavIcon>
                        <NavText>All</NavText>
                    </NavItem>
                    <hr style={{borderTop: "1px solid rgba(255,255,255,.3)", margin: "8px 8px"}}/>
                    <NavItem eventKey={snSettings}>
                        <NavIcon>
                            <FontAwesomeIcon icon={faCogs} style={{fontSize: "1.75em", verticalAlign: "middle"}}/>
                        </NavIcon>
                        <NavText>Settings</NavText>
                    </NavItem>
                    <NavItem eventKey={snPauseResume} disabled={true} onClick={this.props.onPause}>
                        <NavIcon>
                            {this.props.paused ?
                                <FontAwesomeIcon icon={faPlay} style={{fontSize: "1.75em", verticalAlign: "middle"}}/> :
                                <FontAwesomeIcon icon={faPause} style={{fontSize: "1.75em", verticalAlign: "middle"}}/>}
                        </NavIcon>
                        <NavText>{this.props.paused ? "Resume" : "Pause"}</NavText>
                    </NavItem>
                    <NavItem eventKey={snShutdown} disabled={true} onClick={this.props.onShutdown}>
                        <NavIcon>
                            <FontAwesomeIcon icon={faPowerOff} style={{fontSize: "1.75em", verticalAlign: "middle"}}/>
                        </NavIcon>
                        <NavText>Shutdown</NavText>
                    </NavItem>
                </StyledNav>
            </SideNav>
        );
    }
}