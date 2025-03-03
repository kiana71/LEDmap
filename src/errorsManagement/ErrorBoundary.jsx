import React from 'react';
import * as Sentry from "@sentry/react";
import Fallback from './Fallback';

const ErrorBoundary = ({ children }) => {
    return (
        <Sentry.ErrorBoundary fallback={<Fallback />}>
            {children}
        </Sentry.ErrorBoundary>
    );
};

export default ErrorBoundary;
