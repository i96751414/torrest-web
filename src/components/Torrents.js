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
                <td>{torrent.name}</td>
                <td>{humanFileSize(torrent.size)}</td>
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

const FilesModal = ({title, show, onHide, files, onDownloadClick, onStopClick, onStreamClick}) => (
    <CustomModal
        show={show}
        onHide={onHide}
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        centered
    >
        <Modal.Header style={{borderBottom: "0px"}} closeButton>
            <Modal.Title>{title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <Table responsive>
                <tbody>
                {files.map(file =>
                    <tr key={file.id} id={file.id}>
                        <td className="align-middle">{file.id + 1} - {file.name}</td>
                        <td className="align-middle fit">
                            {file.status.priority === 0 ?
                                <OverlayTooltip message="Start downloading">
                                    <Button variant="outline-dark" onClick={onDownloadClick}>
                                        <FontAwesomeIcon icon="download"/>
                                    </Button>
                                </OverlayTooltip> :
                                <OverlayTooltip message="Stop downloading">
                                    <Button variant="outline-dark" onClick={onStopClick}>
                                        <FontAwesomeIcon icon="stop"/>
                                    </Button>
                                </OverlayTooltip>
                            }
                        </td>
                        <td className="align-middle fit">
                            <OverlayTooltip message="Start streaming">
                                <Button variant="outline-dark" onClick={onStreamClick}>
                                    <FontAwesomeIcon icon="play-circle"/>
                                </Button>
                            </OverlayTooltip>
                        </td>
                    </tr>
                )}
                </tbody>
            </Table>
        </Modal.Body>
    </CustomModal>
);

export default class Torrents extends PureComponent {
    state = {
        showMagnetModal: false,

        torrents: [],
        selected: null,

        showFilesModal: false,
        filesModalTitle: "",
        files: [],

        showPlayerModal: false,
        playerUrl: null
    };

    setInitMagnetUriRef = ref => this.initMagnetUri = ref;
    setModalMagnetUriRef = ref => this.modalMagnetUri = ref;
    setUploadRef = ref => this.upload = ref;
    addFileOnClick = () => this.upload.click();
    showMagnetModal = () => this.setState({showMagnetModal: true});
    hideMagnetModal = () => this.setState({showMagnetModal: false});

    initMagnetUriOnKeyPress = event => {
        if (event.key === "Enter") {
            this.onInitAddMagnetUri()
        }
    };

    modalMagnetUriOnKeyPress = event => {
        if (event.key === "Enter") {
            this.onModalAddMagnetUri()
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

    addMagnetUri = uri => {
        if (uri === "") {
            this.props.alert.error("Empty magnet URI");
        } else {
            axios.get(`${this.props.settings.baseUrl}/add/magnet`, {params: {uri}})
                .then(() => {
                    this.props.alert.show("Magnet added");
                    this.getData();
                })
                .catch(() => {
                    this.props.alert.error("Failed adding magnet");
                })
        }
    }

    onInitAddMagnetUri = () => this.addMagnetUri(this.initMagnetUri.value)

    onModalAddMagnetUri = () => {
        this.addMagnetUri(this.modalMagnetUri.value);
        this.hideMagnetModal()
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
            .catch(e => {
                console.log(e);
                this.props.alert.error("Failed removing torrent");
            })
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

    hideFilesModal = () => {
        clearInterval(this.getFilesInterval);
        this.getFilesInterval = undefined;
        this.setState({showFilesModal: false});
    };

    showFilesModal = () => {
        // noinspection JSUnresolvedVariable
        const torrent = this.state.torrents.find(t => t.info_hash === this.state.selected);
        if (torrent) {
            this.getFiles(() => {
                this.setState({showFilesModal: true, filesModalTitle: torrent.name});
                this.getFilesInterval = setInterval(this.getFiles, 2000);
            }, () => {
                this.props.alert.error("Failed to get files");
            });
        }
    };

    onFileDownloadClick = e => {
        const id = e.currentTarget.parentElement.parentElement.id;
        axios.get(`${this.props.settings.baseUrl}/torrents/${this.state.selected}/files/${id}/download`)
            .then(() => {
                this.props.alert.show("File downloading");
                this.getFiles();
            })
            .catch(() => this.props.alert.error("Failed starting file download"))
    };

    onFileStopClick = e => {
        const id = e.currentTarget.parentElement.parentElement.id;
        axios.get(`${this.props.settings.baseUrl}/torrents/${this.state.selected}/files/${id}/stop`)
            .then(() => {
                this.props.alert.show("File stopped");
                this.getFiles();
            })
            .catch(() => this.props.alert.error("Failed stopping file"))
    };

    getFiles = (onSuccess, onError) => {
        if (this.state.selected === null) {
            this.hideFilesModal();
        } else {
            axios.get(`${this.props.settings.baseUrl}/torrents/${this.state.selected}/files`, {params: {status: true}})
                .then(r => {
                    this.setState({files: r.data});
                    onSuccess && onSuccess();
                })
                .catch(() => {
                    this.hideFilesModal();
                    onError && onError();
                })
        }
    };

    hidePlayerModal = () => {
        this.setState({showPlayerModal: false, playerUrl: null});
    };

    showPlayerModal = e => {
        const id = e.currentTarget.parentElement.parentElement.id;
        this.hideFilesModal();
        this.setState({
            showPlayerModal: true,
            playerUrl: `${this.props.settings.baseUrl}/torrents/${this.state.selected}/files/${id}/serve`
        });
    };

    componentDidMount() {
        this.getData();
        this.getDataInterval = setInterval(this.getData, 2000);
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.state.showMagnetModal) {
            this.modalMagnetUri.focus();
        }
    }

    componentWillUnmount() {
        clearInterval(this.getDataInterval);
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
                                onClick={this.showFilesModal}
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
                            ref={this.setModalMagnetUriRef}
                            placeholder="Magnet URI"
                            aria-label="Magnet URI"
                            onKeyPress={this.modalMagnetUriOnKeyPress}
                            required
                        />
                    </Modal.Body>
                    <Modal.Footer style={{borderTop: "0px"}}>
                        <Button variant="outline-info" onClick={this.onModalAddMagnetUri}>Add</Button>
                        <Button variant="outline-info" onClick={this.hideMagnetModal}>Close</Button>
                    </Modal.Footer>
                </CustomModal>
                <FilesModal
                    title={this.state.filesModalTitle}
                    files={this.state.files}
                    show={this.state.showFilesModal}
                    onHide={this.hideFilesModal}
                    onDownloadClick={this.onFileDownloadClick}
                    onStopClick={this.onFileStopClick}
                    onStreamClick={this.showPlayerModal}
                />
                <CustomModal
                    show={this.state.showPlayerModal}
                    onHide={this.hidePlayerModal}
                    size="xl"
                    aria-labelledby="contained-modal-title-vcenter"
                    centered
                >
                    <video width="100%" controls autoPlay>
                        <source src={this.state.playerUrl}/>
                        Your browser does not support HTML5 video.
                    </video>
                </CustomModal>
                <Container style={{marginTop: "50px"}}>
                    {this.state.torrents.length > 0 ?
                        <TorrentsTable torrents={this.state.torrents} onClick={this.tableRowOnClick}/> :
                        <div>
                            <h4>No torrents yet - Add the first one</h4>
                            <br/>
                            <CustomFormControl
                                type="text"
                                ref={this.setInitMagnetUriRef}
                                placeholder="Magnet URI"
                                aria-label="Magnet URI"
                                onKeyPress={this.initMagnetUriOnKeyPress}
                                required
                            />
                        </div>
                    }
                </Container>
            </div>
        )
    }
}