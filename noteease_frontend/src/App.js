import React from "react";
import "./App.css";
import MainContainer from "./MainContainer";

// PUBLIC_INTERFACE
function App() {
  // The App is now just the MainContainer
  return (
    <div className="app" style={{ background: "#f9fbfd", minHeight: "100vh" }}>
      <MainContainer />
    </div>
  );
}

export default App;