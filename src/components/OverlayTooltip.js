import React, {Component} from "react";
import Tooltip from "react-bootstrap/Tooltip";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";

export default class OverlayTooltip extends Component {
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