"use client";

import { Provider } from "react-redux";
import { store } from "./redux/store";
import PropTypes from "prop-types";

export function Providers({ children }) {
    return <Provider store={store}>{children}</Provider>;
}

Providers.propTypes = {
    children: PropTypes.node.isRequired,
};