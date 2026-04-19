import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import useDoctorProfile from '../../Hook/useDoctorProfile';

const DoctorProfileFormModal = ({ isOpen, onClose, profile, onSuccess, branches }) => {
    const { createProfile, updateProfile } = useDoctorProfile();
    const [loading, setLoading] = useState(false);

    // Perfectly aligned with DoctorProfileSchema
    const initialFormState = {
        name: '',
        bmdcRegistrationNumber: '',
        degree: '',
        designation: '',
        institution: '',
        phone: '',
        email: '',
        nid: '',
        address: '',
        division: '',
        district: '',
        signature: '',
        doctorPicture: '',
        branch: '',
    };

    const [formData, setFormData] = useState(initialFormState);

    useEffect(() => {
        if (isOpen) {
            if (profile) {
                setFormData({
                    name: profile.name || '',
                    bmdcRegistrationNumber: profile.bmdcRegistrationNumber || '',
                    degree: profile.degree || '',
                    designation: profile.designation || '',
                    institution: profile.institution || '',
                    phone: profile.phone || '',
                    email: profile.email || '',
                    nid: profile.nid || '',
                    address: profile.address || '',
                    division: profile.division || '',
                    district: profile.district || '',
                    signature: profile.signature || '',
                    doctorPicture: profile.doctorPicture || '',
                    branch: profile.branch || '',
                });
            } else {
                setFormData(initialFormState);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, profile]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const validateForm = () => {
        // Check required fields based on Mongoose schema
        if (
            !formData.name.trim() ||
            !formData.branch.trim() ||
            !formData.bmdcRegistrationNumber.trim() ||
            !formData.degree.trim() ||
            !formData.designation.trim() ||
            !formData.institution.trim()
        ) {
            Swal.fire({
                icon: 'warning',
                title: 'Missing Fields',
                text: 'Please fill in all required fields marked with an asterisk (*).'
            });
            return false;
        }

        // Email format validation (if provided)
        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            Swal.fire({
                icon: 'warning',
                title: 'Invalid Email',
                text: 'Please enter a valid email address.'
            });
            return false;
        }

        // Phone length/format validation (basic check, if provided)
        if (formData.phone && formData.phone.length < 6) {
            Swal.fire({
                icon: 'warning',
                title: 'Invalid Phone Number',
                text: 'Please enter a valid phone number.'
            });
            return false;
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setLoading(true);

        try {
            if (profile && profile._id) {
                await updateProfile(profile._id, formData);
                Swal.fire({
                    icon: 'success',
                    title: 'Success!',
                    text: 'Doctor profile updated successfully.',
                    timer: 2000,
                    showConfirmButton: false
                });
            } else {
                await createProfile(formData);
                Swal.fire({
                    icon: 'success',
                    title: 'Success!',
                    text: 'New doctor profile created successfully.',
                    timer: 2000,
                    showConfirmButton: false
                });
            }
            onSuccess();
            onClose();
        } catch (err) {
            Swal.fire({
                icon: 'error',
                title: 'Operation Failed',
                text: err || 'An error occurred while saving the profile. Check for duplicate BMDC/Branch combinations.'
            });
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal modal-open">
            <div className="modal-box bg-base-100 dark:bg-casual-black text-casual-black dark:text-concrete border border-casual-black/10 dark:border-white/10 max-w-4xl">
                <h3 className="font-bold text-lg mb-4 border-b pb-2 border-casual-black/10 dark:border-white/10">
                    {profile ? 'Edit Doctor Profile' : 'Add New Doctor Profile'}
                </h3>

                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* Professional Information */}
                    <div>
                        <h4 className="font-semibold text-sm mb-2 text-sporty-blue">Professional Details</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div className="form-control">
                                <label className="label"><span className="label-text dark:text-concrete">Doctor Name *</span></label>
                                <input type="text" name="name" value={formData.name} onChange={handleChange} className="input input-sm input-bordered bg-transparent dark:border-white/20" />
                            </div>

                            <div className="form-control">
                                <label className="label"><span className="label-text dark:text-concrete">Branch *</span></label>
                                <input type="text" name="branch" value={formData.branch} onChange={handleChange} placeholder="Enter or select" className="input input-sm input-bordered bg-transparent dark:border-white/20" list="branch-options" />
                                <datalist id="branch-options">
                                    {branches?.map((b, idx) => <option key={idx} value={b} />)}
                                </datalist>
                            </div>

                            <div className="form-control">
                                <label className="label"><span className="label-text dark:text-concrete">BMDC Reg No *</span></label>
                                <input type="text" name="bmdcRegistrationNumber" value={formData.bmdcRegistrationNumber} onChange={handleChange} className="input input-sm input-bordered bg-transparent dark:border-white/20" />
                            </div>

                            <div className="form-control">
                                <label className="label"><span className="label-text dark:text-concrete">Degree *</span></label>
                                <input type="text" name="degree" value={formData.degree} onChange={handleChange} className="input input-sm input-bordered bg-transparent dark:border-white/20" />
                            </div>

                            <div className="form-control">
                                <label className="label"><span className="label-text dark:text-concrete">Designation *</span></label>
                                <input type="text" name="designation" value={formData.designation} onChange={handleChange} className="input input-sm input-bordered bg-transparent dark:border-white/20" />
                            </div>

                            <div className="form-control">
                                <label className="label"><span className="label-text dark:text-concrete">Institution *</span></label>
                                <input type="text" name="institution" value={formData.institution} onChange={handleChange} className="input input-sm input-bordered bg-transparent dark:border-white/20" />
                            </div>
                        </div>
                    </div>

                    {/* Contact & Personal Information */}
                    <div>
                        <h4 className="font-semibold text-sm mb-2 text-sporty-blue">Contact & Personal Details</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div className="form-control">
                                <label className="label"><span className="label-text dark:text-concrete">Phone</span></label>
                                <input type="text" name="phone" value={formData.phone} onChange={handleChange} className="input input-sm input-bordered bg-transparent dark:border-white/20" />
                            </div>

                            <div className="form-control">
                                <label className="label"><span className="label-text dark:text-concrete">Email</span></label>
                                <input type="email" name="email" value={formData.email} onChange={handleChange} className="input input-sm input-bordered bg-transparent dark:border-white/20" />
                            </div>

                            <div className="form-control">
                                <label className="label"><span className="label-text dark:text-concrete">NID</span></label>
                                <input type="text" name="nid" value={formData.nid} onChange={handleChange} className="input input-sm input-bordered bg-transparent dark:border-white/20" />
                            </div>
                        </div>
                    </div>

                    {/* Location Information */}
                    <div>
                        <h4 className="font-semibold text-sm mb-2 text-sporty-blue">Location Information</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div className="form-control lg:col-span-1">
                                <label className="label"><span className="label-text dark:text-concrete">Division</span></label>
                                <input type="text" name="division" value={formData.division} onChange={handleChange} className="input input-sm input-bordered bg-transparent dark:border-white/20" />
                            </div>

                            <div className="form-control lg:col-span-1">
                                <label className="label"><span className="label-text dark:text-concrete">District</span></label>
                                <input type="text" name="district" value={formData.district} onChange={handleChange} className="input input-sm input-bordered bg-transparent dark:border-white/20" />
                            </div>

                            <div className="form-control lg:col-span-1">
                                <label className="label"><span className="label-text dark:text-concrete">Address</span></label>
                                <input type="text" name="address" value={formData.address} onChange={handleChange} className="input input-sm input-bordered bg-transparent dark:border-white/20" />
                            </div>
                        </div>
                    </div>

                    {/* Media Links */}
                    <div>
                        <h4 className="font-semibold text-sm mb-2 text-sporty-blue">Media Links (URLs)</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="form-control">
                                <label className="label"><span className="label-text dark:text-concrete">Doctor Picture URL</span></label>
                                <input type="text" name="doctorPicture" value={formData.doctorPicture} onChange={handleChange} placeholder="https://..." className="input input-sm input-bordered bg-transparent dark:border-white/20" />
                            </div>

                            <div className="form-control">
                                <label className="label"><span className="label-text dark:text-concrete">Signature Image URL</span></label>
                                <input type="text" name="signature" value={formData.signature} onChange={handleChange} placeholder="https://..." className="input input-sm input-bordered bg-transparent dark:border-white/20" />
                            </div>
                        </div>
                    </div>

                    <div className="modal-action border-t border-casual-black/10 dark:border-white/10 pt-4">
                        <button type="button" className="btn btn-ghost" onClick={onClose} disabled={loading}>Cancel</button>
                        <button type="submit" className="btn bg-sporty-blue hover:bg-sporty-blue/90 text-concrete border-none" disabled={loading}>
                            {loading ? <span className="loading loading-spinner"></span> : 'Save Profile'}
                        </button>
                    </div>
                </form>
            </div>
            <div className="modal-backdrop bg-black/40" onClick={onClose}></div>
        </div>
    );
};

export default DoctorProfileFormModal;