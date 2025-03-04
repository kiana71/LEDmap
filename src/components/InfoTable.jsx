import React, { useEffect } from "react";
import Logo from "../img/Logo_signcast_big-1080x322.png";
import useDescriptionDataStore from "../zustand/descriptionDataStore";

const InfoTable = () => {
  const { formData } = useDescriptionDataStore((state) => state);  // Get formData from store


  useEffect(() => {


  }, [formData]);
  return (
    <div className="border rounded-md shadow-md px-4 pb-4 mb-5 bg-white w-full max-w-4xl mx-auto">
      {/* Logo and Address */}
      <div className="flex items-center justify-between ">
        <div className="relative ">
          <img className="w-14" src={Logo} alt="Signcast Media" />
        </div>
      </div>

      {/* Description */}
      <div className="mb-4">
        <p className="font-semibold text-gray-800">Description:</p>
        <p className="text-gray-600">{formData?.title}</p>
      </div>

      {/* Table 1 */}
      <table className="w-full border-collapse border border-gray-300 text-sm">
        <thead>
          <tr className="p-4">
            <th className="border border-gray-300 bg-yellow-100 px-2 py-1">Designer</th>
            <th className="border border-gray-300 bg-yellow-100 px-2 py-1">Department</th>
            <th className="border border-gray-300 bg-yellow-100 px-2 py-1">Screen Size</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border border-gray-300 px-2 py-3">{formData.drawer}</td>
            <td className="border border-gray-300 px-2 py-3">{formData.department}</td>
            <td className="border border-gray-300 px-2 py-3">{formData.screenSize}</td>
          </tr>
        </tbody>
      </table>

      {/* Table 2 */}
      <table className="w-full border-collapse border border-gray-300 mt-4 text-sm">
        <thead>
          <tr>
            <th className="border border-gray-300 bg-yellow-100 px-2 py-1">Date</th>
            <th className="border border-gray-300 bg-yellow-100 px-2 py-1">Sheet</th>
            <th className="border border-gray-300 bg-yellow-100 px-2 py-1">Revision</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border border-gray-300 px-2 py-1">{formData.date}</td>
            <td className="border border-gray-300 px-2 py-1">1 of 1</td>
            <td className="border border-gray-300 px-2 py-1">00</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default InfoTable;
