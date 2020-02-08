import React, {Component, createRef} from "react";
import Container from "react-bootstrap/Container";
import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";
import Button from "react-bootstrap/Button";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import InputGroup from "react-bootstrap/InputGroup";
import FormControl from "react-bootstrap/FormControl";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import styled from "styled-components";

const CustomFormControl = styled(FormControl)`
    background-color: rgba(255,255,255,0.5);
    
    &&:focus {
        background-color: rgba(255,255,255,0.9);
    }
    
    &&:disabled {
        background-color: rgba(255,255,255,0.6);
    }
`;

export function getSettings() {
    const baseUrl = localStorage.getItem("baseUrl");
    const refreshRate = localStorage.getItem("refreshRate");
    const remember = Boolean(baseUrl && refreshRate);

    return {
        baseUrl: remember ? baseUrl : "http://localhost:8080",
        refreshRate: remember ? refreshRate : 1,
        remember: remember
    }
}

export default class Settings extends Component {
    constructor(props) {
        super(props);

        this.state = {
            minHeight: 0
        };

        this.settings = {...this.props.settings};
        this.navRef = createRef();
    }

    renderSaveTooltip(props) {
        return <Tooltip {...props} show={props.show.toString()}>Save settings</Tooltip>;
    }

    componentDidMount() {
        this.setState({minHeight: `calc(100vh - 2*${this.navRef.current.clientHeight}px)`})
    }

    onChangeValue = event => {
        this.settings[event.target.name] = event.target.value;
    };

    onChangeCheck = event => {
        this.settings[event.target.name] = event.target.checked;
    };

    saveSettings = () => {
        for (let key in this.settings) {
            // noinspection JSUnfilteredForInLoop
            if (this.settings[key] === "") {
                this.props.alert.error("Invalid settings");
                return
            }
        }

        for (let key in this.settings) {
            if (this.settings.remember) {
                // noinspection JSUnfilteredForInLoop
                localStorage.setItem(key, this.settings[key]);
            } else {
                // noinspection JSUnfilteredForInLoop
                localStorage.removeItem(key);
            }
            // noinspection JSUnfilteredForInLoop
            this.props.settings[key] = this.settings[key];
        }

        this.props.alert.show("Settings saved")
    };

    render() {
        return (
            <div>
                <Navbar ref={this.navRef} bg="dark" variant="dark" style={{opacity: 0.9}}>
                    <Navbar.Brand>Torrest - settings</Navbar.Brand>
                    <Nav className="mr-auto"/>
                    <OverlayTrigger
                        placement="bottom"
                        delay={{show: 1000, hide: 400}}
                        overlay={this.renderSaveTooltip}
                    >
                        <Button variant="outline-info" onClick={this.saveSettings}>Save</Button>
                    </OverlayTrigger>
                </Navbar>
                <Container fluid>
                    <Row className="p-4"
                         style={{minHeight: this.state.minHeight, display: "flex", alignItems: "center"}}>
                        <Col md={{span: 6, offset: 3}} xl={{span: 4, offset: 4}}>
                            <InputGroup className="mb-3">
                                <InputGroup.Prepend>
                                    <InputGroup.Text>Base URL</InputGroup.Text>
                                </InputGroup.Prepend>
                                <CustomFormControl
                                    type="text"
                                    placeholder="eg. http://localhost:8080"
                                    aria-label="Base URL"
                                    name="baseUrl"
                                    onChange={this.onChangeValue}
                                    defaultValue={this.settings.baseUrl}
                                    required
                                />
                            </InputGroup>
                            <InputGroup className="mb-3">
                                <InputGroup.Prepend>
                                    <InputGroup.Text>Refresh rate</InputGroup.Text>
                                </InputGroup.Prepend>
                                <CustomFormControl
                                    type="number"
                                    placeholder="eg. 1"
                                    aria-label="Refresh rate"
                                    name="refreshRate"
                                    onChange={this.onChangeValue}
                                    defaultValue={this.settings.refreshRate}
                                    required
                                />
                            </InputGroup>
                            <InputGroup>
                                <InputGroup.Prepend>
                                    <InputGroup.Text>Remember settings</InputGroup.Text>
                                </InputGroup.Prepend>
                                <CustomFormControl disabled={true}/>
                                <InputGroup.Append>
                                    <InputGroup.Checkbox
                                        defaultChecked={this.settings.remember}
                                        onChange={this.onChangeCheck}
                                        name="remember"
                                        aria-label="Remember settings"
                                    />
                                </InputGroup.Append>
                            </InputGroup>
                        </Col>
                    </Row>
                </Container>
            </div>
        );
    }
}