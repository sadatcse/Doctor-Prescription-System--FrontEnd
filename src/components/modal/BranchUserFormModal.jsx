import React, { useState, useEffect } from 'react';
import { useUser } from '../../Hook/useUser';
import { HiXMark, HiArrowPath, HiShieldExclamation } from "react-icons/hi2";

const ROLES = ["Compounders", "Assistants", "Doctor", "Admin", "SuperAdmin"];
const STATUSES = ["active", "inactive", "on-leave"];

const BranchUserFormModal = ({ isOpen, onClose, user, currentBranch, onSuccess }) => {
    const isEditing = !!user;
    const { createUser, updateUser, loading, error } = useUser();
    const [formError, setFormError] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        role: '',
        status: 'active',
        password: '',
    });

    const [passwordStrength, setPasswordStrength] = useState({ score: 0, label: '', color: '' });

    useEffect(() => {
        if (user && isEditing) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
                role: user.role || '',
                status: user.status || 'active',
                password: '',
            });
            setPasswordStrength({ score: 0, label: '', color: '' });
        } else {
            setFormData({
                name: '',
                email: '',
                phone: '',
                role: '',
                status: 'active',
                password: '',
            });
        }
        setFormError('');
    }, [user, isEditing, isOpen]);

    const evaluatePassword = (pwd) => {
        let score = 0;
        if (pwd.length > 7) score += 1;
        if (/[A-Z]/.test(pwd)) score += 1;
        if (/[0-9]/.test(pwd)) score += 1;
        if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

        let label = '';
        let color = '';
        if (pwd.length === 0) {
            label = ''; color = 'bg-gray-300 dark:bg-gray-700';
        } else if (score <= 1) {
            label = 'Weak'; color = 'bg-fascinating-magenta';
        } else if (score === 2 || score === 3) {
            label = 'Medium'; color = 'bg-yellow-500';
        } else {
            label = 'Strong'; color = 'bg-earls-green';
        }
        return { score, label, color };
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));

        if (name === 'password') {
            setPasswordStrength(evaluatePassword(value));
        }
    };

    const generatePassword = () => {
        const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
        let generated = "";
        for (let i = 0; i < 12; i++) {
            generated += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setFormData(prev => ({ ...prev, password: generated }));
        setPasswordStrength(evaluatePassword(generated));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError('');

        if (!currentBranch) {
            setFormError("Branch context is missing. Cannot save user.");
            return;
        }

        try {
            if (isEditing) {
                const payload = { ...formData, branch: currentBranch };
                if (!payload.password) {
                    delete payload.password;
                }
                await updateUser(user._id, payload);
            } else {
                if (!formData.password) {
                    setFormError("Password is required for new users.");
                    return;
                }
                await createUser({ ...formData, branch: currentBranch });
            }
            onSuccess();
            onClose();
        } catch (err) {
            setFormError(err || "An error occurred while saving the branch user.");
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-casual-black/60 backdrop-blur-sm p-4">
            <div className="bg-base-100 dark:bg-casual-black w-full max-w-2xl rounded-box shadow-xl border border-casual-black/10 dark:border-white/10 overflow-hidden flex flex-col max-h-[90vh]">

                <div className="flex justify-between items-center p-6 border-b border-casual-black/5 dark:border-white/10">
                    <h2 className="text-xl font-bold text-casual-black dark:text-concrete font-secondary">
                        {isEditing ? 'Edit Branch User' : 'Add Branch User'}
                    </h2>
                    <button onClick={onClose} className="btn btn-sm btn-circle btn-ghost text-casual-black/50 hover:text-casual-black dark:text-concrete/50 dark:hover:text-concrete">
                        <HiXMark className="h-5 w-5" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto font-primary flex-1">
                    {/* Branch Lock Info */}


                    {(error || formError) && (
                        <div className="alert alert-error bg-fascinating-magenta/10 text-fascinating-magenta border border-fascinating-magenta/20 shadow-sm mb-4 text-sm">
                            {error || formError}
                        </div>
                    )}

                    <form id="branch-user-form" onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="form-control w-full">
                                <label className="label"><span className="label-text dark:text-concrete font-medium">Name *</span></label>
                                <input required type="text" name="name" value={formData.name} onChange={handleInputChange} className="input input-bordered w-full bg-transparent dark:border-white/20 focus:border-sporty-blue" />
                            </div>

                            <div className="form-control w-full">
                                <label className="label"><span className="label-text dark:text-concrete font-medium">Email *</span></label>
                                <input required type="email" name="email" value={formData.email} onChange={handleInputChange} className="input input-bordered w-full bg-transparent dark:border-white/20 focus:border-sporty-blue" />
                            </div>

                            <div className="form-control w-full">
                                <label className="label"><span className="label-text dark:text-concrete font-medium">Phone *</span></label>
                                <input required type="text" name="phone" value={formData.phone} onChange={handleInputChange} className="input input-bordered w-full bg-transparent dark:border-white/20 focus:border-sporty-blue" />
                            </div>

                            <div className="form-control w-full">
                                <label className="label"><span className="label-text dark:text-concrete font-medium">Role *</span></label>
                                <select required name="role" value={formData.role} onChange={handleInputChange} className="select select-bordered w-full bg-transparent dark:border-white/20 focus:border-sporty-blue">
                                    <option value="" disabled>Select Role</option>
                                    {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                                </select>
                            </div>

                            <div className="form-control w-full md:col-span-2">
                                <label className="label"><span className="label-text dark:text-concrete font-medium">Status</span></label>
                                <select name="status" value={formData.status} onChange={handleInputChange} className="select select-bordered w-full bg-transparent dark:border-white/20 focus:border-sporty-blue">
                                    {STATUSES.map(s => <option key={s} value={s}>{s.replace('-', ' ')}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="form-control w-full mt-4">
                            <label className="label">
                                <span className="label-text dark:text-concrete font-medium">
                                    Password {isEditing && <span className="text-xs text-casual-black/50 dark:text-concrete/50">(Leave blank to keep current)</span>}
                                    {!isEditing && "*"}
                                </span>
                                <button type="button" onClick={generatePassword} className="label-text-alt text-sporty-blue hover:underline flex items-center gap-1">
                                    <HiArrowPath /> Generate
                                </button>
                            </label>
                            <input
                                required={!isEditing}
                                type="text"
                                name="password"
                                value={formData.password}
                                onChange={handleInputChange}
                                className="input input-bordered w-full bg-transparent dark:border-white/20 focus:border-sporty-blue font-mono"
                                placeholder="Enter password"
                            />

                            {formData.password && (
                                <div className="mt-2 flex items-center gap-2">
                                    <div className="flex-1 flex gap-1 h-1.5 rounded-full overflow-hidden bg-casual-black/10 dark:bg-white/10">
                                        {[1, 2, 3, 4].map((level) => (
                                            <div key={level} className={`h-full flex-1 transition-colors duration-300 ${level <= passwordStrength.score ? passwordStrength.color : 'bg-transparent'}`}></div>
                                        ))}
                                    </div>
                                    <span className={`text-xs font-bold ${passwordStrength.color.replace('bg-', 'text-')}`}>
                                        {passwordStrength.label}
                                    </span>
                                </div>
                            )}
                        </div>
                    </form>
                </div>

                <div className="p-6 border-t border-casual-black/5 dark:border-white/10 flex justify-end gap-3 bg-casual-black/5 dark:bg-white/5">
                    <button type="button" onClick={onClose} className="btn btn-ghost text-casual-black dark:text-concrete font-secondary">
                        Cancel
                    </button>
                    <button type="submit" form="branch-user-form" disabled={loading} className="btn bg-sporty-blue hover:bg-sporty-blue/90 text-concrete border-none font-secondary min-w-[100px]">
                        {loading ? <span className="loading loading-spinner loading-sm"></span> : 'Save User'}
                    </button>
                </div>

            </div>
        </div>
    );
};

export default BranchUserFormModal;