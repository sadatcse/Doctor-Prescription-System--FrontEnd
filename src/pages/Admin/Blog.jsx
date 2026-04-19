import React, { useState, useEffect, useCallback, useContext } from 'react';
import dayjs from 'dayjs';
import { HiPlus, HiPencilSquare, HiTrash, HiMagnifyingGlass } from "react-icons/hi2";
import { MdNavigateBefore, MdNavigateNext } from "react-icons/md";
import { AuthContext } from '../../providers/AuthProvider';
import { useNews } from '../../Hook/useNews';
import SectionTitle from '../../components/common/SectionTitle';
import ConfirmDeleteModal from '../../components/common/ConfirmDeleteModal';
import NewsFormModal from '../../components/modal/NewsFormModal';
import OfflineWarning from '../../components/common/offlineComponent';

const CATEGORIES = [
    "General Health",
    "Disease & Conditions",
    "Symptoms & Diagnosis",
    "Treatment & Procedures",
    "Medications",
    "Mental Health",
    "Nutrition & Diet",
    "Fitness & Exercise",
    "Women’s Health",
    "Men’s Health",
    "Child Health (Pediatrics)",
    "Pregnancy & Parenting",
    "Heart & Cardiology",
    "Diabetes & Endocrinology",
    "Skin & Dermatology",
    "Dental & Oral Health",
    "Eye & Vision",
    "ENT (Ear, Nose, Throat)",
    "Neurology & Brain",
    "Orthopedics & Bones",
    "Cancer & Oncology",
    "Infectious Diseases",
    "Lifestyle & Wellness",
    "Preventive Care",
    "Vaccination",
    "Public Health Awareness",
    "Medical News & Research",
    "Doctor’s Advice",
    "Patient Stories",
    "Emergency & First Aid"
];

const Blog = () => {
    // Context
    const { branch } = useContext(AuthContext);

    // Filters State
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');

    // Pagination State
    const [itemsPerPage, setItemsPerPage] = useState(5);
    const [currentPage, setCurrentPage] = useState(0);

    // Data State
    const [newsList, setNewsList] = useState([]);

    // Hook Destructuring
    const { getAllNews, deleteNews, loading: newsLoading, error: newsError } = useNews();

    // Modals States
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [selectedPost, setSelectedPost] = useState(null);

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [postToDelete, setPostToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isOnline, setIsOnline] = useState(navigator.onLine);


    
useEffect(() => {
    // Functions to update the state
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    // Listen for changes
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Cleanup listeners when the component unmounts
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);


 


    // Fetch News List
    const fetchNews = useCallback(async () => {
        try {
            const response = await getAllNews();
            if (response) {
                setNewsList(response);
            }
        } catch (err) {
            console.error("Failed to fetch news:", err);
        }
    }, [getAllNews]);

    useEffect(() => {
        fetchNews();
    }, [fetchNews]);

    // Frontend Filtering Logic
    const filteredNews = newsList.filter((post) => {
        // If context requires branch specific filter, uncomment below line:
        // if (branch && post.branch !== branch) return false;

        const searchLower = searchTerm.toLowerCase();
        const matchesSearch =
            (post.title?.toLowerCase().includes(searchLower)) ||
            (post.tags?.some(tag => tag.toLowerCase().includes(searchLower)));

        const matchesCategory = categoryFilter ? post.category?.toLowerCase() === categoryFilter.toLowerCase() : true;

        return matchesSearch && matchesCategory;
    });

    // Pagination Logic
    const numberOfPages = Math.ceil(filteredNews.length / itemsPerPage);
    const paginatedNews = filteredNews.slice(
        currentPage * itemsPerPage,
        (currentPage + 1) * itemsPerPage
    );

    // Reset page to 0 when filters change
    useEffect(() => {
        setCurrentPage(0);
    }, [searchTerm, categoryFilter, itemsPerPage]);

    // Handlers
    const handleAddClick = () => { setSelectedPost(null); setIsFormModalOpen(true); };
    const handleEditClick = (post) => { setSelectedPost(post); setIsFormModalOpen(true); };
    const handleDeleteClick = (post) => { setPostToDelete(post); setIsDeleteModalOpen(true); };
    const handleSearchChange = (e) => setSearchTerm(e.target.value);

    const handlePrevPage = () => {
        if (currentPage > 0) setCurrentPage(currentPage - 1);
    };

    const handleNextPage = () => {
        if (currentPage < numberOfPages - 1) setCurrentPage(currentPage + 1);
    };

    const handleItemsPerPage = (e) => {
        setItemsPerPage(parseInt(e.target.value));
    };

    const confirmDelete = async () => {
        if (!postToDelete) return;
        setIsDeleting(true);

        try {
            await deleteNews(postToDelete._id);
            setIsDeleteModalOpen(false);
            setPostToDelete(null);
            fetchNews();
        } catch (err) {
            alert(err || "Error deleting post");
        } finally {
            setIsDeleting(false);
        }
    };


       if (!isOnline) {
    return <OfflineWarning />;
  }


    return (
        <div className="p-4 md:p-6 bg-base-100 dark:bg-casual-black min-h-screen font-primary text-casual-black dark:text-concrete transition-colors">

            <SectionTitle
                title="Manage Blog"
                subtitle="Manage news, events, and announcements."
                rightElement={
                    <button
                        onClick={handleAddClick}
                        className="btn bg-sporty-blue hover:bg-sporty-blue/90 text-concrete border-none w-full md:w-auto font-secondary flex items-center gap-2"
                    >
                        <HiPlus className="text-xl" />
                        Add Blog Post
                    </button>
                }
            />

            {/* Filtering Toolbar */}
            <div className="bg-concrete dark:bg-white/5 p-4 rounded-box shadow-sm mb-6 flex flex-col md:flex-row items-center justify-between gap-4 border border-casual-black/5 dark:border-white/10 transition-colors">

                <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto flex-1">
                    {/* Search */}
                    <div className="form-control w-full md:w-auto md:flex-1 max-w-sm relative">
                        <HiMagnifyingGlass className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-casual-black/50 dark:text-concrete/50" />
                        <input
                            type="text"
                            placeholder="Search title or tags..."
                            className="input input-bordered w-full pl-10 bg-base-100 dark:bg-casual-black text-casual-black dark:text-concrete border-casual-black/20 dark:border-concrete/20 focus:border-sporty-blue focus:outline-none transition-colors"
                            value={searchTerm}
                            onChange={handleSearchChange}
                        />
                    </div>

                    {/* Category Dropdown */}
                    <div className="form-control w-full md:w-48">
                        <select
                            className="select select-bordered w-full bg-base-100 dark:bg-casual-black text-casual-black dark:text-concrete border-casual-black/20 dark:border-concrete/20 focus:border-sporty-blue focus:outline-none transition-colors capitalize"
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                        >
                            <option value="">All Categories</option>
                            {CATEGORIES.map((cat) => (
                                <option key={cat} value={cat.toLowerCase()}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    {/* Clear Filters */}
                    {(searchTerm || categoryFilter) && (
                        <button
                            onClick={() => { setSearchTerm(''); setCategoryFilter(''); }}
                            className="btn btn-ghost text-fascinating-magenta hover:bg-fascinating-magenta/10 w-full md:w-auto font-secondary"
                        >
                            Clear
                        </button>
                    )}
                </div>

                {/* Items Per Page */}
                <div className="form-control w-full md:w-auto shrink-0 flex-row items-center gap-2">
                    <span className="text-sm text-casual-black/70 dark:text-concrete/70 font-medium">Show:</span>
                    <select
                        value={itemsPerPage}
                        onChange={handleItemsPerPage}
                        className="select select-bordered select-sm bg-base-100 dark:bg-casual-black text-casual-black dark:text-concrete border-casual-black/20 dark:border-concrete/20 focus:outline-none transition-colors"
                    >
                        <option value="5">5</option>
                        <option value="10">10</option>
                        <option value="12">12</option>
                        <option value="50">50</option>
                    </select>
                </div>
            </div>

            {/* Loading State */}
            {newsLoading && (
                <div className="flex justify-center items-center py-20">
                    <span className="loading loading-spinner loading-lg text-sporty-blue"></span>
                </div>
            )}

            {/* Error State */}
            {newsError && !newsLoading && (
                <div className="alert alert-error bg-fascinating-magenta/10 text-fascinating-magenta border border-fascinating-magenta/20 shadow-sm mb-6">
                    <div className="flex items-center gap-2">
                        <HiTrash className="h-6 w-6" />
                        <div>
                            <h3 className="font-bold font-secondary">Error retrieving data</h3>
                            <div className="text-xs">{newsError}</div>
                        </div>
                    </div>
                </div>
            )}

            {/* Empty State */}
            {!newsLoading && !newsError && filteredNews.length === 0 && (
                <div className="bg-concrete dark:bg-white/5 p-12 rounded-box text-center shadow-sm border border-casual-black/5 dark:border-white/10 transition-colors">
                    <p className="text-casual-black/70 dark:text-concrete/70 text-lg font-medium font-secondary">No blog posts found.</p>
                    {(searchTerm || categoryFilter) && (
                        <p className="text-sm text-casual-black/50 dark:text-concrete/50 mt-2">Try adjusting your search or filters.</p>
                    )}
                </div>
            )}

            {/* Data Table */}
            {!newsLoading && !newsError && filteredNews.length > 0 && (
                <div className="bg-concrete dark:bg-[#1a1a1a] rounded-box shadow-sm overflow-hidden border border-casual-black/5 dark:border-white/10 transition-colors">
                    <div className="overflow-x-auto">
                        <table className="table table-zebra w-full text-casual-black dark:text-concrete">
                            <thead className="bg-casual-black/5 dark:bg-white/5 text-casual-black dark:text-concrete font-secondary transition-colors">
                                <tr>
                                    <th className="w-16 text-center">No.</th>
                                    <th>Title</th>
                                    <th>Date</th>
                                    <th>Category</th>
                                    <th className="text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedNews.map((post, index) => (
                                    <tr key={post._id} className="hover:bg-casual-black/5 dark:hover:bg-white/5 transition-colors border-b-casual-black/5 dark:border-b-white/5 border-b">
                                        <td className="text-center">{currentPage * itemsPerPage + index + 1}</td>
                                        <td>
                                            <div className="flex items-center gap-3">
                                                {post.image && (
                                                    <div className="avatar">
                                                        <div className="w-10 h-10 rounded-lg">
                                                            <img src={post.image} alt={post.title} />
                                                        </div>
                                                    </div>
                                                )}
                                                <div>
                                                    <div className="font-medium line-clamp-1">{post.title}</div>
                                                    {post.tags && post.tags.length > 0 && (
                                                        <div className="text-xs opacity-60 line-clamp-1 mt-0.5">
                                                            Tags: {Array.isArray(post.tags) ? post.tags.join(', ') : post.tags}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span className="text-sm">
                                                {dayjs(post.date).format('MMMM D, YYYY')}
                                            </span>
                                        </td>
                                        <td className="capitalize">
                                            <div className="badge badge-outline border-casual-black/20 dark:border-white/20 text-xs">
                                                {post.category}
                                            </div>
                                        </td>
                                        <td className="text-center">
                                            <div className="join">
                                                <button
                                                    onClick={() => handleEditClick(post)}
                                                    className="btn btn-sm btn-ghost join-item text-sporty-blue hover:bg-sporty-blue/10 hover:text-sporty-blue"
                                                    title="Edit"
                                                >
                                                    <HiPencilSquare className="h-5 w-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteClick(post)}
                                                    className="btn btn-sm btn-ghost join-item text-fascinating-magenta hover:bg-fascinating-magenta/10 hover:text-fascinating-magenta"
                                                    title="Delete"
                                                >
                                                    <HiTrash className="h-5 w-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Controls */}
                    {numberOfPages > 1 && (
                        <div className="flex items-center justify-between p-4 border-t border-casual-black/5 dark:border-white/10 bg-casual-black/5 dark:bg-white/5">
                            <span className="text-sm text-casual-black/60 dark:text-concrete/60">
                                Showing {currentPage * itemsPerPage + 1} to {Math.min((currentPage + 1) * itemsPerPage, filteredNews.length)} of {filteredNews.length} entries
                            </span>
                            <div className="join">
                                <button
                                    onClick={handlePrevPage}
                                    disabled={currentPage === 0}
                                    className="join-item btn btn-sm bg-base-100 dark:bg-casual-black text-casual-black dark:text-concrete border-casual-black/10 dark:border-white/10 hover:bg-casual-black/10 dark:hover:bg-white/10 disabled:opacity-50"
                                >
                                    <MdNavigateBefore className="text-lg" />
                                </button>

                                {[...Array(numberOfPages)].map((_, ind) => (
                                    <button
                                        key={ind}
                                        onClick={() => setCurrentPage(ind)}
                                        className={`join-item btn btn-sm border-casual-black/10 dark:border-white/10 hover:bg-casual-black/10 dark:hover:bg-white/10 transition-colors ${currentPage === ind
                                            ? 'bg-sporty-blue text-white hover:bg-sporty-blue/90 border-sporty-blue dark:border-sporty-blue'
                                            : 'bg-base-100 dark:bg-casual-black text-casual-black dark:text-concrete'
                                            }`}
                                    >
                                        {ind + 1}
                                    </button>
                                ))}

                                <button
                                    onClick={handleNextPage}
                                    disabled={currentPage === numberOfPages - 1}
                                    className="join-item btn btn-sm bg-base-100 dark:bg-casual-black text-casual-black dark:text-concrete border-casual-black/10 dark:border-white/10 hover:bg-casual-black/10 dark:hover:bg-white/10 disabled:opacity-50"
                                >
                                    <MdNavigateNext className="text-lg" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Form Modal */}
            {isFormModalOpen && (
                <NewsFormModal
                    isOpen={isFormModalOpen}
                    onClose={() => setIsFormModalOpen(false)}
                    post={selectedPost}
                    currentBranch={branch}
                    onSuccess={fetchNews}
                />
            )}

            {/* Delete Confirmation Modal */}
            {isDeleteModalOpen && (
                <ConfirmDeleteModal
                    isOpen={isDeleteModalOpen}
                    onClose={() => setIsDeleteModalOpen(false)}
                    onConfirm={confirmDelete}
                    itemName={postToDelete?.title || 'this blog post'}
                    isDeleting={isDeleting}
                />
            )}
        </div>
    );
};

export default Blog;