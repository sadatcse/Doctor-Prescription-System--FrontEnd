import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import useUserDoctor from '../../Hook/useUserDoctor';

const ChangePasswordModal = ({ isOpen, onClose, user }) => {
    const { changeUserPassword, loading } = useUserDoctor();
    const { register, handleSubmit, reset, formState: { errors } } = useForm();

    useEffect(() => {
        if (isOpen) reset(); // Clear form when opened
    }, [isOpen, reset]);

    const onSubmit = async (data) => {
        try {
            await changeUserPassword(user._id, data.newPassword);
            alert("Password updated successfully!");
            onClose();
        } catch (err) {
            console.error("Failed to update password:", err);
            alert("Error updating password.");
        }
    };

    if (!isOpen || !user) return null;

    return (
        <dialog className={`modal ${isOpen ? 'modal-open' : ''}`}>
            <div className="modal-box bg-white dark:bg-casual-black max-w-md border border-casual-black/10 dark:border-white/10">
                <h3 className="font-bold text-lg mb-4 text-casual-black dark:text-concrete">
                    Change Password for {user.fullName || user.name}
                </h3>
                
                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
                    <div className="form-control">
                        <label className="label text-xs font-bold uppercase">New Password *</label>
                        <input 
                            {...register("newPassword", { 
                                required: "New Password is required", 
                                minLength: { value: 6, message: "Minimum 6 characters" } 
                            })} 
                            type="password" 
                            className="input input-bordered bg-base-100 dark:bg-casual-black" 
                            placeholder="Enter new password"
                        />
                        {errors.newPassword && <span className="text-error text-xs mt-1">{errors.newPassword.message}</span>}
                    </div>

                    <div className="modal-action">
                        <button type="button" onClick={onClose} className="btn btn-ghost">Cancel</button>
                        <button type="submit" className="btn bg-warning text-casual-black border-none hover:bg-warning/80" disabled={loading}>
                            {loading && <span className="loading loading-spinner"></span>}
                            Update Password
                        </button>
                    </div>
                </form>
            </div>
        </dialog>
    );
};

export default ChangePasswordModal;