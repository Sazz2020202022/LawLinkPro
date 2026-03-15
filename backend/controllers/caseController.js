import Case from '../models/Case.js';

const SUMMARY_STOPWORDS = new Set([
  'a',
  'an',
  'and',
  'are',
  'as',
  'at',
  'be',
  'by',
  'for',
  'from',
  'has',
  'have',
  'in',
  'is',
  'it',
  'of',
  'on',
  'or',
  'that',
  'the',
  'to',
  'was',
  'were',
  'with',
]);

const getTopTerms = (text, count = 4) => {
  const terms = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((token) => token.length > 2 && !SUMMARY_STOPWORDS.has(token));

  const frequencies = terms.reduce((acc, token) => {
    acc[token] = (acc[token] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(frequencies)
    .sort((a, b) => b[1] - a[1])
    .slice(0, count)
    .map(([token]) => token);
};

const generateAiSummary = ({
  title,
  category,
  description,
  urgency,
  location,
  budgetRange,
  incidentDate,
}) => {
  const cleanTitle = String(title || '').trim();
  const cleanCategory = String(category || '').trim();
  const cleanDescription = String(description || '').trim();
  const cleanUrgency = String(urgency || '').trim();
  const cleanLocation = String(location || '').trim();
  const cleanBudgetRange = String(budgetRange || '').trim();
  const cleanIncidentDate = incidentDate ? new Date(incidentDate).toLocaleDateString() : '';

  const firstSentence = cleanDescription.split(/(?<=[.!?])\s+/).find(Boolean) || cleanDescription;
  const topTerms = getTopTerms(`${cleanTitle} ${cleanDescription}`, 4);

  const termsText = topTerms.length > 0 ? ` Key focus areas include ${topTerms.join(', ')}.` : '';
  const urgencyText = cleanUrgency ? ` Priority level is ${cleanUrgency}.` : '';
  const locationText = cleanLocation ? ` Location: ${cleanLocation}.` : '';
  const budgetText = cleanBudgetRange ? ` Budget expectation: ${cleanBudgetRange}.` : '';
  const incidentText = cleanIncidentDate ? ` Incident date: ${cleanIncidentDate}.` : '';

  return `This case is categorized under ${cleanCategory} and concerns "${cleanTitle}". ${firstSentence}${urgencyText}${locationText}${budgetText}${incidentText}${termsText}`.trim();
};

export const createCase = async (req, res) => {
  try {
    const {
      title,
      category,
      description,
      urgency,
      incidentDate,
      location,
      budgetRange,
      opposingParty,
      preferredContactTime,
      additionalNotes,
    } = req.body;

    if (!title || !category || !description) {
      return res.status(400).json({ message: 'Title, category, and description are required' });
    }

    const documents = [];

    if (req.file) {
      const normalizedPath = req.file.filename.replace(/\\/g, '/');
      documents.push({
        fileName: req.file.originalname,
        fileUrl: `/uploads/${normalizedPath}`,
        uploadedAt: new Date(),
      });
    }

    const newCase = await Case.create({
      client: req.user.id,
      title: title.trim(),
      category: category.trim(),
      description: description.trim(),
      urgency: urgency?.trim() || 'medium',
      incidentDate: incidentDate || undefined,
      location: location?.trim() || '',
      budgetRange: budgetRange?.trim() || '',
      opposingParty: opposingParty?.trim() || '',
      preferredContactTime: preferredContactTime?.trim() || '',
      additionalNotes: additionalNotes?.trim() || '',
      aiSummary: generateAiSummary({
        title,
        category,
        description,
        urgency,
        location,
        budgetRange,
        incidentDate,
      }),
      documents,
    });

    return res.status(201).json({ case: newCase });
  } catch (error) {
    console.error('Create case error:', error);
    return res.status(500).json({ message: 'Unable to create case right now' });
  }
};

export const getMyCases = async (req, res) => {
  try {
    const cases = await Case.find({ client: req.user.id }).sort({ createdAt: -1 });

    return res.status(200).json({ cases });
  } catch (error) {
    console.error('Get my cases error:', error);
    return res.status(500).json({ message: 'Unable to fetch cases right now' });
  }
};

export const getCaseById = async (req, res) => {
  try {
    const { id } = req.params;

    const caseDoc = await Case.findOne({ _id: id, client: req.user.id });

    if (!caseDoc) {
      return res.status(404).json({ message: 'Case not found' });
    }

    return res.status(200).json({ case: caseDoc });
  } catch (error) {
    if (error?.name === 'CastError') {
      return res.status(404).json({ message: 'Case not found' });
    }

    console.error('Get case by id error:', error);
    return res.status(500).json({ message: 'Unable to fetch case right now' });
  }
};

export const uploadCaseDocument = async (req, res) => {
  try {
    const { id } = req.params;

    const caseDoc = await Case.findOne({ _id: id, client: req.user.id });

    if (!caseDoc) {
      return res.status(404).json({ message: 'Case not found' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a valid document file' });
    }

    const normalizedPath = req.file.filename.replace(/\\/g, '/');
    const fileUrl = `/uploads/${normalizedPath}`;

    caseDoc.documents.push({
      fileName: req.file.originalname,
      fileUrl,
      uploadedAt: new Date(),
    });

    await caseDoc.save();

    return res.status(201).json({
      message: 'Document uploaded successfully',
      document: caseDoc.documents[caseDoc.documents.length - 1],
      case: caseDoc,
    });
  } catch (error) {
    if (error?.name === 'CastError') {
      return res.status(404).json({ message: 'Case not found' });
    }

    console.error('Upload case document error:', error);
    return res.status(500).json({ message: 'Unable to upload document right now' });
  }
};
