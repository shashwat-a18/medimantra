const Prediction = require('../models/Prediction');
const axios = require('axios');

const ML_SERVER_URL = process.env.ML_SERVER_URL || 'http://localhost:8000';

// Generate health risk prediction
const createPrediction = async (req, res) => {
  try {
    const { predictionType, inputData, featureNames } = req.body;

    // Validate input
    if (!predictionType || !inputData) {
      return res.status(400).json({ 
        error: 'Prediction type and input data are required' 
      });
    }

    if (!['diabetes', 'heart', 'stroke'].includes(predictionType)) {
      return res.status(400).json({ 
        error: 'Invalid prediction type. Must be diabetes, heart, or stroke' 
      });
    }

    // Call ML server
    const mlResponse = await axios.post(`${ML_SERVER_URL}/predict`, {
      model_type: predictionType,
      input_data: inputData,
      feature_names: featureNames
    });

    const { prediction, shap } = mlResponse.data;

    // Determine risk level and generate interpretation
    const riskLevel = getRiskLevel(prediction, predictionType);
    const interpretation = generateInterpretation(prediction, predictionType, riskLevel);
    const recommendations = generateRecommendations(riskLevel, predictionType);

    // Save prediction to database
    const predictionRecord = new Prediction({
      userId: req.user._id,
      predictionType,
      inputData,
      result: {
        prediction,
        probability: Array.isArray(prediction) ? Math.max(...prediction) : prediction,
        riskLevel
      },
      shapValues: shap,
      interpretation,
      recommendations
    });

    await predictionRecord.save();

    res.status(201).json({
      message: 'Prediction generated successfully',
      prediction: predictionRecord
    });

  } catch (error) {
    console.error('Prediction error:', error);
    
    if (error.response) {
      return res.status(500).json({ 
        error: 'ML server error: ' + error.response.data.error 
      });
    }

    res.status(500).json({ error: 'Server error during prediction' });
  }
};

// Get user predictions
const getUserPredictions = async (req, res) => {
  try {
    const { predictionType, limit = 20, page = 1 } = req.query;
    
    let query = { userId: req.user._id };
    if (predictionType) {
      query.predictionType = predictionType;
    }

    const skip = (page - 1) * limit;

    const predictions = await Prediction.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Prediction.countDocuments(query);

    res.json({
      predictions,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        count: predictions.length,
        totalRecords: total
      }
    });
  } catch (error) {
    console.error('Get predictions error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get specific prediction
const getPrediction = async (req, res) => {
  try {
    const { id } = req.params;

    const prediction = await Prediction.findOne({
      _id: id,
      userId: req.user._id
    });

    if (!prediction) {
      return res.status(404).json({ error: 'Prediction not found' });
    }

    res.json(prediction);
  } catch (error) {
    console.error('Get prediction error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Helper function to determine risk level
const getRiskLevel = (prediction, type) => {
  if (Array.isArray(prediction)) {
    const maxProb = Math.max(...prediction);
    if (maxProb > 0.7) return 'high';
    if (maxProb > 0.4) return 'medium';
    return 'low';
  } else {
    if (prediction > 0.7) return 'high';
    if (prediction > 0.4) return 'medium';
    return 'low';
  }
};

// Helper function to generate interpretation
const generateInterpretation = (prediction, type, riskLevel) => {
  const predValue = Array.isArray(prediction) ? Math.max(...prediction) : prediction;
  const percentage = Math.round(predValue * 100);

  const interpretations = {
    diabetes: {
      high: `High risk of diabetes detected (${percentage}% probability). Immediate medical consultation recommended.`,
      medium: `Moderate risk of diabetes (${percentage}% probability). Consider lifestyle changes and regular monitoring.`,
      low: `Low risk of diabetes (${percentage}% probability). Maintain healthy lifestyle habits.`
    },
    heart: {
      high: `High risk of heart disease detected (${percentage}% probability). Urgent medical evaluation recommended.`,
      medium: `Moderate risk of heart disease (${percentage}% probability). Regular cardio checkups advised.`,
      low: `Low risk of heart disease (${percentage}% probability). Continue heart-healthy practices.`
    },
    stroke: {
      high: `High risk of stroke detected (${percentage}% probability). Immediate medical attention required.`,
      medium: `Moderate risk of stroke (${percentage}% probability). Monitor blood pressure and consult doctor.`,
      low: `Low risk of stroke (${percentage}% probability). Maintain current health practices.`
    }
  };

  return interpretations[type][riskLevel];
};

// Helper function to generate recommendations
const generateRecommendations = (riskLevel, type) => {
  const baseRecommendations = {
    diabetes: [
      'Monitor blood sugar levels regularly',
      'Maintain a balanced, low-sugar diet',
      'Exercise regularly (30 minutes daily)',
      'Maintain healthy weight'
    ],
    heart: [
      'Follow a heart-healthy diet',
      'Exercise regularly',
      'Monitor blood pressure',
      'Avoid smoking and excessive alcohol'
    ],
    stroke: [
      'Control blood pressure',
      'Maintain healthy cholesterol levels',
      'Stay physically active',
      'Follow a Mediterranean-style diet'
    ]
  };

  let recommendations = [...baseRecommendations[type]];

  if (riskLevel === 'high') {
    recommendations.unshift('Consult with a healthcare provider immediately');
    recommendations.push('Consider medication management');
  } else if (riskLevel === 'medium') {
    recommendations.unshift('Schedule a consultation with your doctor');
    recommendations.push('Increase monitoring frequency');
  }

  return recommendations;
};

module.exports = {
  createPrediction,
  getUserPredictions,
  getPrediction
};
