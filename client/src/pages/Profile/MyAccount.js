import React, {useState, useEffect, useContext} from 'react'
import { useLocation } from "react-router-dom";
import { AuthContext } from '../../context/AuthContext';
import axios from "axios";
import { HiOutlineMail, HiUser, HiPencilAlt } from 'react-icons/hi';
import Breadcrumbs from "../../components/pageProps/Breadcrumbs";
import AddressForm from '../Address/AddressForm';
import { PopupMsg } from '../../components/popup/PopupMsg';

const MyAccount = () => {
    const location = useLocation();
    const [prevLocation, setPrevLocation] = useState("");
    // useEffect(() => {
    //     setPrevLocation(location?.state.data);
    // }, [location]);
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
    })
    
    useEffect(() => {
        const fetchData = async () => {
          if (isLoggedIn && userId) {
            try {
              const userResponse = await axios.get(
                `http://localhost:5000/api/user/${userId}`
              );
              setUserDetails(userResponse.data);
              console.log("user Response", userResponse.data);
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
            ? `http://localhost:5000/api/user/update-address/${userId}`
            : `http://localhost:5000/api/user/add-address/${userId}`;
          const method = userDetails?.address ? "PUT" : "POST";
          const response = await axios({
            url: apiUrl,
            method: method,
            headers: { "Content-Type": "application/json" },
            data: { address },
          });
          alert(userDetails?.address ? "Address updated!" : "Address added!");
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
          alert("Failed to update address.");
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
        setAddress({ address: "", city: "", state: "", pincode: "", country: "", mobileno: "" });
      };
   return (
    <div className="max-w-container mx-auto px-4">
      <Breadcrumbs title="MyAccount" prevLocation={prevLocation} />
      <div
        className={`max-w-4xl mx-auto mt-12 shadow-2xl rounded-lg`}
      >
        {/* Profile Header */}
        {popup.show && <PopupMsg message={popup.message} type={popup.type} />}
        <div className="text-center mb-8 px-6">
          <h1
            className={`text-4xl font-extrabold"
            }`}
          >
            Your Account
          </h1>
          <p
            className={`text-lg mt-2`}
          >
            Manage your account and orders
          </p>
        </div>
        {/* {popup.show && <PopupMsg message={popup.message} type={popup.type} />} */}

        {/* User Details Section */}
        <div className="space-y-8 px-6">
          <div className="border-b pb-6">
            <h2
              className={`text-2xl font-semibold 
              `}
            >
              User Details
            </h2>
            <div
              className={`mt-4`}
            >
              <p className="flex items-center">
                <HiUser className="mr-2" />
                <strong>Name: </strong> {userDetails?.firstname}{" "}
                {userDetails?.lastname}
              </p>
              <p className="flex items-center mt-2">
                <HiOutlineMail className="mr-2" />
                <strong>Email: </strong> {userDetails?.email}
              </p>
              <p className="flex items-center mt-2">
                <strong>Username: </strong> {userDetails?.username}
              </p>
            </div>
          </div>

          {/* Address Section */}
          <div className="space-y-6">
            {userDetails?.address && !isEditing ? (
              <div className="bg-indigo-50 p-6 rounded-lg shadow-lg mt-6 relative text-black">
                <h2 className="text-2xl font-semibold text-indigo-700">
                  Saved Address
                </h2>
                <button
                  className="absolute top-4 right-4 text-gray-600 hover:text-indigo-700"
                  onClick={() => setIsEditing(true)}
                >
                  <HiPencilAlt size={20} />
                </button>
                <p>
                  <strong>Address:</strong> {userDetails.address.address}
                </p>
                <p>
                  <strong>City:</strong> {userDetails.address.city}
                </p>
                <p>
                  <strong>State:</strong> {userDetails.address.state}
                </p>
                <p>
                  <strong>Pincode:</strong> {userDetails.address.pincode}
                </p>
                <p>
                    <strong>Country:</strong> {userDetails.address.country}
                </p>
                <p>
                  <strong>Mobile No:</strong> {userDetails.address.mobileno}
                </p>
              </div>
            ) : (
              <div>
                <h2
                  className={`text-2xl font-semibold mt-8`}
                >
                  {userDetails?.address ? "Update Address" : "Add Address"}
                </h2>
                <AddressForm
                  address={address}
                  handleAddressChange={handleAddressChange}
                  handleAddressSubmit={handleAddressSubmit}
                  userDetails={userDetails}
                />
                {isEditing && (
                  <button
                    onClick={handleCancelUpdate}
                    className="mt-4 px-6 py-2 bg-gray-600 text-white rounded hover:bg-gray-800"
                  >
                    Cancel
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default MyAccount
