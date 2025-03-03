import React, { useState } from "react";

const SignCastForm = () => {
  const [formData, setFormData] = useState({
    drawnBy: "",
    date: "",
    sheet: "",
    revision: "",
    department: "",
    screenSize: "",
    description: "",
    logo: null,
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, logo: e.target.files[0] });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

  };

  return (
    <div className="p-2 w-full max-w-3xl mx-auto border rounded-md shadow bg-white">
      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Logo Upload */}
        <div className="flex flex-col items-center">
          <label htmlFor="logo" className="font-bold text-sm mb-1">
            Upload Logo
          </label>
          <input
            type="file"
            id="logo"
            accept="image/*"
            onChange={handleFileChange}
            className="block w-full text-xs file:py-1 file:px-2 file:border-0 file:bg-gray-100 file:font-semibold hover:file:bg-gray-200"
          />
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-semibold mb-1">
            Description
          </label>
          <input
            type="text"
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Horizontal + PC In Niche"
            className="w-full border border-gray-300 rounded px-2 py-1 text-xs focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Drawn By and Dimensions */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label htmlFor="drawnBy" className="block text-sm font-semibold mb-1">
              Drawn By
            </label>
            <input
              type="text"
              id="drawnBy"
              name="drawnBy"
              value={formData.drawnBy}
              onChange={handleInputChange}
              placeholder="SignCast"
              className="w-full border border-gray-300 rounded px-2 py-1 text-xs focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="text-center border py-1 bg-yellow-100 rounded">
            <p className="text-sm font-semibold">Dimensions in Inches</p>
            <p className="text-xs">(Placeholder for diagram/icon)</p>
          </div>
        </div>

        {/* Date, Sheet, Revision, Department */}
        <div className="grid grid-cols-4 gap-2">
          <div>
            <label htmlFor="date" className="block text-sm font-semibold mb-1">
              Date
            </label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded px-2 py-1 text-xs focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="sheet" className="block text-sm font-semibold mb-1">
              Sheet
            </label>
            <input
              type="text"
              id="sheet"
              name="sheet"
              value={formData.sheet}
              onChange={handleInputChange}
              placeholder="1 of 1"
              className="w-full border border-gray-300 rounded px-2 py-1 text-xs focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="revision" className="block text-sm font-semibold mb-1">
              Revision
            </label>
            <input
              type="text"
              id="revision"
              name="revision"
              value={formData.revision}
              onChange={handleInputChange}
              placeholder="00"
              className="w-full border border-gray-300 rounded px-2 py-1 text-xs focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="department" className="block text-sm font-semibold mb-1">
              Department
            </label>
            <input
              type="text"
              id="department"
              name="department"
              value={formData.department}
              onChange={handleInputChange}
              placeholder="Installations"
              className="w-full border border-gray-300 rounded px-2 py-1 text-xs focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Screen Size */}
        <div>
          <label htmlFor="screenSize" className="block text-sm font-semibold mb-1">
            Screen Size
          </label>
          <input
            type="text"
            id="screenSize"
            name="screenSize"
            value={formData.screenSize}
            onChange={handleInputChange}
            placeholder="LG 55” Touch Display"
            className="w-full border border-gray-300 rounded px-2 py-1 text-xs focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Save
        </button>
      </form>
    </div>
  );
};

export default SignCastForm;
