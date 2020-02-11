import React, {PureComponent} from "react";
import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import {CustomFormControl, OverlayTooltip, CircleButton, CustomModal} from "./BootsrapUtils";
import axios from "axios";

export default class Torrents extends PureComponent {
    state = {
        showMagnetModal: false
    };

    setMagnetUriRef = ref => this.magnetUri = ref;
    setUploadRef = ref => this.upload = ref;
    addFileOnClick = () => this.upload.click();
    showMagnetModal = () => this.setState({showMagnetModal: true});
    hideMagnetModal = () => this.setState({showMagnetModal: false});
    magnetModalOnKeyPress = event => {
        if (event.key === "Enter") {
            this.onAddMagnetUri()
        }
    };

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

    onAddMagnetUri = () => {
        if (this.magnetUri.value === "") {
            this.props.alert.error("Empty magnet URI");
        } else {
            axios.get(`${this.props.settings.baseUrl}/add/magnet`, {params: {uri: this.magnetUri.value}})
                .then(() => {
                    this.props.alert.show("Magnet added");
                })
                .catch(() => {
                    this.props.alert.error("Failed adding magnet");
                });
            this.hideMagnetModal();
        }
    };

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.state.showMagnetModal) {
            this.magnetUri.focus();
        }
    }

    render() {
        return (
            <div>
                <Navbar ref={this.navRef} bg="dark" variant="dark" expand="sm" style={{opacity: 0.9}}>
                    <Navbar.Brand>Torrest - all</Navbar.Brand>
                    <Navbar.Toggle/>
                    <Navbar.Collapse>
                        <input type="file"
                               accept=".torrent"
                               ref={this.setUploadRef}
                               onChange={this.onFileUpload}
                               style={{display: "none"}}/>
                        <OverlayTooltip message="Add file">
                            <CircleButton variant="outline-light" onClick={this.addFileOnClick}>
                                <i className="fa fa-file-upload"/>
                            </CircleButton>
                        </OverlayTooltip>
                        <OverlayTooltip message="Add magnet">
                            <CircleButton variant="outline-light" onClick={this.showMagnetModal}>
                                <i className="fa fa-link"/>
                            </CircleButton>
                        </OverlayTooltip>
                        <Nav className="mr-auto"/>
                        <OverlayTooltip message="Remove torrent">
                            <CircleButton variant="outline-light"><i className="fa fa-minus"/></CircleButton>
                        </OverlayTooltip>
                        <OverlayTooltip message="Pause torrent">
                            <CircleButton variant="outline-light"><i className="fa fa-pause"/></CircleButton>
                        </OverlayTooltip>
                        <OverlayTooltip message="Play movie">
                            <CircleButton variant="outline-light"><i className="fa fa-play-circle"/></CircleButton>
                        </OverlayTooltip>
                    </Navbar.Collapse>
                </Navbar>
                <CustomModal
                    show={this.state.showMagnetModal}
                    onHide={this.hideMagnetModal}
                    size="lg"
                    aria-labelledby="contained-modal-title-vcenter"
                    centered
                >
                    <Modal.Header style={{borderBottom: "0px"}} closeButton>
                        <Modal.Title>Add magnet</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <CustomFormControl
                            type="text"
                            ref={this.setMagnetUriRef}
                            placeholder="Magnet URI"
                            aria-label="Magnet URI"
                            onKeyPress={this.magnetModalOnKeyPress}
                            required
                        />
                    </Modal.Body>
                    <Modal.Footer style={{borderTop: "0px"}}>
                        <Button variant="outline-info" onClick={this.onAddMagnetUri}>Add</Button>
                        <Button variant="outline-info" onClick={this.hideMagnetModal}>Close</Button>
                    </Modal.Footer>
                </CustomModal>
            </div>
        )
    }
}