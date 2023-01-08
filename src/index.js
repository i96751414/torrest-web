import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import AlertTemplate from "./templates/alert-template.js";
import {positions, Provider} from "react-alert";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
    <React.StrictMode>
        <Provider
            template={AlertTemplate}
            timeout={3000}
            position={positions.BOTTOM_RIGHT}
            containerStyle={{zIndex: 2000}}
        >
            <App/>
        </Provider>
    </React.StrictMode>
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
