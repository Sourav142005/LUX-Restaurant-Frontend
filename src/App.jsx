import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";
import AdminRoute from "./components/AdminRoute/AdminRoute";

import CustomerLayout from "./Layouts/CustomerLayout";
import AdminLayout from "./Layouts/AdminLayout";

import AdminOrders from "./pages/Admin/Orders/AdminOrders";
import AdminMenu from "./pages/Admin/Menu/AdminMenu";
import AdminUsers from "./pages/Admin/Users/AdminUsers";
import AdminCategories from "./pages/Admin/Categories/AdminCategories";
import AdminTables from "./pages/Admin/Tables/AdminTables";
import AdminReservations from "./pages/Admin/Reservations/AdminReservations";

import Checkout from "./pages/Checkout/Checkout";

import Reservations from "./pages/Reservations/Reservations";
import MyReservations from "./pages/Reservations/MyReservations";

import ForgotPassword from "./pages/Auth/ForgotPassword";
import ResetPassword from "./pages/Auth/ResetPassword";
import ResetPasswordPhone from "./pages/Auth/ResetPasswordPhone";

import VerifyPhone from "./pages/Auth/VerifyPhone";

import Home from "./pages/Home/Home";
import Menu from "./pages/Menu/Menu";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import Cart from "./pages/Cart/Cart";
import Orders from "./pages/Orders/Orders";
import Food3DTest from "./pages/Food3DTest";
import ARTest from "./pages/ARTest";
import MarkerAR from "./pages/AR/MarkerAR";

import Dashboard from "./pages/Admin/Dashboard/Dashboard";


function App() {

    return (

        <BrowserRouter>

            <Toaster position="top-right" />

            <Routes>


                {/* ==================================================
                    CUSTOMER ROUTES
                ================================================== */}

                <Route element={<CustomerLayout />}>

                    <Route
                        path="/"
                        element={<Home />}
                    />

                    <Route
                        path="/menu"
                        element={<Menu />}
                    />

                    <Route
                        path="/login"
                        element={<Login />}
                    />

                    <Route
                        path="/register"
                        element={<Register />}
                    />

                    <Route
                        path="/cart"
                        element={<Cart />}
                    />

                    <Route
                        path="/verify-phone"
                        element={<VerifyPhone />}
                    />

                    <Route
                        path="/reset-password-phone"
                        element={<ResetPasswordPhone />}
                    />


                    {/* Checkout */}

                    <Route
                        path="/checkout"
                        element={
                            <ProtectedRoute>
                                <Checkout />
                            </ProtectedRoute>
                        }
                    />


                    {/* Orders */}

                    <Route
                        path="/orders"
                        element={
                            <ProtectedRoute>
                                <Orders />
                            </ProtectedRoute>
                        }
                    />

                    {/* ForgotPassword  */}
                    <Route
                        path="/forgot-password"
                        element={<ForgotPassword />}
                    />

                    {/* ResetPassword  */}
                    <Route
                        path="/reset-password/:token"
                        element={<ResetPassword />}
                    />


                    {/* ==================================================
                        RESERVATIONS
                    ================================================== */}

                    <Route
                        path="/reservations"
                        element={
                            <ProtectedRoute>
                                <Reservations />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/reservations/my"
                        element={
                            <ProtectedRoute>
                                <MyReservations />
                            </ProtectedRoute>
                        }
                    />

                </Route>

                {/* ==================================================
                    3D ROUTES
                ================================================== */}

                <Route path="/food-3d-test" element={<Food3DTest />} />

                <Route path="/ar-test" element={<ARTest />} />

                <Route
                    path="/marker-ar-test"
                    element={<MarkerAR />}
                />

                {/* ==================================================
                    ADMIN ROUTES
                ================================================== */}

                <Route
                    element={
                        <AdminRoute>
                            <AdminLayout />
                        </AdminRoute>
                    }
                >

                    <Route
                        path="/admin/dashboard"
                        element={<Dashboard />}
                    />

                    <Route
                        path="/admin/orders"
                        element={<AdminOrders />}
                    />

                    <Route
                        path="/admin/menu"
                        element={<AdminMenu />}
                    />

                    <Route
                        path="/admin/categories"
                        element={<AdminCategories />}
                    />

                    <Route
                        path="/admin/users"
                        element={<AdminUsers />}
                    />

                    <Route
                        path="/admin/tables"
                        element={<AdminTables />}
                    />

                    <Route
                        path="/admin/reservations"
                        element={<AdminReservations />}
                    />

                </Route>


            </Routes>

        </BrowserRouter>

    );

}


export default App;