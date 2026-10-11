import { Outlet } from "react-router-dom";
import AdminSidebar from "../components/AdminSidebar/AdminSidebar";

function AdminLayout() {
    return (
        <div className="min-h-screen bg-[#F8F5EE]">
            <AdminSidebar />

            <main className="ml-72 min-h-screen overflow-y-auto p-8">
                <Outlet />
            </main>
        </div>
    );
}

export default AdminLayout;