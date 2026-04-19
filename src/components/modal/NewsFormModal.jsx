import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useNews } from '../../Hook/useNews';
import ImageUpload from '../../config/ImageUploadcpanel';
import { HiXMark } from 'react-icons/hi2';

const CATEGORIES = [
    "Celebrations",
    "Announcements",
    "Events",
    "Meetings",
    "Fitness",
    "Achievements"
];

const NewsFormModal = ({ isOpen, onClose, post, currentBranch, onSuccess }) => {
    const { createNews, updateNews, loading } = useNews();

    const [imageUrl, setImageUrl] = useState('');
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        image: '',
        category: '',
        tags: '',
        date: new Date(),
        branch: currentBranch || ''
    });

    useEffect(() => {
        if (post) {
            setFormData({
                title: post.title || '',
                description: post.description || '',
                image: post.image || '',
                category: post.category?.toLowerCase() || '',
                tags: Array.isArray(post.tags) ? post.tags.join(', ') : post.tags || '',
                date: post.date ? new Date(post.date) : new Date(),
                branch: post.branch || currentBranch || ''
            });
            setImageUrl(post.image || '');
        } else {
            setFormData({
                title: '',
                description: '',
                image: '',
                category: '',
                tags: '',
                date: new Date(),
                branch: currentBranch || ''
            });
            setImageUrl('');
        }
    }, [post, currentBranch]);

    useEffect(() => {
        setFormData((prev) => ({ ...prev, image: imageUrl }));
    }, [imageUrl]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleDescriptionChange = (value) => {
        setFormData((prev) => ({ ...prev, description: value }));
    };

    const handleDateChange = (date) => {
        setFormData((prev) => ({ ...prev, date: date }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const tagsArray = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '');

        const payload = {
            ...formData,
            tags: tagsArray,
        };

        try {
            if (post && post._id) {
                await updateNews(post._id, payload);
            } else {
                await createNews(payload);
            }
            onSuccess();
            onClose();
        } catch (err) {
            alert(err || "An error occurred while saving the post.");
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="bg-base-100 dark:bg-casual-black w-full max-w-4xl rounded-box shadow-xl border border-casual-black/10 dark:border-white/10 my-8">
                <div className="flex items-center justify-between p-6 border-b border-casual-black/10 dark:border-white/10">
                    <h2 className="text-xl font-bold font-secondary text-casual-black dark:text-concrete">
                        {post ? 'Edit Blog Post' : 'Create Blog Post'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="btn btn-sm btn-circle btn-ghost text-casual-black dark:text-concrete"
                    >
                        <HiXMark className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Title */}
                        <div className="form-control w-full">
                            <label className="label pb-1"><span className="label-text font-medium text-casual-black dark:text-concrete">Title *</span></label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="Blog title"
                                className="input input-bordered w-full bg-transparent border-casual-black/20 dark:border-concrete/20 focus:border-sporty-blue text-casual-black dark:text-concrete"
                                required
                            />
                        </div>

                        {/* Category */}
                        <div className="form-control w-full">
                            <label className="label pb-1"><span className="label-text font-medium text-casual-black dark:text-concrete">Category *</span></label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                className="select select-bordered w-full bg-transparent border-casual-black/20 dark:border-concrete/20 focus:border-sporty-blue text-casual-black dark:text-concrete capitalize"
                                required
                            >
                                <option value="" disabled>Select Category</option>
                                {CATEGORIES.map((cat) => (
                                    <option key={cat} value={cat.toLowerCase()}>{cat}</option>
                                ))}
                            </select>
                        </div>

                        {/* Tags */}
                        <div className="form-control w-full">
                            <label className="label pb-1"><span className="label-text font-medium text-casual-black dark:text-concrete">Tags (Comma separated)</span></label>
                            <input
                                type="text"
                                name="tags"
                                value={formData.tags}
                                onChange={handleChange}
                                placeholder="e.g. Health, Update, News"
                                className="input input-bordered w-full bg-transparent border-casual-black/20 dark:border-concrete/20 focus:border-sporty-blue text-casual-black dark:text-concrete"
                            />
                        </div>

                        {/* Date */}
                        <div className="form-control w-full">
                            <label className="label pb-1"><span className="label-text font-medium text-casual-black dark:text-concrete">Date *</span></label>
                            <DatePicker
                                selected={formData.date}
                                onChange={handleDateChange}
                                className="input input-bordered w-full bg-transparent border-casual-black/20 dark:border-concrete/20 focus:border-sporty-blue text-casual-black dark:text-concrete"
                                required
                            />
                        </div>
                    </div>

                    {/* Description (Rich Text) */}
                    <div className="form-control w-full mt-4">
                        <label className="label pb-1"><span className="label-text font-medium text-casual-black dark:text-concrete">Description *</span></label>
                        <div className="bg-white dark:bg-white/5 text-black dark:text-white rounded-xl overflow-hidden border border-casual-black/20 dark:border-concrete/20 pb-10 md:pb-12">
                            <ReactQuill
                                theme="snow"
                                value={formData.description}
                                onChange={handleDescriptionChange}
                                className="h-48"
                                modules={NewsFormModal.modules}
                                formats={NewsFormModal.formats}
                            />
                        </div>
                    </div>

                    {/* Image Upload Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 pt-4">
                        {/* Using the updated ImageUpload component.
                            We removed the manual label here because the updated ImageUpload 
                            now accepts a `label` prop and styles it consistently.
                        */}
                        <div className="form-control w-full">
                            <ImageUpload
                                setImageUrl={setImageUrl}
                                label="Upload Cover Image"
                            />
                        </div>

                        <div className="form-control w-full">
                            <label className="label pb-0"><span className="label-text font-medium text-casual-black dark:text-concrete">Or Image URL</span></label>
                            <input
                                type="text"
                                name="image"
                                value={imageUrl}
                                onChange={(e) => setImageUrl(e.target.value)}
                                className="input input-bordered w-full mt-2 bg-transparent border-casual-black/20 dark:border-concrete/20 focus:border-sporty-blue text-casual-black dark:text-concrete"
                                placeholder="Enter image URL"
                            />
                            {/* Image Preview */}
                            {imageUrl && (
                                <div className="mt-4 border border-casual-black/20 dark:border-white/20 rounded-xl overflow-hidden h-32 w-48 bg-casual-black/5 dark:bg-white/5 flex items-center justify-center">
                                    <img
                                        src={imageUrl}
                                        alt="Preview"
                                        className="h-full w-full object-cover"
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = "https://via.placeholder.com/150?text=Invalid+Image";
                                        }}
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="modal-action mt-6 border-t border-casual-black/10 dark:border-white/10 pt-4">
                        <button
                            type="button"
                            className="btn btn-ghost text-casual-black dark:text-concrete hover:bg-casual-black/5 dark:hover:bg-white/5"
                            onClick={onClose}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn bg-sporty-blue hover:bg-sporty-blue/90 text-concrete border-none px-8"
                            disabled={loading}
                        >
                            {loading ? <span className="loading loading-spinner"></span> : (post ? 'Update Post' : 'Create Post')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

NewsFormModal.modules = {
    toolbar: [
        [{ 'header': '1' }, { 'header': '2' }, { 'font': [] }],
        [{ size: [] }],
        ['bold', 'italic', 'underline', 'strike', 'blockquote'],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
        ['clean']
    ],
};

NewsFormModal.formats = [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet', 'indent',
];

export default NewsFormModal;