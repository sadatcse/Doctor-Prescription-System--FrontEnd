import { useState, useRef } from 'react';
import SectionTitle from "../../components/common/SectionTitle";

const DatabaseImportButton = () => {
  const [isImporting, setIsImporting] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleImport = async () => {
    if (!selectedFile) return alert("Please select a file first.");

    const confirm = window.confirm("WARNING: This will overwrite your current database with the backup data. Are you sure you want to proceed?");
    if (!confirm) return;

    try {
      setIsImporting(true);
      
      const formData = new FormData();
      formData.append('backupFile', selectedFile); 

      const response = await fetch('http://localhost:5000/api/import', {
        method: 'POST',
        headers: {
          // 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` 
        },
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to restore database');
      }

      alert("Database successfully restored!");
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = ""; 
      
    } catch (error) {
      console.error("Import Error:", error);
      alert(error.message || "An error occurred during restoration.");
    } finally {
      setIsImporting(false);
    }
  };

  return (
    // ✨ Wrapped in a page container identical to MedicineList
    <div className="p-4 md:p-6 bg-base-100 dark:bg-casual-black min-h-screen font-primary text-casual-black dark:text-concrete transition-colors">
      
      {/* ✨ Implemented SectionTitle here */}
      <SectionTitle 
        title="Restore Database" 
        subtitle="Upload a previous backup to restore the system. Warning: This will overwrite current data. Only .json and .ndjson formats are supported."
      />

      {/* The Import Card */}
      <div className="bg-[#f2f2f2] dark:bg-gray-800 p-8 rounded-xl shadow-sm border border-[#e0e0e0] dark:border-gray-700 max-w-[450px] font-sans transition-colors duration-200 mt-6">
        
        <div className="flex flex-col gap-4">
          {/* Styled identically to the Select dropdown in the Export component */}
          <input 
            type="file" 
            accept=".json,.ndjson"
            onChange={handleFileChange}
            ref={fileInputRef}
            disabled={isImporting}
            className="p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-[#181818] dark:text-white text-base outline-none focus:ring-2 focus:ring-[#147bff] disabled:opacity-50 transition-colors cursor-pointer disabled:cursor-not-allowed file:mr-4 file:py-1.5 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[#147bff]/10 file:text-[#147bff] dark:file:bg-gray-600 dark:file:text-gray-200 hover:file:bg-[#147bff]/20 dark:hover:file:bg-gray-500 file:transition-colors file:cursor-pointer"
          />

          {/* Button colored exactly like the Export button */}
          <button 
            onClick={handleImport} 
            disabled={isImporting || !selectedFile}
            className={`p-3.5 rounded-lg text-white text-base font-semibold flex justify-center items-center gap-2 transition-colors ${
              isImporting || !selectedFile 
                ? 'bg-blue-300 dark:bg-blue-800 cursor-not-allowed' 
                : 'bg-[#147bff] hover:bg-blue-600 cursor-pointer'
            }`}
          >
            {isImporting ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-b-transparent rounded-full animate-spin inline-block"></span>
                Restoring Data...
              </>
            ) : 'Upload & Restore'}
          </button>
        </div>
      </div>
      
    </div>
  );
};

export default DatabaseImportButton;