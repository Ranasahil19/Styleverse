import React from "react";
import { Link } from "react-router-dom";
import { FiBox, FiChevronRight, FiShield, FiTruck, FiUser } from "react-icons/fi";
import AccountLayout from "./AccountLayout";

const ProfilePage = () => {
  const cards = [
    {
      title: "My Account",
      description:
        "Update your personal information and secure your account settings.",
      to: "/profile/myaccount",
      icon: FiUser,
    },
    {
      title: "My Orders",
      description:
        "Track your orders, view history, and manage return requests.",
      to: "/profile/myorders",
      icon: FiBox,
    },
  ];

  return (
    <AccountLayout
      title="Profile"
      description="Manage your account details, delivery address, and order history."
    >
      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        <StatCard icon={FiShield} label="Account" value="Secure" />
        <StatCard icon={FiTruck} label="Delivery" value="Saved Address" />
        <StatCard icon={FiBox} label="Orders" value="Track Anytime" />
      </div>

      <section className="mt-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-gray-950">Quick Actions</h2>
        <p className="mt-1 text-sm text-gray-500">
          Jump into the areas you use most.
        </p>

        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
          {cards.map(({ title, description, to, icon: Icon }) => (
            <Link
              key={title}
              to={to}
              className="group rounded-lg border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-md bg-violet-50 text-violet-600">
                <Icon />
              </div>
              <h3 className="text-lg font-bold text-gray-950">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-gray-500">{description}</p>
              <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-primeColor">
                Open {title}
                <FiChevronRight className="transition group-hover:translate-x-1" />
              </span>
            </Link>
          ))}
        </div>
      </section>
    </AccountLayout>
  );
};

const StatCard = ({ icon: Icon, label, value }) => (
  <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
    <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-md bg-gray-50 text-gray-700">
      <Icon />
    </div>
    <p className="text-sm font-semibold text-gray-500">{label}</p>
    <p className="mt-1 text-xl font-bold text-gray-950">{value}</p>
  </div>
);

export default ProfilePage;
