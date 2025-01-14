import { Outlet } from "react-router";
import Header from "./components/Header";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Dashboard from './components/Dashboard';

function App() {
  return (
    <div>
      <ToastContainer />
      <Header />
      <main>
        <Outlet />
      </main>
    </div>
  );
}

export default App;
