import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";
import LuxAiAssistant from "../components/LuxAi/LuxAiAssistant";

function CustomerLayout() {
    return (
        <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1">
                <Outlet />
            </main>
            <Footer />
            <LuxAiAssistant />
        </div>
    );
}

export default CustomerLayout;
