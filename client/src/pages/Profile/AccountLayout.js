import React from "react";
import { Link, useLocation } from "react-router-dom";
import { FiBox, FiGrid, FiUser } from "react-icons/fi";
import Breadcrumbs from "../../components/pageProps/Breadcrumbs";

const navLinks = [
  { path: "/profile", label: "Overview", icon: FiGrid },
  { path: "/profile/myaccount", label: "My Account", icon: FiUser },
  { path: "/profile/myorders", label: "My Orders", icon: FiBox },
];

const AccountLayout = ({ title, eyebrow = "Account", description, children }) => {
  const location = useLocation();

  return (
    <div className="max-w-container mx-auto px-4 pb-16">
      <Breadcrumbs title={title} prevLocation="/" />

      <div className="mb-8 rounded-lg border border-gray-200 bg-white px-5 py-5 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-violet-600">
          {eyebrow}
        </p>
        <h1 className="mt-1 text-3xl font-bold text-gray-950">{title}</h1>
        {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="h-fit rounded-lg border border-gray-200 bg-white p-3 shadow-sm lg:sticky lg:top-28">
          <nav className="space-y-1">
            {navLinks.map(({ path, label, icon: Icon }) => {
              const isActive = location.pathname === path;

              return (
                <Link
                  key={path}
                  to={path}
                  className={`flex items-center gap-3 rounded-md px-4 py-3 text-sm font-semibold transition ${
                    isActive
                      ? "bg-primeColor text-white"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-950"
                  }`}
                >
                  <Icon />
                  {label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
};

export default AccountLayout;
