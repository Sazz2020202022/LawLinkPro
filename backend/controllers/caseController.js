import Case from '../models/Case.js';

export const createCase = async (req, res) => {
  try {
    const { title, category, description } = req.body;

    if (!title || !category || !description) {
      return res.status(400).json({ message: 'Title, category, and description are required' });
    }

    const newCase = await Case.create({
      client: req.user.id,
      title: title.trim(),
      category: category.trim(),
      description: description.trim(),
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
