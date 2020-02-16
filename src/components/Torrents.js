import React, {PureComponent} from "react";
import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Container from "react-bootstrap/Container";
import Table from "react-bootstrap/Table";
import {CircleButton, CustomFormControl, CustomModal, OverlayTooltip} from "./BootsrapUtils";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"
import axios from "axios";

function humanFileSize(size) {
    let i = size === 0 ? 0 : Math.floor(Math.log(size) / Math.log(1024));
    return Number((size / Math.pow(1024, i)).toFixed(2)) + " " + ["B", "kB", "MB", "GB", "TB"][i];
}

function statusString(state) {
    switch (state) {
        case 0:
            return "Queued";
        case 1:
            return "Checking";
        case 2:
            return "Finding";
        case 3:
            return "Downloading";
        case 4:
            return "Finished";
        case 5:
            return "Seeding";
        case 6:
            return "Allocating";
        case 7:
            return "Checking Resume Data";
        case 8:
            return "Paused";
        case 9:
            return "Buffering";
        default:
            return "Unknown";

    }
}

// noinspection JSUnresolvedVariable
const TorrentsTable = ({torrents, onClick}) => (
    <Table bordered hover responsive variant="dark"
           style={{backgroundColor: "rgba(52, 58, 64, 0.9)"}}>
        <thead>
        <tr>
            <th>Name</th>
            <th>Size</th>
            <th>Progress</th>
            <th>Status</th>
            <th>Rates (D/U)</th>
            <th>Seeds</th>
            <th>Peers</th>
        </tr>
        </thead>
        <tbody>
        {torrents.map(torrent =>
            <tr key={torrent.info_hash} id={torrent.info_hash} onClick={onClick}>
                <td>{torrent.status.name}</td>
                <td>{humanFileSize(torrent.status.total)}</td>
                <td>{torrent.status.progress.toFixed(2)}%</td>
                <td>{statusString(torrent.status.state)}</td>
                <td>{humanFileSize(torrent.status.download_rate)}/s {humanFileSize(torrent.status.upload_rate)}/s</td>
                <td>{torrent.status.seeders}/{torrent.status.seeders_total}</td>
                <td>{torrent.status.peers}/{torrent.status.peers_total}</td>
            </tr>
        )}
        </tbody>
    </Table>
);

export default class Torrents extends PureComponent {
    state = {
        showMagnetModal: false,
        torrents: [],
        selected: null
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

    tableRowOnClick = e => {
        const tr = e.target.parentElement;
        for (let elem of tr.parentElement.children) {
            elem.className = "";
        }
        tr.className = "highlighted";
        this.setState({selected: tr.id});
    };

    onFileUpload = () => {
        const file = this.upload.files[0];
        let formData = new FormData();
        formData.append("torrent", file);
        axios.post(`${this.props.settings.baseUrl}/add/torrent`,
            formData, {headers: {"Content-Type": "multipart/form-data"}})
            .then(() => {
                this.props.alert.show("Torrent added");
                this.getData();
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
                    this.getData();
                })
                .catch(() => {
                    this.props.alert.error("Failed adding magnet");
                });
            this.hideMagnetModal();
        }
    };

    getData = () => {
        axios.get(`${this.props.settings.baseUrl}/torrents/`, {params: {status: true}})
            .then(r => {
                let selected = this.state.selected;
                // noinspection JSUnresolvedVariable
                if (selected !== null && !r.data.some(t => t.info_hash === selected)) {
                    selected = null;
                }
                this.setState({torrents: r.data, selected: selected});
            })
            .catch(() => this.setState({torrents: [], selected: null}))
    };

    removeTorrent = () => {
        axios.get(`${this.props.settings.baseUrl}/torrents/${this.state.selected}/remove`)
            .then(() => this.getData())
            .catch(e => console.log(e))
    };

    pauseTorrent = () => {
        axios.get(`${this.props.settings.baseUrl}/torrents/${this.state.selected}/pause`)
            .then(() => {
                this.props.alert.show("Torrent paused");
                this.getData();
            })
            .catch(() => {
                this.props.alert.error("Failed pausing torrent");
            })
    };

    resumeTorrent = () => {
        axios.get(`${this.props.settings.baseUrl}/torrents/${this.state.selected}/resume`)
            .then(() => {
                this.props.alert.show("Torrent resumed");
                this.getData();
            })
            .catch(() => {
                this.props.alert.error("Failed resuming torrent");
            })
    };

    downloadTorrent = () => {
        axios.get(`${this.props.settings.baseUrl}/torrents/${this.state.selected}/download`)
            .then(() => {
                this.props.alert.show("Torrent downloading");
                this.getData();
            })
            .catch(() => {
                this.props.alert.error("Failed starting torrent");
            })
    };

    stopTorrent = () => {
        axios.get(`${this.props.settings.baseUrl}/torrents/${this.state.selected}/stop`)
            .then(() => {
                this.props.alert.show("Torrent stopped");
                this.getData();
            })
            .catch(() => {
                this.props.alert.error("Failed stopping torrent");
            })
    };

    showFiles = () => {
        // TODO: show files with stream options
    };

    componentDidMount() {
        this.getData();
        this.intervalID = setInterval(this.getData, 2000);
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.state.showMagnetModal) {
            this.magnetUri.focus();
        }
    }

    componentWillUnmount() {
        clearInterval(this.intervalID);
    }

    render() {
        // noinspection JSUnresolvedVariable
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
                                <FontAwesomeIcon icon="file-upload"/>
                            </CircleButton>
                        </OverlayTooltip>
                        <OverlayTooltip message="Add magnet">
                            <CircleButton variant="outline-light" onClick={this.showMagnetModal}>
                                <FontAwesomeIcon icon="link"/>
                            </CircleButton>
                        </OverlayTooltip>
                        <Nav className="mr-auto"/>
                        <OverlayTooltip message="Remove torrent">
                            <CircleButton
                                variant="outline-light"
                                onClick={this.removeTorrent}
                                disabled={this.state.selected === null}
                            >
                                <FontAwesomeIcon icon="minus"/>
                            </CircleButton>
                        </OverlayTooltip>
                        {this.state.selected !== null &&
                        this.state.torrents.some(t => t.info_hash === this.state.selected && t.status.state === 8) ?
                            <OverlayTooltip message="Resume torrent">
                                <CircleButton variant="outline-light" onClick={this.resumeTorrent}>
                                    <FontAwesomeIcon icon="play"/>
                                </CircleButton>
                            </OverlayTooltip> :
                            <OverlayTooltip message="Pause torrent">
                                <CircleButton
                                    variant="outline-light"
                                    onClick={this.pauseTorrent}
                                    disabled={this.state.selected === null}
                                >
                                    <FontAwesomeIcon icon="pause"/>
                                </CircleButton>
                            </OverlayTooltip>
                        }
                        {this.state.selected !== null &&
                        this.state.torrents.some(t => t.info_hash === this.state.selected && t.status.total === t.status.total_wanted) ?
                            <OverlayTooltip message="Stop downloading">
                                <CircleButton variant="outline-light" onClick={this.stopTorrent}>
                                    <FontAwesomeIcon icon="stop"/>
                                </CircleButton>
                            </OverlayTooltip> :
                            <OverlayTooltip message="Start downloading">
                                <CircleButton
                                    variant="outline-light"
                                    onClick={this.downloadTorrent}
                                    disabled={this.state.selected === null}
                                >
                                    <FontAwesomeIcon icon="download"/>
                                </CircleButton>
                            </OverlayTooltip>
                        }
                        <OverlayTooltip message="Torrent files">
                            <CircleButton
                                variant="outline-light"
                                onClick={this.showFiles}
                                disabled={this.state.selected === null}
                            >
                                <FontAwesomeIcon icon="file-alt"/>
                            </CircleButton>
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
                <Container style={{marginTop: "50px"}}>
                    <TorrentsTable torrents={this.state.torrents} onClick={this.tableRowOnClick}/>
                </Container>
            </div>
        )
    }
}