import React from 'react';
import { Alert, Box, Button, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { store } from '../../store/store';
import { logout } from '../../store/slices/authSlice';

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

        // If it's an authentication error, clear state and redirect to login
        if (error?.message?.includes('authentication') || error?.status === 401) {
            store.dispatch(logout());
            setTimeout(() => {
                window.location.replace('/login');
            }, 0);
        }
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null, errorInfo: null });
        // If it's an auth error, clear state and redirect to login
        if (this.state.error?.message?.includes('authentication') || this.state.error?.status === 401) {
            store.dispatch(logout());
            setTimeout(() => {
                window.location.replace('/login');
            }, 0);
        } else {
            window.location.replace('/');
        }
    }

    render() {
        if (this.state.hasError) {
            const isAuthError = this.state.error?.message?.includes('authentication') || 
                              this.state.error?.status === 401;

            return (
                <Box sx={{
                    p: 4,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '80vh'
                }}>
                    <Alert severity={isAuthError ? "warning" : "error"} sx={{ mb: 3, width: '100%', maxWidth: 600 }}>
                        {isAuthError 
                            ? "Your session has expired. Please log in again."
                            : "Something went wrong in this part of the application."}
                    </Alert>
                    <Typography variant="h5" gutterBottom>
                        {isAuthError ? "Session Expired" : "We apologize for the inconvenience"}
                    </Typography>
                    <Typography variant="body1" paragraph align="center" sx={{ maxWidth: 600, mb: 3 }}>
                        {isAuthError
                            ? "For security reasons, you need to log in again to continue."
                            : "The application encountered an unexpected error. You can try refreshing the page or returning to the home page."}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button 
                            variant="contained" 
                            color={isAuthError ? "warning" : "primary"} 
                            onClick={this.handleReset}
                        >
                            {isAuthError ? "Go to Login" : "Go to Home Page"}
                        </Button>
                        {!isAuthError && (
                            <Button variant="outlined" onClick={() => window.location.reload()}>
                                Refresh Page
                            </Button>
                        )}
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