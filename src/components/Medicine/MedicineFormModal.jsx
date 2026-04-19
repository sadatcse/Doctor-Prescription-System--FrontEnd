import React, { useState, useEffect } from 'react';

const MedicineFormModal = ({ isOpen, onClose, medicine, onSuccess, companies = [] }) => {
  const [formData, setFormData] = useState({
    genericName: '',
    brandName: '',
    packageMark: '',
    dosageType: '',
    strength: '',
    manufacturer: '',
    status: 'final',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000/api';

  useEffect(() => {
    if (medicine) {
      setFormData({
        genericName: medicine.genericName || '',
        brandName: medicine.brandName || '',
        packageMark: medicine.packageMark || '',
        dosageType: medicine.dosageType || '',
        strength: medicine.strength || '',
        manufacturer: medicine.manufacturer || '',
        status: medicine.status || 'final',
      });
    } else {
      setFormData({
        genericName: '',
        brandName: '',
        packageMark: '',
        dosageType: '',
        strength: '',
        manufacturer: '',
        status: 'final',
      });
    }
  }, [medicine, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('authToken');
      console.log(token);
      const isUpdating = !!medicine?._id;
      const url = isUpdating 
        ? `${backendUrl}/medicines/update/${medicine._id}` 
        : `${backendUrl}/medicines/post`;
      const method = isUpdating ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.message || 'Failed to save medicine');
      }

      onSuccess();
      onClose();
    } catch (err) {
      console.error('Submission error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  // Reusable Tailwind classes for inputs to keep the code clean
  const inputClasses = "w-full border border-gray-300 dark:border-gray-600 rounded p-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 transition-colors";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto transition-colors duration-200">
        
        {/* Modal Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center sticky top-0 bg-white dark:bg-gray-800 z-10">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">
            {medicine ? 'Edit Medicine' : 'Add New Medicine'}
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 font-bold text-2xl transition-colors"
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-400 rounded text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Brand Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Brand Name</label>
              <input
                type="text"
                name="brandName"
                value={formData.brandName}
                onChange={handleChange}
                required
                className={inputClasses}
                placeholder="e.g. Napa"
              />
            </div>

            {/* Generic Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Generic Name</label>
              <input
                type="text"
                name="genericName"
                value={formData.genericName}
                onChange={handleChange}
                required
                className={inputClasses}
                placeholder="e.g. Paracetamol"
              />
            </div>

            {/* Dosage Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Dosage Type</label>
              <input
                type="text"
                name="dosageType"
                value={formData.dosageType}
                onChange={handleChange}
                className={inputClasses}
                placeholder="e.g. Tablet, Syrup"
              />
            </div>

            {/* Strength */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Strength</label>
              <input
                type="text"
                name="strength"
                value={formData.strength}
                onChange={handleChange}
                className={inputClasses}
                placeholder="e.g. 500mg"
              />
            </div>

            {/* Manufacturer Dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Manufacturer</label>
              <select
                name="manufacturer"
                value={formData.manufacturer}
                onChange={handleChange}
                className={inputClasses}
              >
                <option value="" disabled>Select a Manufacturer</option>
                {companies.map((company, index) => (
                  <option key={index} value={company}>
                    {company}
                  </option>
                ))}
              </select>
            </div>

            {/* Package Mark */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Package Mark</label>
              <input
                type="text"
                name="packageMark"
                value={formData.packageMark}
                onChange={handleChange}
                className={inputClasses}
                placeholder="e.g. Box of 100s"
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className={inputClasses}
              >
                <option value="final">Final</option>
                <option value="pending">Pending</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="mt-8 flex justify-end space-x-3 border-t border-gray-200 dark:border-gray-700 pt-5">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded disabled:bg-blue-400 dark:disabled:bg-blue-800 transition flex items-center shadow-sm"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : 'Save Medicine'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MedicineFormModal;