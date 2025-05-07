import React, { useState } from 'react';
import {
    Box,
    Container,
    Tabs,
    Tab,
    Typography,
    Paper,
    useMediaQuery,
    useTheme
} from '@mui/material';
import UploadNote from '../../components/notes/UploadNote';
import NotesList from '../../components/notes/NotesList';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import ViewListIcon from '@mui/icons-material/ViewList';

const NotesPage = () => {
    const [tabIndex, setTabIndex] = useState(0);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const handleTabChange = (event, newIndex) => {
        setTabIndex(newIndex);
    };

    return (
        <Container maxWidth="lg" sx={{ py: 3 }}>
            <Typography variant="h5" component="h1" gutterBottom sx={{ mb: 3, fontWeight: 'bold' }}>
                Study Materials
            </Typography>

            <Paper sx={{ mb: 4, borderRadius: 2 }}>
                <Tabs
                    value={tabIndex}
                    onChange={handleTabChange}
                    aria-label="notes tabs"
                    variant={isMobile ? "fullWidth" : "standard"}
                    centered={!isMobile}
                    sx={{
                        borderBottom: 1,
                        borderColor: 'divider',
                        '& .MuiTab-root': {
                            py: 2,
                            display: 'flex',
                            flexDirection: isMobile ? 'column' : 'row',
                            alignItems: 'center'
                        }
                    }}
                >
                    <Tab
                        icon={<ViewListIcon />}
                        iconPosition={isMobile ? "top" : "start"}
                        label="View Materials"
                    />
                    <Tab
                        icon={<UploadFileIcon />}
                        iconPosition={isMobile ? "top" : "start"}
                        label="Upload New"
                    />
                </Tabs>

                <Box sx={{ p: { xs: 2, sm: 3 } }}>
                    {tabIndex === 0 && <NotesList />}
                    {tabIndex === 1 && <UploadNote />}
                </Box>
            </Paper>
        </Container>
    );
};

export default NotesPage; 