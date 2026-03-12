import React from "react";
import ReactDOM from "react-dom/client";
import AuthApp from "../hobbit-app.jsx";
import HobbitApp from "../hobbit-tasks.jsx";
import ProfileTab from "./hobbit-profile.jsx";

function Root() {
  const isLoggedIn = () => {
    try { const u = JSON.parse(localStorage.getItem("hobbit_current")); return !!u?.adventureName; } catch { return false; }
  };
  const [loggedIn, setLoggedIn] = React.useState(isLoggedIn);
  return loggedIn
    ? <HobbitApp />
    : <AuthApp onLogin={() => { setLoggedIn(true); }} />;
}

ReactDOM.createRoot(document.getElementById("root")).render(<Root />);
