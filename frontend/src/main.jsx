import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { store } from "./store/store";
import App from "./App";
import { isValidUserData, safeStringify } from "./utils/helpers";
import "./index.css";

// Handle potentially corrupted data in localStorage
try {
  const userStr = localStorage.getItem("user");
  if (userStr) {
    // Try to parse it to make sure it's valid
    const user = JSON.parse(userStr);
    
    // Use our helper function to validate user data
    if (!isValidUserData(user)) {
      console.warn('Invalid user data in localStorage:', safeStringify(user));
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    } else {
      console.log('Valid user data found:', safeStringify(user));
    }
  }
} catch (error) {
  console.error('Error handling localStorage data:', error);
  // Clear potentially corrupted data
  localStorage.removeItem('user');
  localStorage.removeItem('token');
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);
