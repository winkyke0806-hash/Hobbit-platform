import React, { Suspense } from "react";
import ReactDOM from "react-dom/client";
import { onAuthStateChanged } from "firebase/auth";
import { ref, get } from "firebase/database";
import { auth, fbDb } from "../hobbit-app.jsx";

const AuthApp = React.lazy(() => import("../hobbit-app.jsx"));
const HobbitApp = React.lazy(() => import("../hobbit-tasks.jsx"));

const LoadingScreen = () => (
  <div style={{position:"fixed",inset:0,background:"#050302",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:16}}>
    <div style={{fontFamily:"'Cinzel Decorative',serif",fontSize:"1.4rem",color:"#C9A84C",letterSpacing:".12em",animation:"gP 2s ease infinite"}}>A Hobbit Platform</div>
    <div style={{width:120,height:2,background:"rgba(201,168,76,.15)",borderRadius:2,overflow:"hidden"}}>
      <div style={{height:"100%",width:"40%",background:"linear-gradient(90deg,transparent,#C9A84C,transparent)",animation:"loadSlide 1.2s ease-in-out infinite"}}/>
    </div>
    <div style={{fontFamily:"'Cinzel',serif",fontSize:".55rem",color:"rgba(201,168,76,.3)",letterSpacing:".1em",marginTop:8}}>Betöltés...</div>
    <style>{`@keyframes gP{0%,100%{text-shadow:0 0 18px rgba(201,168,76,.5)}50%{text-shadow:0 0 45px rgba(201,168,76,1)}}@keyframes loadSlide{0%{transform:translateX(-200%)}100%{transform:translateX(400%)}}`}</style>
  </div>
);

function Root() {
  const [state, setState] = React.useState("loading");
  const checkedRef = React.useRef(false);

  React.useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (checkedRef.current && state === "app") return;
      if (firebaseUser) {
        try {
          const mapSnap = await get(ref(fbDb, `auth_map/${firebaseUser.uid}`));
          const mapData = mapSnap.val();
          if (mapData?.adventureName) {
            const profSnap = await get(ref(fbDb, `users/${mapData.adventureName}/profile`));
            const profile = profSnap.val() || {};
            localStorage.setItem("hobbit_current", JSON.stringify({ ...profile, adventureName: mapData.adventureName, uid: firebaseUser.uid }));
            setState("app");
          } else {
            setState("auth");
          }
        } catch {
          try {
            const u = JSON.parse(localStorage.getItem("hobbit_current"));
            setState(u?.adventureName ? "app" : "auth");
          } catch { setState("auth"); }
        }
      } else {
        try {
          const u = JSON.parse(localStorage.getItem("hobbit_current"));
          setState(u?.adventureName ? "app" : "auth");
        } catch { setState("auth"); }
      }
      checkedRef.current = true;
    });
    return () => unsub();
  }, []);

  if (state === "loading") return <LoadingScreen />;

  return (
    <Suspense fallback={<LoadingScreen />}>
      {state === "app" ? <HobbitApp /> : <AuthApp onLogin={() => setState("app")} />}
    </Suspense>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<Root />);
