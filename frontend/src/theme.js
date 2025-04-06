import { createTheme } from "@mui/material";

export const theme = createTheme({
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 960,
      lg: 1280,
      xl: 1920,
    },
  },
  palette: {
    primary: {
      main: "#1976d2",
      dark: "#1565c0",
    },
    secondary: {
      main: "#dc004e",
      dark: "#c51162",
    },
    background: {
      default: "#f5f5f5",
      paper: "#ffffff",
    },
  },
  typography: {
    fontFamily: [
      "-apple-system",
      "BlinkMacSystemFont",
      '"Segoe UI"',
      "Roboto",
      '"Helvetica Neue"',
      "Arial",
      "sans-serif",
    ].join(","),
    h1: {
      fontSize: "2rem",
      fontWeight: 700,
      "@media (min-width:600px)": {
        fontSize: "2.5rem",
      },
    },
    h2: {
      fontSize: "1.75rem",
      fontWeight: 700,
      "@media (min-width:600px)": {
        fontSize: "2rem",
      },
    },
    h3: {
      fontSize: "1.5rem",
      fontWeight: 600,
      "@media (min-width:600px)": {
        fontSize: "1.75rem",
      },
    },
    h4: {
      fontSize: "1.25rem",
      fontWeight: 600,
      "@media (min-width:600px)": {
        fontSize: "1.5rem",
      },
    },
    h5: {
      fontSize: "1.1rem",
      fontWeight: 500,
      "@media (min-width:600px)": {
        fontSize: "1.25rem",
      },
    },
    h6: {
      fontSize: "0.9rem",
      fontWeight: 500,
      "@media (min-width:600px)": {
        fontSize: "1rem",
      },
    },
    body1: {
      fontSize: "0.9rem",
      "@media (min-width:600px)": {
        fontSize: "1rem",
      },
    },
    body2: {
      fontSize: "0.8rem",
      "@media (min-width:600px)": {
        fontSize: "0.875rem",
      },
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          borderRadius: 8,
          whiteSpace: "nowrap",
          padding: "6px 16px",
          "@media (max-width:600px)": {
            padding: "4px 12px",
            fontSize: "0.8rem",
          },
        },
        sizeSmall: {
          padding: "4px 10px",
          "@media (max-width:600px)": {
            padding: "2px 8px",
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: "#ffffff",
          borderRight: "1px solid rgba(0,0,0,0.12)",
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "#ffffff",
          color: "#000000",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          "@media (max-width:600px)": {
            padding: "8px",
          },
        },
        head: {
          fontWeight: "bold",
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          "@media (max-width:600px)": {
            margin: "8px",
          },
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          "@media (max-width:600px)": {
            padding: "16px",
          },
        },
      },
    },
    MuiDialogContent: {
      styleOverrides: {
        root: {
          "@media (max-width:600px)": {
            padding: "16px",
          },
        },
      },
    },
    MuiDialogActions: {
      styleOverrides: {
        root: {
          "@media (max-width:600px)": {
            padding: "8px 16px 16px",
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "@media (max-width:600px)": {
            fontSize: "0.875rem",
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          "@media (max-width:600px)": {
            height: "24px",
            fontSize: "0.75rem",
          },
        },
        label: {
          "@media (max-width:600px)": {
            paddingLeft: "8px",
            paddingRight: "8px",
          },
        },
      },
    },
  },
});
