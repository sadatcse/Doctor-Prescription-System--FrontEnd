// components/modal/LabtestFormModal.jsx
import React, { useState, useEffect } from 'react';
import useLabtest from '../../Hook/useLabtest';

const LabtestFormModal = ({ isOpen, onClose, labtest, onSuccess, departments = [] }) => {
  const [formData, setFormData] = useState({
    testName: '',
    department: '',
    status: 'pending', // ADDED: Default status
  });

  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { createLabtest, updateLabtest } = useLabtest();

  useEffect(() => {
    if (labtest) {
      setFormData({
        testName: labtest.testName || '',
        department: labtest.department || '',
        status: labtest.status || 'pending', // ADDED: Load existing status
      });
    } else {
      setFormData({
        testName: '',
        department: '',
        status: 'pending',
      });
    }
    setFormError('');
  }, [labtest, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setIsSubmitting(true);

    if (!formData.testName.trim() || !formData.department.trim()) {
      setFormError('Both Test Name and Department are required.');
      setIsSubmitting(false);
      return;
    }

    try {
      if (labtest?._id) {
        await updateLabtest(labtest._id, formData);
      } else {
        await createLabtest(formData);
      }
      onSuccess();
      onClose();
    } catch (err) {
      setFormError(err.toString());
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-casual-black/50 backdrop-blur-sm p-4">
      <div className="bg-base-100 dark:bg-casual-black w-full max-w-lg rounded-box shadow-xl border border-casual-black/10 dark:border-white/10 flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="px-6 py-4 border-b border-casual-black/10 dark:border-white/10 flex justify-between items-center bg-concrete dark:bg-white/5 rounded-t-box">
          <h2 className="text-xl font-bold text-casual-black dark:text-concrete font-secondary">
            {labtest ? 'Edit Lab Test' : 'Add New Lab Test'}
          </h2>
          <button onClick={onClose} className="btn btn-sm btn-circle btn-ghost text-casual-black dark:text-concrete">
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
          {formError && (
            <div className="alert alert-error bg-fascinating-magenta/10 text-fascinating-magenta border border-fascinating-magenta/20 shadow-sm mb-6 text-sm">
              {formError}
            </div>
          )}

          <form id="labtest-form" onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">

            {/* Test Name */}
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text text-casual-black dark:text-concrete font-medium">Test Name *</span>
              </label>
              <input
                type="text"
                name="testName"
                value={formData.testName}
                onChange={handleChange}
                placeholder="e.g. Complete Blood Count (CBC)"
                className="input input-bordered w-full bg-base-100 dark:bg-[#1a1a1a] border-casual-black/20 dark:border-concrete/20 focus:border-sporty-blue"
                required
              />
            </div>

            {/* Dynamic Department Dropdown */}
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text text-casual-black dark:text-concrete font-medium">Department *</span>
              </label>
              {departments.length === 0 ? (
                <select disabled className="select select-bordered w-full bg-base-100 dark:bg-[#1a1a1a] text-casual-black/40 dark:text-concrete/40 border-casual-black/20 dark:border-concrete/20">
                  <option>Loading departments...</option>
                </select>
              ) : (
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className="select select-bordered w-full bg-base-100 dark:bg-[#1a1a1a] border-casual-black/20 dark:border-concrete/20 focus:border-sporty-blue transition-colors"
                  required
                >
                  <option value="" disabled>Select a Department</option>
                  {departments.map((deptName, index) => (
                    <option key={index} value={deptName}>
                      {deptName}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* ADDED: Status Dropdown */}
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text text-casual-black dark:text-concrete font-medium">Status</span>
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="select select-bordered w-full bg-base-100 dark:bg-[#1a1a1a] border-casual-black/20 dark:border-concrete/20 focus:border-sporty-blue transition-colors"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="pending">Pending</option>
              </select>
            </div>

          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-casual-black/10 dark:border-white/10 flex justify-end gap-3 bg-concrete dark:bg-white/5 rounded-b-box">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-ghost text-casual-black dark:text-concrete font-secondary"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            form="labtest-form"
            className="btn bg-sporty-blue hover:bg-sporty-blue/90 text-concrete border-none font-secondary min-w-[100px]"
            disabled={isSubmitting}
          >
            {isSubmitting ? <span className="loading loading-spinner loading-sm"></span> : labtest ? 'Update' : 'Save'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default LabtestFormModal;