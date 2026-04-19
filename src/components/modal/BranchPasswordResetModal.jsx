import React, { useState, useEffect } from 'react';
import { useUser } from '../../Hook/useUser';
import { HiXMark, HiArrowPath } from "react-icons/hi2";

const BranchPasswordResetModal = ({ isOpen, onClose, user }) => {
    const { updateUser, loading } = useUser();
    const [password, setPassword] = useState('');
    const [passwordStrength, setPasswordStrength] = useState({ score: 0, label: '', color: '' });
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        setPassword('');
        setPasswordStrength({ score: 0, label: '', color: '' });
        setMessage({ type: '', text: '' });
    }, [isOpen]);

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
        const val = e.target.value;
        setPassword(val);
        setPasswordStrength(evaluatePassword(val));
    };

    const generatePassword = () => {
        const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
        let generated = "";
        for (let i = 0; i < 12; i++) {
            generated += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setPassword(generated);
        setPasswordStrength(evaluatePassword(generated));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });

        if (!password) {
            setMessage({ type: 'error', text: 'Password cannot be empty.' });
            return;
        }

        try {
            await updateUser(user._id, { password });
            setMessage({ type: 'success', text: 'Branch user password reset successfully!' });
            setTimeout(() => onClose(), 1500);
        } catch (err) {
            setMessage({ type: 'error', text: err || 'Failed to reset password.' });
        }
    };

    if (!isOpen || !user) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-casual-black/60 backdrop-blur-sm p-4">
            <div className="bg-base-100 dark:bg-casual-black w-full max-w-md rounded-box shadow-xl border border-casual-black/10 dark:border-white/10 overflow-hidden flex flex-col">

                <div className="flex justify-between items-center p-6 border-b border-casual-black/5 dark:border-white/10">
                    <h2 className="text-xl font-bold text-casual-black dark:text-concrete font-secondary">
                        Branch Password Reset
                    </h2>
                    <button onClick={onClose} className="btn btn-sm btn-circle btn-ghost text-casual-black/50 hover:text-casual-black dark:text-concrete/50 dark:hover:text-concrete">
                        <HiXMark className="h-5 w-5" />
                    </button>
                </div>

                <div className="p-6 font-primary">
                    <p className="text-sm mb-4 text-casual-black/70 dark:text-concrete/70">
                        Resetting password for: <span className="font-bold">{user.email}</span>
                    </p>

                    {message.text && (
                        <div className={`alert ${message.type === 'error' ? 'alert-error bg-fascinating-magenta/10 text-fascinating-magenta border-fascinating-magenta/20' : 'alert-success bg-earls-green/10 text-earls-green border-earls-green/20'} shadow-sm mb-4 text-sm`}>
                            {message.text}
                        </div>
                    )}

                    <form id="branch-reset-password-form" onSubmit={handleSubmit} className="space-y-4">
                        <div className="form-control w-full">
                            <label className="label">
                                <span className="label-text dark:text-concrete font-medium">New Password *</span>
                                <button type="button" onClick={generatePassword} className="label-text-alt text-sporty-blue hover:underline flex items-center gap-1">
                                    <HiArrowPath /> Generate
                                </button>
                            </label>
                            <input
                                required
                                type="text"
                                value={password}
                                onChange={handleInputChange}
                                className="input input-bordered w-full bg-transparent dark:border-white/20 focus:border-sporty-blue font-mono"
                                placeholder="Enter new password"
                            />

                            {password && (
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
                    <button type="submit" form="branch-reset-password-form" disabled={loading} className="btn bg-earls-green hover:bg-earls-green/90 text-casual-black border-none font-secondary min-w-[100px]">
                        {loading ? <span className="loading loading-spinner loading-sm"></span> : 'Reset Access'}
                    </button>
                </div>

            </div>
        </div>
    );
};

export default BranchPasswordResetModal;