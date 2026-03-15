import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FileText, Upload, Sparkles } from 'lucide-react';
import { getCaseById, uploadCaseDocument } from '../../services/api';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/+$/, '');
const API_ORIGIN = /\/api$/i.test(API_BASE_URL) ? API_BASE_URL.replace(/\/api$/i, '') : API_BASE_URL;

const TIMELINE_STAGES = [
  { key: 'submitted', label: 'Submitted' },
  { key: 'matched', label: 'Matched' },
  { key: 'request_sent', label: 'Request Sent' },
  { key: 'accepted', label: 'Accepted' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'completed', label: 'Completed' },
];

const statusLabelMap = {
  submitted: 'Submitted',
  matched: 'Matched',
  request_sent: 'Request Sent',
  accepted: 'Accepted',
  in_progress: 'In Progress',
  completed: 'Completed',
};

const statusStyleMap = {
  submitted: 'bg-blue-50 text-blue-700',
  matched: 'bg-purple-50 text-purple-700',
  request_sent: 'bg-indigo-50 text-indigo-700',
  accepted: 'bg-emerald-50 text-emerald-700',
  in_progress: 'bg-amber-50 text-amber-700',
  completed: 'bg-green-50 text-green-700',
};

const urgencyLabelMap = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  urgent: 'Urgent',
};

const isAllowedFile = (file) => {
  if (!file) {
    return false;
  }

  const allowedTypes = new Set([
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png',
  ]);

  return allowedTypes.has(file.type);
};

const getDocumentUrl = (fileUrl) => {
  if (!fileUrl) {
    return '#';
  }
  if (/^https?:\/\//i.test(fileUrl)) {
    return fileUrl;
  }
  return `${API_ORIGIN}${fileUrl}`;
};

function CaseDetail() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [caseData, setCaseData] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const loadCase = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await getCaseById(id);
        setCaseData(response.case || null);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load case details');
      } finally {
        setLoading(false);
      }
    };

    loadCase();
  }, [id]);

  const currentStageIndex = useMemo(() => {
    const status = caseData?.status || 'submitted';
    const index = TIMELINE_STAGES.findIndex((stage) => stage.key === status);
    return index >= 0 ? index : 0;
  }, [caseData?.status]);

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    setUploadMessage({ type: '', text: '' });

    if (!file) {
      setSelectedFile(null);
      return;
    }

    if (!isAllowedFile(file)) {
      setSelectedFile(null);
      setUploadMessage({
        type: 'error',
        text: 'Only pdf, doc, docx, jpg, and png files are allowed.',
      });
      return;
    }

    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile || !caseData?._id) {
      return;
    }

    try {
      setUploading(true);
      setUploadMessage({ type: '', text: '' });
      const response = await uploadCaseDocument(caseData._id, selectedFile);
      setCaseData(response.case);
      setSelectedFile(null);
      setUploadMessage({ type: 'success', text: 'Document uploaded successfully.' });
    } catch (err) {
      setUploadMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to upload document.',
      });
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-10 text-center text-gray-600">
        Loading case details...
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <p className="text-red-600">{error}</p>
        <Link to="/client/cases" className="mt-4 inline-block text-blue-600 hover:text-blue-700">
          Back to My Cases
        </Link>
      </div>
    );
  }

  if (!caseData) {
    return null;
  }

  return (
    <div className="space-y-6">
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{caseData.title}</h1>
            <p className="text-sm text-gray-600 mt-2">Category: {caseData.category}</p>
          </div>
          <span
            className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
              statusStyleMap[caseData.status] || 'bg-gray-100 text-gray-700'
            }`}
          >
            {statusLabelMap[caseData.status] || 'Submitted'}
          </span>
        </div>

        <p className="mt-4 text-sm text-gray-700 leading-relaxed">{caseData.description}</p>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-700">
          <div className="rounded-lg border border-gray-200 px-3 py-2 bg-gray-50">
            <span className="font-semibold text-gray-800">Urgency: </span>
            {urgencyLabelMap[caseData.urgency] || 'Medium'}
          </div>
          <div className="rounded-lg border border-gray-200 px-3 py-2 bg-gray-50">
            <span className="font-semibold text-gray-800">Location: </span>
            {caseData.location || 'Not provided'}
          </div>
          <div className="rounded-lg border border-gray-200 px-3 py-2 bg-gray-50">
            <span className="font-semibold text-gray-800">Incident Date: </span>
            {caseData.incidentDate ? new Date(caseData.incidentDate).toLocaleDateString() : 'Not provided'}
          </div>
          <div className="rounded-lg border border-gray-200 px-3 py-2 bg-gray-50">
            <span className="font-semibold text-gray-800">Budget Range: </span>
            {caseData.budgetRange || 'Not provided'}
          </div>
          <div className="rounded-lg border border-gray-200 px-3 py-2 bg-gray-50 sm:col-span-2">
            <span className="font-semibold text-gray-800">Opposing Party: </span>
            {caseData.opposingParty || 'Not provided'}
          </div>
          <div className="rounded-lg border border-gray-200 px-3 py-2 bg-gray-50 sm:col-span-2">
            <span className="font-semibold text-gray-800">Preferred Contact Time: </span>
            {caseData.preferredContactTime || 'Not provided'}
          </div>
          {caseData.additionalNotes && (
            <div className="rounded-lg border border-gray-200 px-3 py-2 bg-gray-50 sm:col-span-2">
              <span className="font-semibold text-gray-800">Additional Notes: </span>
              {caseData.additionalNotes}
            </div>
          )}
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            to={`/client/cases/${caseData._id}/recommendations`}
            className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            View Recommendations
          </Link>
          <Link
            to="/client/cases"
            className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200"
          >
            Back to My Cases
          </Link>
        </div>
      </section>

      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900">Case Timeline</h2>
        <p className="text-sm text-gray-600 mt-1">Track where your case currently stands.</p>

        <div className="mt-5 overflow-x-auto">
          <div className="min-w-170 grid grid-cols-6 gap-2">
            {TIMELINE_STAGES.map((stage, index) => {
              const isComplete = index <= currentStageIndex;
              const isCurrent = index === currentStageIndex;

              return (
                <div key={stage.key} className="flex flex-col items-center text-center">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold border transition-all ${
                      isCurrent
                        ? 'bg-linear-to-r from-blue-600 to-purple-600 text-white border-transparent'
                        : isComplete
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-gray-50 text-gray-400 border-gray-200'
                    }`}
                  >
                    {index + 1}
                  </div>
                  <p className={`mt-2 text-xs ${isCurrent ? 'text-gray-900 font-semibold' : 'text-gray-600'}`}>
                    {stage.label}
                  </p>
                  {index < TIMELINE_STAGES.length - 1 && (
                    <div className={`mt-2 h-1 w-full rounded-full ${isComplete ? 'bg-blue-200' : 'bg-gray-100'}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900">AI Case Summary</h2>
        </div>
        <p className="text-sm text-gray-700 leading-relaxed">
          {caseData.aiSummary || 'Summary will be generated once enough case details are available.'}
        </p>
      </section>

      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900">Documents</h2>
        <p className="text-sm text-gray-600 mt-1">Upload supporting files for your case.</p>

        <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-3">
          <input
            type="file"
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-700 file:mr-3 file:rounded-lg file:border-0 file:bg-gray-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-gray-700 hover:file:bg-gray-200"
          />
          <button
            type="button"
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Upload className="w-4 h-4" />
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
        </div>

        {uploadMessage.text && (
          <p
            className={`mt-3 text-sm ${
              uploadMessage.type === 'success' ? 'text-green-700' : 'text-red-600'
            }`}
          >
            {uploadMessage.text}
          </p>
        )}

        <div className="mt-5 space-y-2">
          {(caseData.documents || []).length === 0 ? (
            <p className="text-sm text-gray-500">No documents uploaded yet.</p>
          ) : (
            caseData.documents.map((doc, index) => (
              <a
                key={`${doc.fileUrl}-${index}`}
                href={getDocumentUrl(doc.fileUrl)}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2 hover:bg-gray-50"
              >
                <span className="inline-flex items-center gap-2 text-sm text-gray-700">
                  <FileText className="w-4 h-4 text-blue-600" />
                  {doc.fileName}
                </span>
                <span className="text-xs text-gray-500">
                  {doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString() : ''}
                </span>
              </a>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

export default CaseDetail;
