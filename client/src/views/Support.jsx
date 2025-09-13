import Sidebar from "../components/Sidebar";
import Titlebar from "../components/Titlebar";

function Support() {
  return (
    <>
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Titlebar title={`Help and Support`} />
          <p className="flex items-center justify-center h-full text-2xl">
            This page is under development!
          </p>
        </div>
      </div>
    </>
  );
}

export default Support;
