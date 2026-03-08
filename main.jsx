import React from "react";
import ReactDOM from "react-dom/client";
import AuthApp from "../hobbit-app.jsx";
import HobbitApp from "../hobbit-tasks.jsx";

function Root() {
  const [loggedIn, setLoggedIn] = React.useState(() => {
    const user = localStorage.getItem("hobbit_current");
    if (!user) return false;
    try { return !!JSON.parse(user)?.adventureName; } catch { return false; }
  });

  React.useEffect(() => {
    const onLogin = () => {
      const user = localStorage.getItem("hobbit_current");
      if (user) {
        try { setLoggedIn(!!JSON.parse(user)?.adventureName); } catch {}
      }
    };
    window.addEventListener("hobbit_login", onLogin);
    return () => window.removeEventListener("hobbit_login", onLogin);
  }, []);

  if (!loggedIn) return <AuthApp onLogin={() => setLoggedIn(true)} />;
  return <HobbitApp />;
}

ReactDOM.createRoot(document.getElementById("root")).render(<Root />);
