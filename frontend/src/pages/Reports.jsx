import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FileText, 
  Download, 
  Plus, 
  Loader2,
  Calendar,
  CheckCircle,
  FileSpreadsheet
} from 'lucide-react';
import { API_BASE } from '../App';

function Reports({ data }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generateLoading, setGenerateLoading] = useState(false);
  const [generateSuccess, setGenerateSuccess] = useState(false);

  const fetchReports = () => {
    axios.get(`${API_BASE}/reports`)
      .then(res => {
        setReports(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch reports:", err);
      });
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleGenerateReport = () => {
    setGenerateLoading(true);
    axios.post(`${API_BASE}/reports/generate`)
      .then(res => {
        setGenerateLoading(false);
        setGenerateSuccess(true);
        fetchReports(); // Refresh lists
        setTimeout(() => setGenerateSuccess(false), 3000);
      })
      .catch(err => {
        console.error("Failed to generate PDF health report:", err);
        setGenerateLoading(false);
      });
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      
      {/* Header and Generate Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pl-1 text-left">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white tracking-tight">
            Factory Health Reports
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Compile and export digital twin sensor logs and Random Forest model outputs to PDF
          </p>
        </div>

        <button
          onClick={handleGenerateReport}
          disabled={generateLoading || generateSuccess}
          className={`px-4.5 py-2.5 rounded-xl font-bold text-xs select-none shadow-sm flex items-center justify-center gap-1.5 border transition-all ${
            generateSuccess 
              ? 'bg-green-100 border-green-200 dark:bg-green-950/30 text-green-500 dark:border-green-900/30' 
              : 'bg-primary text-white border-primary hover:bg-primary-dark hover:shadow'
          }`}
        >
          {generateLoading ? (
            <Loader2 size={14} className="animate-spin" />
          ) : generateSuccess ? (
            <CheckCircle size={14} />
          ) : (
            <Plus size={14} />
          )}
          {generateLoading ? 'Generating PDF...' : generateSuccess ? 'Report Generated!' : 'Generate Factory PDF'}
        </button>
      </div>

      {/* Reports Listing Table/Cards */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-darkborder rounded-3xl overflow-hidden shadow-sm">
        
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 space-y-3">
            <div className="h-8 w-8 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Retrieving archive...</p>
          </div>
        ) : reports.length > 0 ? (
          <div className="divide-y divide-slate-100 dark:divide-darkborder">
            
            {/* Table Header (large screens) */}
            <div className="hidden sm:grid grid-cols-12 gap-4 px-6 py-4 bg-slate-50/50 dark:bg-slate-900/50 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 text-left select-none">
              <div className="col-span-6">Report Title</div>
              <div className="col-span-2">Format</div>
              <div className="col-span-3 flex items-center gap-1">
                <Calendar size={12} />
                Created At
              </div>
              <div className="col-span-1 text-right">Download</div>
            </div>

            {/* List entries */}
            {reports.map((report) => (
              <div 
                key={report.id}
                className="grid grid-cols-1 sm:grid-cols-12 gap-3 sm:gap-4 px-6 py-4.5 hover:bg-slate-50/30 dark:hover:bg-slate-800/20 transition-colors items-center text-left"
              >
                {/* Title */}
                <div className="col-span-1 sm:col-span-6 flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-red-50 dark:bg-red-950/20 text-red-500 shrink-0">
                    <FileText size={18} />
                  </div>
                  <div>
                    <h5 className="font-bold text-sm text-slate-800 dark:text-slate-100 leading-tight">
                      {report.title}
                    </h5>
                    <span className="text-[10px] text-slate-400 font-medium">
                      Smart manufacturing twin snapshot
                    </span>
                  </div>
                </div>

                {/* Format */}
                <div className="col-span-1 sm:col-span-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[10px] font-bold tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 uppercase">
                    PDF Document
                  </span>
                </div>

                {/* Timestamp */}
                <div className="col-span-1 sm:col-span-3 text-xs text-slate-500 dark:text-slate-400 font-medium font-mono">
                  {report.created_at}
                </div>

                {/* Download Button */}
                <div className="col-span-1 sm:col-span-1 text-left sm:text-right">
                  <a
                    href={`${API_BASE}/reports/download/${report.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex h-9.5 w-9.5 items-center justify-center rounded-xl border border-slate-200 dark:border-darkborder hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-white transition-colors"
                    title="Open PDF report"
                  >
                    <Download size={15} />
                  </a>
                </div>

              </div>
            ))}

          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="p-4 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-2xl mb-4">
              <FileText size={32} />
            </div>
            <h4 className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-1">No Reports Available</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 text-center max-w-sm">
              Click the 'Generate Factory PDF' button to compile current digital twin spindle conditions and export.
            </p>
          </div>
        )}

      </div>

      {/* Educational project detail card */}
      <div className="bg-blue-50/30 dark:bg-slate-900/40 border border-blue-150/40 dark:border-darkborder rounded-3xl p-5 text-left space-y-2">
        <h5 className="font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
          <span>💡</span>
          Project Report Notes
        </h5>
        <p className="text-[12px] text-slate-600 dark:text-slate-400 leading-relaxed">
          The PDF generation compiles the live SQLite database state, evaluates rule-based alert diagnostics, and incorporates predictions. The output matches report templates, making it suitable for B.Tech project review and final demonstrations.
        </p>
      </div>

    </div>
  );
}

export default Reports;
