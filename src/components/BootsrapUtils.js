import React, {PureComponent} from "react";
import Tooltip from "react-bootstrap/Tooltip";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import FormControl from "react-bootstrap/FormControl";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import styled from "styled-components";

export const CustomModal = styled(Modal)`
    && .modal-content {
        background-color: rgba(255, 255, 255, 0.8);
    }
`;
CustomModal.defaultProps = Modal.defaultProps;

export const CircleButton = styled(Button)`
    margin: 0px 5px;
    border-radius: 19px;
    height: 38px;
    width: 38px;
    font-size: 16px;
    padding: 6px;
    text-align: center;
`;
CircleButton.defaultProps = Button.defaultProps;

export const CustomFormControl = styled(FormControl)`
    background-color: rgba(255,255,255,0.5);

    &&:focus {
        background-color: rgba(255,255,255,0.9);
    }

    &&:disabled {
        background-color: rgba(255,255,255,0.6);
    }
`;
CustomFormControl.defaultProps = FormControl.defaultProps;

export class OverlayTooltip extends PureComponent {
    renderTooltip = props => {
        return <Tooltip {...props} show={props.show.toString()}>{this.props.message}</Tooltip>;
    };

    render() {
        return (
            <OverlayTrigger
                placement="bottom"
                delay={{show: 1000, hide: 400}}
                overlay={this.renderTooltip}
            >
                {this.props.children}
            </OverlayTrigger>
        )
    }
}