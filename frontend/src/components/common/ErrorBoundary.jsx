import React from 'react';
import { Alert, Box, Button, Typography } from '@mui/material';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        // You can log the error to an error reporting service
        console.error("Error caught by ErrorBoundary:", error, errorInfo);
        this.setState({
            error: error,
            errorInfo: errorInfo
        });
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null, errorInfo: null });
        // Optional: refresh the page or navigate to a safe route
        window.location.href = '/';
    }

    render() {
        if (this.state.hasError) {
            // You can render any custom fallback UI
            return (
                <Box sx={{
                    p: 4,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '80vh'
                }}>
                    <Alert severity="error" sx={{ mb: 3, width: '100%', maxWidth: 600 }}>
                        Something went wrong in this part of the application.
                    </Alert>
                    <Typography variant="h5" gutterBottom>
                        We apologize for the inconvenience
                    </Typography>
                    <Typography variant="body1" paragraph align="center" sx={{ maxWidth: 600, mb: 3 }}>
                        The application encountered an unexpected error. You can try refreshing the page or returning to the home page.
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button variant="contained" color="primary" onClick={this.handleReset}>
                            Go to Home Page
                        </Button>
                        <Button variant="outlined" onClick={() => window.location.reload()}>
                            Refresh Page
                        </Button>
                    </Box>
                    {process.env.NODE_ENV === 'development' && this.state.error && (
                        <Box sx={{ mt: 4, p: 2, bgcolor: '#f5f5f5', borderRadius: 1, width: '100%', maxWidth: 800, overflow: 'auto' }}>
                            <Typography variant="subtitle2" color="error">
                                Error Details (visible in development only):
                            </Typography>
                            <pre style={{ overflow: 'auto', maxHeight: '200px' }}>
                                {this.state.error.toString()}
                                {this.state.errorInfo && this.state.errorInfo.componentStack}
                            </pre>
                        </Box>
                    )}
                </Box>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary; 