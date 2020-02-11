import React, {Component} from "react";
import Tooltip from "react-bootstrap/Tooltip";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import FormControl from "react-bootstrap/FormControl";
import styled from "styled-components";

export const CustomFormControl = styled(FormControl)`
    background-color: rgba(255,255,255,0.5);

    &&:focus {
        background-color: rgba(255,255,255,0.9);
    }

    &&:disabled {
        background-color: rgba(255,255,255,0.6);
    }
`;

export class OverlayTooltip extends Component {
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