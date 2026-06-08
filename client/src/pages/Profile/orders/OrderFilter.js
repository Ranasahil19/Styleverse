import React from "react";
import SearchOrders from "../SearchOrders";
import { FiFilter } from "react-icons/fi";

const OrderFilter = ({ orders, filter, years, onSearchChange, onFilterChange }) => {
  return (
    <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <SearchOrders orders={orders} onSearchChange={onSearchChange} />
        <label className="flex h-11 items-center gap-2 rounded-md border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-600">
          <FiFilter className="text-gray-400" />
          <select
            value={filter}
            onChange={(e) => onFilterChange(e.target.value)}
            className="h-full min-w-[170px] bg-transparent outline-none"
          >
            <option value="last 30 days">Last 30 Days</option>
            <option value="past 3 months">Past 3 Months</option>
            {years.map((year) => (
              <option key={year} value={year}>{year}</option>
            ))}
            <option value="Archived Orders">Archived Orders</option>
          </select>
        </label>
      </div>
    </div>
  );
};

export default OrderFilter;
