import React, {createRef, PureComponent} from "react";
import Container from "react-bootstrap/Container";
import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";
import Button from "react-bootstrap/Button";
import InputGroup from "react-bootstrap/InputGroup";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import {CustomFormControl, OverlayTooltip} from "./BootsrapUtils";

export function getSettings() {
    const baseUrl = localStorage.getItem("baseUrl");
    const refreshRate = localStorage.getItem("refreshRate");
    const downloadOnAdd = localStorage.getItem("downloadOnAdd");
    const remember = Boolean(baseUrl && refreshRate && downloadOnAdd);

    return {
        baseUrl: remember ? baseUrl : "http://localhost:8080",
        // TODO: Add refresh rate to getData
        refreshRate: remember ? refreshRate : 1,
        downloadOnAdd: remember ? downloadOnAdd === "true" : false,
        remember: remember
    }
}

export default class Settings extends PureComponent {
    constructor(props) {
        super(props);
        this.settings = {...this.props.settings};
        this.navRef = createRef();
    }

    state = {
        minHeight: 0
    };

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
                    <OverlayTooltip message="Save settings">
                        <Button variant="outline-info" onClick={this.saveSettings}>Save</Button>
                    </OverlayTooltip>
                </Navbar>
                <Container fluid>
                    <Row className="p-4"
                         style={{minHeight: this.state.minHeight, display: "flex", alignItems: "center"}}>
                        <Col md={{span: 6, offset: 3}} xl={{span: 4, offset: 4}}>
                            <InputGroup className="mb-3">
                                <InputGroup.Text>Base URL</InputGroup.Text>
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
                                <InputGroup.Text>Refresh rate</InputGroup.Text>
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
                            <InputGroup className="mb-3">
                                <InputGroup.Text>Start download after addition</InputGroup.Text>
                                <CustomFormControl disabled={true}/>
                                <InputGroup.Checkbox
                                    defaultChecked={this.settings.downloadOnAdd}
                                    onChange={this.onChangeCheck}
                                    name="downloadOnAdd"
                                    aria-label="Start download after addition"
                                />
                            </InputGroup>
                            <InputGroup>
                                <InputGroup.Text>Remember settings</InputGroup.Text>
                                <CustomFormControl disabled={true}/>
                                <InputGroup.Checkbox
                                    defaultChecked={this.settings.remember}
                                    onChange={this.onChangeCheck}
                                    name="remember"
                                    aria-label="Remember settings"
                                />
                            </InputGroup>
                        </Col>
                    </Row>
                </Container>
            </div>
        );
    }
}