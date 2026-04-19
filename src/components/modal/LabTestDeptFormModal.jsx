// components/modal/LabTestDeptFormModal.jsx
import React, { useState, useEffect } from 'react';
import useLabTestDept from '../../Hook/useLabTestDept';

const LabTestDeptFormModal = ({ isOpen, onClose, department, onSuccess }) => {
  const [formData, setFormData] = useState({
    departmentName: '',
  });

  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { createLabTestDept, updateLabTestDept } = useLabTestDept();

  useEffect(() => {
    if (department) {
      setFormData({
        departmentName: department.departmentName || '',
      });
    } else {
      setFormData({
        departmentName: '',
      });
    }
    setFormError('');
  }, [department, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setIsSubmitting(true);

    if (!formData.departmentName.trim()) {
      setFormError('Department name is required.');
      setIsSubmitting(false);
      return;
    }

    try {
      if (department?._id) {
        await updateLabTestDept(department._id, formData);
      } else {
        await createLabTestDept(formData);
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
            {department ? 'Edit Department' : 'Add New Department'}
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

          <form id="dept-form" onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">
            {/* Department Name */}
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text text-casual-black dark:text-concrete font-medium">Department Name *</span>
              </label>
              <input 
                type="text" 
                name="departmentName"
                value={formData.departmentName}
                onChange={handleChange}
                placeholder="e.g. Pathology, Radiology" 
                className="input input-bordered w-full bg-base-100 dark:bg-[#1a1a1a] border-casual-black/20 dark:border-concrete/20 focus:border-sporty-blue" 
                required
              />
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
            form="dept-form"
            className="btn bg-sporty-blue hover:bg-sporty-blue/90 text-concrete border-none font-secondary min-w-[100px]"
            disabled={isSubmitting}
          >
            {isSubmitting ? <span className="loading loading-spinner loading-sm"></span> : department ? 'Update' : 'Save'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default LabTestDeptFormModal;