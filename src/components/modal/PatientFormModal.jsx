import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import usePatient from '../../Hook/usePatient';

const PatientFormModal = ({ isOpen, onClose, patient, onSuccess, branch }) => {
    const { createPatient, updatePatient, loading } = usePatient();
    const { register, handleSubmit, reset, formState: { errors } } = useForm();

    useEffect(() => {
        if (patient) {
            reset({
                ...patient,
                dateOfBirth: patient.dateOfBirth ? new Date(patient.dateOfBirth).toISOString().split('T')[0] : '',
                // Ensure nested emergencyContact fields populate correctly
                emergencyContact: patient.emergencyContact || { name: '', phone: '' }
            });
        } else {
            reset({
                fullName: '', email: '', phone: '', gender: 'Male', bloodGroup: '',
                age: '', dateOfBirth: '', address: '', allergies: '', medicalHistory: '',
                emergencyContact: { name: '', phone: '' }
            });
        }
    }, [patient, reset, isOpen]);

    const onSubmit = async (data) => {
        try {
            const payload = { ...data, branch };
            if (patient?._id) {
                await updatePatient(patient._id, payload);
            } else {
                await createPatient(payload);
            }
            onSuccess();
            onClose();
        } catch (err) {
            console.error("Form Submission Error:", err);
        }
    };

    if (!isOpen) return null;

    return (
        <dialog className={`modal ${isOpen ? 'modal-open' : ''}`}>
            <div className="modal-box bg-white dark:bg-casual-black max-w-3xl"> {/* Expanded width for more fields */}
                <h3 className="font-bold text-lg mb-4 text-casual-black dark:text-concrete">
                    {patient ? 'Edit Patient' : 'Add New Patient'}
                </h3>
                <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Basic Info */}
                    <div className="form-control">
                        <label className="label text-xs font-bold uppercase">Full Name *</label>
                        <input {...register("fullName", { required: "Name is required" })} className="input input-bordered bg-base-100 dark:bg-casual-black" />
                        {errors.fullName && <span className="text-error text-xs">{errors.fullName.message}</span>}
                    </div>
                    <div className="form-control">
                        <label className="label text-xs font-bold uppercase">Phone *</label>
                        <input {...register("phone", { required: "Phone is required" })} className="input input-bordered bg-base-100 dark:bg-casual-black" />
                        {errors.phone && <span className="text-error text-xs">{errors.phone.message}</span>}
                    </div>
                    <div className="form-control">
                        <label className="label text-xs font-bold uppercase">Email</label>
                        <input {...register("email")} type="email" className="input input-bordered bg-base-100 dark:bg-casual-black" />
                    </div>

                    {/* Demographics */}
                    <div className="form-control">
                        <label className="label text-xs font-bold uppercase">Date of Birth</label>
                        <input {...register("dateOfBirth")} type="date" className="input input-bordered bg-base-100 dark:bg-casual-black" />
                    </div>
                    <div className="form-control">
                        <label className="label text-xs font-bold uppercase">Age</label>
                        <input {...register("age")} type="number" className="input input-bordered bg-base-100 dark:bg-casual-black" />
                    </div>
                    <div className="form-control">
                        <label className="label text-xs font-bold uppercase">Gender *</label>
                        <select {...register("gender", { required: true })} className="select select-bordered bg-base-100 dark:bg-casual-black">
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                    <div className="form-control">
                        <label className="label text-xs font-bold uppercase">Blood Group</label>
                        <select {...register("bloodGroup")} className="select select-bordered bg-base-100 dark:bg-casual-black">
                            <option value="">Select</option>
                            {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(bg => <option key={bg} value={bg}>{bg}</option>)}
                        </select>
                    </div>

                    {/* Address & Emergency Contact */}
                    <div className="form-control md:col-span-2">
                        <label className="label text-xs font-bold uppercase">Address</label>
                        <input {...register("address")} className="input input-bordered bg-base-100 dark:bg-casual-black" />
                    </div>
                    <div className="form-control">
                        <label className="label text-xs font-bold uppercase">Emergency Contact Name</label>
                        <input {...register("emergencyContact.name")} className="input input-bordered bg-base-100 dark:bg-casual-black" />
                    </div>
                    <div className="form-control">
                        <label className="label text-xs font-bold uppercase">Emergency Contact Phone</label>
                        <input {...register("emergencyContact.phone")} className="input input-bordered bg-base-100 dark:bg-casual-black" />
                    </div>

                    {/* Medical Details */}
                    <div className="form-control md:col-span-2">
                        <label className="label text-xs font-bold uppercase">Allergies</label>
                        <textarea {...register("allergies")} className="textarea textarea-bordered bg-base-100 dark:bg-casual-black" rows="2" placeholder="List any known allergies..." />
                    </div>
                    <div className="form-control md:col-span-2">
                        <label className="label text-xs font-bold uppercase">Medical History</label>
                        <textarea {...register("medicalHistory")} className="textarea textarea-bordered bg-base-100 dark:bg-casual-black" rows="2" placeholder="Brief medical history..." />
                    </div>

                    {/* Actions */}
                    <div className="modal-action md:col-span-2 mt-4">
                        <button type="button" onClick={onClose} className="btn btn-ghost">Cancel</button>
                        <button type="submit" className="btn bg-sporty-blue hover:bg-sporty-blue/90 text-white border-none" disabled={loading}>
                            {loading && <span className="loading loading-spinner"></span>}
                            {patient ? 'Update' : 'Save'} Patient
                        </button>
                    </div>
                </form>
            </div>
        </dialog>
    );
};

export default PatientFormModal;