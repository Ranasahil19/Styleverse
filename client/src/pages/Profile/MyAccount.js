import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import axios from "axios";
import { HiOutlineMail, HiUser, HiPencilAlt } from "react-icons/hi";
import { FiMapPin, FiPhone, FiUserCheck } from "react-icons/fi";
import AddressForm from "../Address/AddressForm";
import { PopupMsg } from "../../components/popup/PopupMsg";
import { API_BASE_URL } from "../../config/ApiConfig";
import AccountLayout from "./AccountLayout";

const MyAccount = () => {
  const { state } = useContext(AuthContext);
  const { isLoggedIn, user } = state;
  const [userDetails, setUserDetails] = useState(null);
  const [address, setAddress] = useState({
    address: "",
    city: "",
    state: "",
    pincode: "",
    country: "",
    mobileno: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const userId = user?.userId;
  const [popup, setPopup] = useState({
    message: "",
    type: "",
    show: false,
  });

  useEffect(() => {
    const fetchData = async () => {
      if (isLoggedIn && userId) {
        try {
          const userResponse = await axios.get(
            `${API_BASE_URL}/api/user/${userId}`
          );
          setUserDetails(userResponse.data);
          if (userResponse.data?.address) {
            setAddress(userResponse.data.address);
          }
          setIsLoading(false);
        } catch (error) {
          console.error("Error fetching data:", error);
          setIsLoading(false);
        }
      }
    };
    fetchData();
  }, [isLoggedIn, userId]);

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setAddress((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    if (!userId) {
      alert("User ID is missing.");
      return;
    }
    const { address: addr, city, state, pincode, country, mobileno } = address;
    if (!addr || !city || !state || !pincode || !country || !mobileno) {
      alert("All fields are required.");
      return;
    }
    try {
      const apiUrl = userDetails?.address
        ? `${API_BASE_URL}/api/user/update-address/${userId}`
        : `${API_BASE_URL}/api/user/add-address/${userId}`;
      const method = userDetails?.address ? "PUT" : "POST";
      const response = await axios({
        url: apiUrl,
        method: method,
        headers: { "Content-Type": "application/json" },
        data: { address },
      });
      setPopup({
        message: userDetails?.address
          ? "Address updated successfully!"
          : "Address added successfully!",
        type: "success",
        show: true,
      });
      setUserDetails(response.data.user);
      setIsEditing(false);
      resetForm();
    } catch (error) {
      console.error("Error processing address:", error);
      setPopup({
        message: "Failed to update address. Please try again later.",
        type: "error",
        show: true,
      });
    }
  };

  const handleCancelUpdate = () => {
    setIsEditing(false);
    if (userDetails?.address) {
      setAddress(userDetails.address);
    }
  };

  const resetForm = () => {
    setAddress({
      address: "",
      city: "",
      state: "",
      pincode: "",
      country: "",
      mobileno: "",
    });
  };

  return (
    <AccountLayout
      title="My Account"
      description="Review your account details and manage your saved delivery address."
    >
      {popup.show && <PopupMsg message={popup.message} type={popup.type} />}

      {isLoading ? (
        <div className="space-y-5">
          <div className="h-40 rounded-lg bg-gray-100 shimmer" />
          <div className="h-72 rounded-lg bg-gray-100 shimmer" />
        </div>
      ) : (
        <div className="space-y-6">
          <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primeColor text-2xl font-bold uppercase text-white">
                  {(userDetails?.firstname || userDetails?.username || "U").charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wide text-violet-600">
                    Customer Profile
                  </p>
                  <h2 className="mt-1 text-2xl font-bold text-gray-950">
                    {userDetails?.firstname} {userDetails?.lastname}
                  </h2>
                  <p className="text-sm text-gray-500">@{userDetails?.username}</p>
                </div>
              </div>
              <span className="inline-flex w-fit items-center gap-2 rounded-full bg-green-50 px-4 py-2 text-sm font-bold text-green-700">
                <FiUserCheck /> Active Account
              </span>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
              <InfoTile
                icon={HiUser}
                label="Full Name"
                value={`${userDetails?.firstname || ""} ${userDetails?.lastname || ""}`.trim() || "Not provided"}
              />
              <InfoTile
                icon={HiOutlineMail}
                label="Email"
                value={userDetails?.email || "Not provided"}
              />
            </div>
          </section>

          <section className="space-y-5">
            {userDetails?.address && !isEditing ? (
              <div className="relative rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                <button
                  className="absolute right-5 top-5 inline-flex h-10 w-10 items-center justify-center rounded-md border border-gray-200 text-gray-600 transition hover:bg-gray-50 hover:text-gray-950"
                  onClick={() => setIsEditing(true)}
                  aria-label="Edit address"
                >
                  <HiPencilAlt size={20} />
                </button>
                <div className="mb-5 flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-md bg-violet-50 text-violet-600">
                    <FiMapPin />
                  </span>
                  <div>
                    <h2 className="text-xl font-bold text-gray-950">Saved Address</h2>
                    <p className="text-sm text-gray-500">Used during checkout.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
                  <AddressDetail label="Address" value={userDetails.address.address} wide />
                  <AddressDetail label="City" value={userDetails.address.city} />
                  <AddressDetail label="State" value={userDetails.address.state} />
                  <AddressDetail label="Pincode" value={userDetails.address.pincode} />
                  <AddressDetail label="Country" value={userDetails.address.country} />
                  <AddressDetail label="Mobile" value={userDetails.address.mobileno} icon={FiPhone} wide />
                </div>
              </div>
            ) : (
              <div>
                <AddressForm
                  address={address}
                  handleAddressChange={handleAddressChange}
                  handleAddressSubmit={handleAddressSubmit}
                  userDetails={userDetails}
                />
                {isEditing && (
                  <button
                    onClick={handleCancelUpdate}
                    className="mt-4 rounded-md border border-gray-200 px-5 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                )}
              </div>
            )}
          </section>
        </div>
      )}
    </AccountLayout>
  );
};

const InfoTile = ({ icon: Icon, label, value }) => (
  <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
    <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-500">
      <Icon className="text-violet-600" />
      {label}
    </div>
    <p className="font-bold text-gray-950">{value}</p>
  </div>
);

const AddressDetail = ({ label, value, icon: Icon, wide }) => (
  <div className={`rounded-lg border border-gray-100 bg-gray-50 p-4 ${wide ? "md:col-span-2" : ""}`}>
    <p className="mb-1 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-gray-500">
      {Icon && <Icon />}
      {label}
    </p>
    <p className="font-semibold text-gray-950">{value || "Not provided"}</p>
  </div>
);

export default MyAccount;
