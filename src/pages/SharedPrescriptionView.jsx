import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import PrescriptionPreview from '../components/Prescription/PrescriptionPreview';
import { generatePrescriptionPdf } from '../components/utils/generatePrescriptionPdf';

// Using the same base URL structure as the rest of the app usually does via axios configs
// We will call the public backend API explicitly.
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export default function SharedPrescriptionView() {
    const { id } = useParams();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isExporting, setIsExporting] = useState(false);

    useEffect(() => {
        const fetchPrescription = async () => {
            try {
                const response = await axios.get(`${API_URL}/public/prescription/${id}`);
                if (response.data.success) {
                    setData(response.data);
                } else {
                    setError('Prescription not found.');
                }
            } catch (err) {
                console.error("Fetch Error:", err);
                setError('Failed to load prescription. the link might be invalid or expired.');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchPrescription();
        }
    }, [id]);

    const handlePrint = () => {
        window.print();
    };

    const handleDownloadPdf = async () => {
        if (!data || !data.prescription) return;
        setIsExporting(true);
        // Delay to ensure the UI paints any state changes
        setTimeout(async () => {
            await generatePrescriptionPdf('prescription-preview', data.prescription.patient?.name);
            setIsExporting(false);
        }, 500);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-100">
                <span className="loading loading-spinner loading-lg text-cyan-600"></span>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
                <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">Unavailable</h2>
                    <p className="text-slate-500">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-200 py-8 flex flex-col items-center print:bg-white print:py-0">
            {/* Top Toolbar (Hidden on Print) */}
            <div className="w-[794px] max-w-full flex justify-between items-center mb-6 print:hidden px-4 sm:px-0">
                <div className="text-sm font-bold text-slate-500">
                    PUBLIC VIEW
                </div>
                <div className="flex gap-2">
                    <button 
                        onClick={handlePrint}
                        className="px-4 py-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg shadow-sm font-medium transition-all flex items-center gap-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
                        Print
                    </button>
                    <button 
                        onClick={handleDownloadPdf}
                        disabled={isExporting}
                        className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg shadow-sm font-medium transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                        {isExporting ? (
                            <span className="loading loading-spinner loading-sm"></span>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                        )}
                        Download PDF
                    </button>
                </div>
            </div>

            {/* Document Wrapper mimicking A4 */}
            <div className="w-[794px] max-w-full bg-white shadow-2xl relative print:shadow-none print:w-full print:border-none mx-auto overflow-hidden">
                <PrescriptionPreview
                    data={data.prescription}
                    language="EN" // Default to english for public view for now
                    doctor={data.doctorProfile}
                    chamber={data.chamber}
                    isExporting={isExporting}
                />
            </div>
            
            {/* Optional branding or subtle footer */}
            <div className="mt-8 text-center text-slate-400 text-xs print:hidden">
                Powered by Data IT RX
            </div>
        </div>
    );
}
