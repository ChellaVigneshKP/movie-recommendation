"use client";

import { Provider } from "react-redux";
import { store } from "@/store";
import PropTypes from "prop-types";

// Export a function called Providers that takes in a prop called children
export function Providers({ children }) {
    // Return a Provider component with the store prop set to the store variable and the children prop set to the children prop
    return <Provider store={store}>{children}</Provider>;
}

Providers.propTypes = {
    children: PropTypes.node.isRequired,
};