//AddressForm.js
import React from 'react'
import { FiMapPin, FiSave } from "react-icons/fi";

function AddressForm({ address, handleAddressChange, handleAddressSubmit, userDetails }) {
  const fields = [
    { name: "address", label: "Address", placeholder: "House no, building, street" },
    { name: "city", label: "City", placeholder: "City" },
    { name: "state", label: "State", placeholder: "State" },
    { name: "pincode", label: "Pincode", placeholder: "Postal code" },
    { name: "country", label: "Country", placeholder: "Country" },
    { name: "mobileno", label: "Mobile Number", placeholder: "Delivery contact number" },
  ];

  return (
    <form
      onSubmit={handleAddressSubmit}
      className="mt-4 rounded-lg border border-gray-200 bg-white p-5 shadow-sm"
    >
      <div className="mb-5 flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-md bg-violet-50 text-violet-600">
          <FiMapPin />
        </span>
        <div>
          <h3 className="text-lg font-bold text-gray-950">Delivery Address</h3>
          <p className="text-sm text-gray-500">Keep your shipping details ready for faster checkout.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {fields.map((field) => (
          <label
            key={field.name}
            className={field.name === "address" || field.name === "mobileno" ? "md:col-span-2" : ""}
          >
            <span className="text-sm font-semibold text-gray-700">{field.label}</span>
            <input
              type="text"
              name={field.name}
              value={address[field.name]}
              onChange={handleAddressChange}
              placeholder={field.placeholder}
              className="mt-2 h-12 w-full rounded-md border border-gray-200 bg-white px-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-primeColor focus:ring-2 focus:ring-gray-100"
              required
            />
          </label>
        ))}
      </div>

        <button
            type="submit"
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-md bg-primeColor py-3 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-black">
            <FiSave />
            {userDetails?.address ? "Update Address" : "Add Address"}
        </button>
    </form>
  )
}

export default AddressForm
