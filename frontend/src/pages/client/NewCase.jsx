import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createCase } from '../../services/api';

const CATEGORIES = [
  {
    value: 'Family Law',
    label: 'Family Law',
    details: 'Divorce, child custody, alimony, domestic violence, and family disputes.',
    examples: ['Divorce', 'Child Custody', 'Domestic Violence'],
  },
  {
    value: 'Criminal Law',
    label: 'Criminal Law',
    details: 'Arrest, FIR matters, bail applications, criminal defense, and court trial support.',
    examples: ['Bail', 'Police Complaint', 'Criminal Defense'],
  },
  {
    value: 'Property Law',
    label: 'Property Law',
    details: 'Land ownership, transfer, tenancy, partition, registry, and title disputes.',
    examples: ['Land Dispute', 'Tenancy', 'Property Transfer'],
  },
  {
    value: 'Corporate Law',
    label: 'Corporate and Business Law',
    details: 'Business registration, contracts, compliance, shareholder issues, and company disputes.',
    examples: ['Partnership Dispute', 'Business Contract', 'Compliance'],
  },
  {
    value: 'Cyber Law',
    label: 'Cyber Law',
    details: 'Online fraud, cybercrime complaints, digital privacy violations, and data misuse cases.',
    examples: ['Online Scam', 'Data Breach', 'Social Media Abuse'],
  },
  {
    value: 'Immigration Law',
    label: 'Immigration Law',
    details: 'Visa, work permit, residency, citizenship, deportation, and immigration appeals.',
    examples: ['Visa Rejection', 'Work Permit', 'Residency'],
  },
  {
    value: 'Labour Law',
    label: 'Labour and Employment Law',
    details: 'Employment contracts, salary disputes, termination issues, harassment, and worker rights.',
    examples: ['Wrongful Termination', 'Unpaid Salary', 'Workplace Harassment'],
  },
  {
    value: 'Tax Law',
    label: 'Tax Law',
    details: 'Tax notice response, filing disputes, audits, penalties, and tax appeal support.',
    examples: ['Tax Notice', 'Audit', 'Penalty Appeal'],
  },
  {
    value: 'Civil Litigation',
    label: 'Civil Litigation',
    details: 'General civil disputes including money recovery, damages, injunctions, and breach of duty.',
    examples: ['Money Recovery', 'Civil Suit', 'Injunction'],
  },
  {
    value: 'Consumer Protection',
    label: 'Consumer Protection',
    details: 'Defective products, unfair trade practices, service deficiency, and compensation claims.',
    examples: ['Faulty Product', 'Service Complaint', 'Refund Claim'],
  },
  {
    value: 'Intellectual Property',
    label: 'Intellectual Property',
    details: 'Trademark, copyright, and patent issues including infringement and registration disputes.',
    examples: ['Trademark Issue', 'Copyright Claim', 'Patent Dispute'],
  },
  {
    value: 'Insurance Claims',
    label: 'Insurance Claims',
    details: 'Claim rejection, delayed settlement, policy interpretation, and insurance compensation disputes.',
    examples: ['Claim Rejection', 'Delayed Settlement', 'Policy Dispute'],
  },
];

const URGENCY_LEVELS = [
  { value: 'low', label: 'Low - No immediate deadline' },
  { value: 'medium', label: 'Medium - Need help soon' },
  { value: 'high', label: 'High - Time-sensitive matter' },
  { value: 'urgent', label: 'Urgent - Immediate legal support needed' },
];

const BUDGET_OPTIONS = [
  'Below $500',
  '$500 - $2,000',
  '$2,000 - $5,000',
  '$5,000+',
  'Not sure yet',
];

const CITY_OPTIONS = [
  'Kathmandu',
  'Lalitpur',
  'Bhaktapur',
  'Pokhara',
  'Biratnagar',
  'Butwal',
  'Dharan',
  'Chitwan',
];

function NewCase() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '',
    urgency: 'medium',
    incidentDate: '',
    location: '',
    budgetRange: '',
    opposingParty: '',
    preferredContactTime: '',
    additionalNotes: '',
  });

  const selectedCategory = CATEGORIES.find((item) => item.value === formData.category);

  const isAllowedFile = (file) => {
    const allowedTypes = new Set([
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png',
    ]);

    return allowedTypes.has(file.type);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.title.trim() || !formData.category || !formData.description.trim() || !formData.location.trim()) {
      setError('Please complete all required fields.');
      return;
    }

    try {
      setLoading(true);
      const response = await createCase(formData, selectedFile);
      const caseId = response.case._id;
      navigate(`/client/cases/${caseId}/recommendations`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create case. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-2xl font-bold text-gray-900">Create New Case</h2>
      <p className="text-gray-600 mt-2">Describe your legal matter and get matched with qualified lawyers.</p>

      {error && (
        <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Case Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Brief title for your case"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            required
          />
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
            Legal Category <span className="text-red-500">*</span>
          </label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            required
          >
            <option value="">Select a category</option>
            {CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
          <p className="mt-2 text-xs text-gray-500">
            {selectedCategory
              ? selectedCategory.details
              : 'Select the area of law so we can match you with the right lawyer faster.'}
          </p>
          {selectedCategory && (
            <div className="mt-2 flex flex-wrap gap-2">
              {selectedCategory.examples.map((example) => (
                <span
                  key={example}
                  className="inline-flex items-center rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700"
                >
                  {example}
                </span>
              ))}
            </div>
          )}
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Case Description <span className="text-red-500">*</span>
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe your legal matter in detail"
            rows={6}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label htmlFor="urgency" className="block text-sm font-medium text-gray-700 mb-1">
              Urgency Level <span className="text-red-500">*</span>
            </label>
            <select
              id="urgency"
              name="urgency"
              value={formData.urgency}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              required
            >
              {URGENCY_LEVELS.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="incidentDate" className="block text-sm font-medium text-gray-700 mb-1">
              Incident Date
            </label>
            <input
              type="date"
              id="incidentDate"
              name="incidentDate"
              value={formData.incidentDate}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
              City <span className="text-red-500">*</span>
            </label>
            <select
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              required
            >
              <option value="">Select a city</option>
              {CITY_OPTIONS.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="budgetRange" className="block text-sm font-medium text-gray-700 mb-1">
              Budget Range
            </label>
            <select
              id="budgetRange"
              name="budgetRange"
              value={formData.budgetRange}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              <option value="">Select budget range</option>
              {BUDGET_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label htmlFor="opposingParty" className="block text-sm font-medium text-gray-700 mb-1">
              Opposing Party (if known)
            </label>
            <input
              type="text"
              id="opposingParty"
              name="opposingParty"
              value={formData.opposingParty}
              onChange={handleChange}
              placeholder="Person, company, or organization"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label htmlFor="preferredContactTime" className="block text-sm font-medium text-gray-700 mb-1">
              Preferred Contact Time
            </label>
            <input
              type="text"
              id="preferredContactTime"
              name="preferredContactTime"
              value={formData.preferredContactTime}
              onChange={handleChange}
              placeholder="Weekdays after 6 PM, mornings, etc."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
        </div>

        <div>
          <label htmlFor="additionalNotes" className="block text-sm font-medium text-gray-700 mb-1">
            Additional Notes
          </label>
          <textarea
            id="additionalNotes"
            name="additionalNotes"
            value={formData.additionalNotes}
            onChange={handleChange}
            placeholder="Any deadlines, constraints, or special instructions for the lawyer"
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
          />
        </div>

        <div>
          <label htmlFor="document" className="block text-sm font-medium text-gray-700 mb-1">
            Upload File <span className="text-gray-400">(optional)</span>
          </label>
          <input
            type="file"
            id="document"
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            onChange={(e) => {
              const file = e.target.files?.[0];

              if (!file) {
                setSelectedFile(null);
                return;
              }

              if (!isAllowedFile(file)) {
                setError('Only pdf, doc, docx, jpg, and png files are allowed.');
                setSelectedFile(null);
                return;
              }

              setError('');
              setSelectedFile(file);
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-gray-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-gray-700"
          />
          {selectedFile && <p className="mt-2 text-xs text-gray-500">Selected: {selectedFile.name}</p>}
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 rounded-lg text-sm font-semibold text-white bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {loading ? 'Creating...' : 'Create Case & Find Lawyers'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/client/cases')}
            className="px-6 py-2.5 rounded-lg text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all duration-200"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default NewCase;
