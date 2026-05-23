import React from 'react';

// Replace the component implementation with a simple passthrough
const ProtectedRoute = ({ children }) => {
    // Bypass authentication for now; always render children
    return <>{children}</>;
};

export default ProtectedRoute;