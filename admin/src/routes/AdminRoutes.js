import { lazy } from "react";
import Loadable from "ui-component/Loadable";
import MainLayout from "layout/MainLayout";
import UserProfile from "component/Profile";
import AccountSettings from "component/AccountSetting";
import CategoriesList from "views/pages/admin/CategoriesPage";

const AdminDashboard = Loadable(lazy(() => import("views/pages/admin/AdminDashboard")));
const UserList = Loadable(lazy(() => import("views/pages/admin/userList")));
const SellerList = Loadable(lazy(() => import("views/pages/admin/SellerList")));
const SamplePage = Loadable(lazy(() => import("views/sample-page")));

const AdminRoutes = {
    path : "/admin",
    element: <MainLayout />,
    children : [
        { path:"dashboard" , element: <AdminDashboard />},
        { path:"user-list" , element: <UserList />},
        { path:"seller-list", element: <SellerList />},
        { path:"categories-list", element: <CategoriesList />},
        { path: "sample-page", element: <SamplePage /> },
        {path : "profile" , element: <UserProfile/>},
        {path: "account-setting", element: <AccountSettings/>}
    ]
}
export default AdminRoutes;