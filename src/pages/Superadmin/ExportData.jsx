import { useState } from 'react';
import dayjs from 'dayjs';
import SectionTitle from "../../components/common/SectionTitle";

const DatabaseExportButton = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [format, setFormat] = useState('json');

  const handleExport = async () => {
    try {
      setIsExporting(true);
      
      const response = await fetch(`http://localhost:5000/api/export?format=${format}`, {
        method: 'GET',
        headers: {
          // 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` 
        }
      });

      if (!response.ok) {
        throw new Error('Failed to export database');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      let extension = format;
      if (format === 'csv') extension = 'zip'; 
      
      const dateString = dayjs().format('YYYY-MM-DD');
      link.download = `db_backup_${dateString}.${extension}`;
      
      document.body.appendChild(link);
      link.click();
      
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error("Export Error:", error);
      alert("An error occurred while exporting the database.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="p-4 md:p-6 bg-base-100 dark:bg-casual-black min-h-screen font-primary text-casual-black dark:text-concrete transition-colors">
      
      {/* ✨ Implemented SectionTitle here */}
      <SectionTitle 
        title="Database Backup" 
        subtitle="Download a complete snapshot of the system data. Select your preferred format below."
      />

      {/* The Export Card */}
      <div className="bg-[#f2f2f2] dark:bg-gray-800 p-8 rounded-xl shadow-sm border border-[#e0e0e0] dark:border-gray-700 max-w-[450px] font-sans transition-colors duration-200 mt-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-[#181818] dark:text-gray-200">
              Export Format
            </label>
            <select 
              value={format} 
              onChange={(e) => setFormat(e.target.value)}
              disabled={isExporting}
              className="p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-[#181818] dark:text-white text-base outline-none focus:ring-2 focus:ring-[#147bff] disabled:opacity-50 transition-colors cursor-pointer disabled:cursor-not-allowed"
            >
              <option value="json">Standard JSON (.json)</option>
              <option value="ndjson">Streaming JSON (.ndjson) - Best for large backups</option>
              <option value="xlsx">Excel Workbook (.xlsx) - Best for viewing</option>
              <option value="csv">CSV Archive (.zip) - Best for data analysis</option>
            </select>
          </div>

          <button 
            onClick={handleExport} 
            disabled={isExporting}
            className={`p-3.5 rounded-lg text-white text-base font-semibold flex justify-center items-center gap-2 transition-colors ${
              isExporting 
                ? 'bg-blue-300 dark:bg-blue-800 cursor-wait' 
                : 'bg-[#147bff] hover:bg-blue-600 cursor-pointer'
            }`}
          >
            {isExporting ? (
              <>
                {/* Tailwind replacement for your custom CSS spinner */}
                <span className="w-4 h-4 border-2 border-white border-b-transparent rounded-full animate-spin inline-block"></span>
                Exporting...
              </>
            ) : 'Download Backup'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DatabaseExportButton;