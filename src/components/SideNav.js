import React, {PureComponent} from "react";
import SideNav, {Nav, NavIcon, NavItem, NavText, Toggle} from "@trendmicro/react-sidenav";
import "@trendmicro/react-sidenav/dist/react-sidenav.css";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"
import styled from 'styled-components';

export const snAll = "all";
export const snSettings = "settings";
export const snPauseResume = "pause_resume";
export const snShutdown = "shutdown";

const StyledSideNav = styled(SideNav)`
    position: relative;
    float: left;
    min-height: 100vh;
    background-color: #343a40;
    opacity: 0.9;
`;
StyledSideNav.defaultProps = SideNav.defaultProps;

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

const Icon = styled(FontAwesomeIcon)`
    font-size: 1.75em;
    vertical-align: middle;
`;

const Hr = styled.hr`
    border-top: 1px solid rgba(255,255,255,.3);
    margin: 8px;
`;

export default class TorrestSideNav extends PureComponent {
    onSelect = selected => this.props.setSelected(selected);
    onToggle = expanded => this.props.setExpanded(expanded);

    render() {
        return (
            <StyledSideNav
                onSelect={this.onSelect}
                onToggle={this.onToggle}>
                <Toggle id="toggle"/>
                <StyledNav defaultSelected={this.props.selected} id="nav">
                    <NavItem eventKey={snAll}>
                        <NavIcon>
                            <Icon icon="magnet"/>
                        </NavIcon>
                        <NavText>All</NavText>
                    </NavItem>
                    <Hr/>
                    <NavItem eventKey={snSettings}>
                        <NavIcon>
                            <Icon icon="cogs"/>
                        </NavIcon>
                        <NavText>Settings</NavText>
                    </NavItem>
                    <NavItem eventKey={snPauseResume} disabled={true} onClick={this.props.onPause}>
                        <NavIcon>
                            <Icon icon={this.props.paused ? "play" : "pause"}/>
                        </NavIcon>
                        <NavText>{this.props.paused ? "Resume" : "Pause"}</NavText>
                    </NavItem>
                    <NavItem eventKey={snShutdown} disabled={true} onClick={this.props.onShutdown}>
                        <NavIcon>
                            <Icon icon="power-off"/>
                        </NavIcon>
                        <NavText>Shutdown</NavText>
                    </NavItem>
                </StyledNav>
            </StyledSideNav>
        );
    }
}