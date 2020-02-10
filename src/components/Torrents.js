import React, {Component} from "react";
import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";
import Button from "react-bootstrap/Button";
import styled from "styled-components";
import OverlayTooltip from "./OverlayTooltip";
import axios from "axios";

const NavButton = styled(Button)`
    margin: 0px 5px;
    border-radius: 19px;
    height: 38px;
    width: 38px;
    font-size: 16px;
    padding: 6px;
    text-align: center;
`;

export default class Torrents extends Component {
    onFileUpload = () => {
        const file = this.upload.files[0];
        let formData = new FormData();
        formData.append("torrent", file);
        axios.post(`${this.props.settings.baseUrl}/add/torrent`,
            formData, {headers: {"Content-Type": "multipart/form-data"}})
            .then(() => {
                this.props.alert.show("Torrent added");
            })
            .catch(() => {
                this.props.alert.error("Failed adding torrent");
            })
    };

    render() {
        return (
            <div>
                <Navbar ref={this.navRef} bg="dark" variant="dark" expand="sm" style={{opacity: 0.9}}>
                    <Navbar.Brand>Torrest - all</Navbar.Brand>
                    <Navbar.Toggle/>
                    <Navbar.Collapse>
                        <input type="file"
                               accept=".torrent"
                               ref={ref => this.upload = ref}
                               onChange={this.onFileUpload}
                               style={{display: "none"}}/>
                        <OverlayTooltip message="Add file">
                            <NavButton variant="outline-light" onClick={() => this.upload.click()}>
                                <i className="fa fa-file-upload"/>
                            </NavButton>
                        </OverlayTooltip>
                        <OverlayTooltip message="Add magnet">
                            <NavButton variant="outline-light"><i className="fa fa-link"/></NavButton>
                        </OverlayTooltip>
                        <Nav className="mr-auto"/>
                        <OverlayTooltip message="Remove torrent">
                            <NavButton variant="outline-light"><i className="fa fa-minus"/></NavButton>
                        </OverlayTooltip>
                        <OverlayTooltip message="Pause torrent">
                            <NavButton variant="outline-light"><i className="fa fa-pause"/></NavButton>
                        </OverlayTooltip>
                        <OverlayTooltip message="Play movie">
                            <NavButton variant="outline-light"><i className="fa fa-play-circle"/></NavButton>
                        </OverlayTooltip>
                    </Navbar.Collapse>
                </Navbar>
            </div>
        )
    }
}