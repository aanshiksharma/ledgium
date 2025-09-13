import React from "react";

import Sidebar from "../components/Sidebar";

function NotFound() {
  return (
    <>
      <div className="flex h-screen">
        <Sidebar />

        <div className="flex flex-col items-center justify-center gap-6 flex-1">
          <h1 className="text-4xl">Error 404 : Page not found!</h1>

          <div className="text-center">
            <p>The page you requested was not found.</p>
            <p>The server responded with the code 404 : Not Found</p>
          </div>
        </div>
      </div>
    </>
  );
}

export default NotFound;
