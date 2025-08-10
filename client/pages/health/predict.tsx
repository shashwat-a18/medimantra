import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/router';
import DashboardLayout from '../../components/DashboardLayout';
import { Card, Button, Input, Badge } from '../../components/ui/ModernComponents';
import axios from 'axios';

import { API_CONFIG } from '../utils/api';
interface PredictionResult {
  prediction: number;
  riskLevel: string;
  interpretation: string;
  recommendations: string[];
  shapValues?: any;
}

export default function HealthPredict() {
  const { isAuthenticated, loading, token } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'diabetes' | 'heart' | 'stroke'>('diabetes');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [error, setError] = useState('');

  // Form data for different prediction types
  const [diabetesData, setDiabetesData] = useState({
    pregnancies: '',
    glucose: '',
    bloodPressure: '',
    skinThickness: '',
    insulin: '',
    bmi: '',
    diabetesPedigreeFunction: '',
    age: ''
  });

  const [heartData, setHeartData] = useState({
    age: '',
    sex: '',
    cp: '',
    trestbps: '',
    chol: '',
    fbs: '',
    restecg: '',
    thalach: '',
    exang: '',
    oldpeak: '',
    slope: '',
    ca: '',
    thal: ''
  });

  const [strokeData, setStrokeData] = useState({
    gender: '',
    age: '',
    hypertension: '',
    heart_disease: '',
    ever_married: '',
    work_type: '',
    Residence_type: '',
    avg_glucose_level: '',
    bmi: '',
    smoking_status: ''
  });

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    setPrediction(null);

    try {
      let endpoint = '';
      let data = {};

      switch (activeTab) {
        case 'diabetes':
          endpoint = '/predict/diabetes';
          data = diabetesData;
          break;
        case 'heart':
          endpoint = '/predict/heart';
          data = heartData;
          break;
        case 'stroke':
          endpoint = '/predict/stroke';
          data = strokeData;
          break;
      }

      const response = await axios.post(`${API_CONFIG.BASE_URL}${endpoint}`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setPrediction(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || `Failed to get ${activeTab} prediction`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setPrediction(null);
    setError('');
    
    switch (activeTab) {
      case 'diabetes':
        setDiabetesData({
          pregnancies: '',
          glucose: '',
          bloodPressure: '',
          skinThickness: '',
          insulin: '',
          bmi: '',
          diabetesPedigreeFunction: '',
          age: ''
        });
        break;
      case 'heart':
        setHeartData({
          age: '',
          sex: '',
          cp: '',
          trestbps: '',
          chol: '',
          fbs: '',
          restecg: '',
          thalach: '',
          exang: '',
          oldpeak: '',
          slope: '',
          ca: '',
          thal: ''
        });
        break;
      case 'stroke':
        setStrokeData({
          gender: '',
          age: '',
          hypertension: '',
          heart_disease: '',
          ever_married: '',
          work_type: '',
          Residence_type: '',
          avg_glucose_level: '',
          bmi: '',
          smoking_status: ''
        });
        break;
    }
  };

  const getRiskColor = (riskLevel: string): 'green' | 'yellow' | 'red' => {
    switch (riskLevel.toLowerCase()) {
      case 'low':
        return 'green';
      case 'moderate':
      case 'medium':
        return 'yellow';
      case 'high':
        return 'red';
      default:
        return 'gray' as any;
    }
  };

  const getTabInfo = (tab: string) => {
    switch (tab) {
      case 'diabetes':
        return {
          icon: '🩸',
          title: 'Diabetes Risk',
          description: 'Predict your risk of developing Type 2 diabetes'
        };
      case 'heart':
        return {
          icon: '❤️',
          title: 'Heart Disease Risk',
          description: 'Assess your cardiovascular disease risk'
        };
      case 'stroke':
        return {
          icon: '🧠',
          title: 'Stroke Risk',
          description: 'Evaluate your risk of stroke occurrence'
        };
      default:
        return { icon: '🏥', title: '', description: '' };
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </DashboardLayout>
    );
  }

  const tabInfo = getTabInfo(activeTab);

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent mb-2">
            AI Health Predictions
          </h1>
          <p className="text-gray-400">
            Get personalized health risk assessments using advanced machine learning
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="flex bg-gray-100 rounded-lg p-1">
            {[
              { id: 'diabetes', label: 'Diabetes', icon: '🩸' },
              { id: 'heart', label: 'Heart Disease', icon: '❤️' },
              { id: 'stroke', label: 'Stroke', icon: '🧠' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  resetForm();
                }}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-blue-500 to-green-500 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white hover:bg-gray-200'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Input Form */}
          <Card>
            <div className="p-6">
              <div className="flex items-center mb-6">
                <span className="text-3xl mr-4">{tabInfo.icon}</span>
                <div>
                  <h2 className="text-xl font-bold text-white">{tabInfo.title}</h2>
                  <p className="text-gray-400 text-sm">{tabInfo.description}</p>
                </div>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Diabetes Form */}
                {activeTab === 'diabetes' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Pregnancies"
                      type="number"
                      value={diabetesData.pregnancies}
                      onChange={(e) => setDiabetesData({...diabetesData, pregnancies: e.target.value})}
                      placeholder="Number of pregnancies"
                      required
                    />
                    <Input
                      label="Glucose Level"
                      type="number"
                      value={diabetesData.glucose}
                      onChange={(e) => setDiabetesData({...diabetesData, glucose: e.target.value})}
                      placeholder="Plasma glucose concentration"
                      required
                    />
                    <Input
                      label="Blood Pressure"
                      type="number"
                      value={diabetesData.bloodPressure}
                      onChange={(e) => setDiabetesData({...diabetesData, bloodPressure: e.target.value})}
                      placeholder="Diastolic blood pressure (mm Hg)"
                      required
                    />
                    <Input
                      label="Skin Thickness"
                      type="number"
                      value={diabetesData.skinThickness}
                      onChange={(e) => setDiabetesData({...diabetesData, skinThickness: e.target.value})}
                      placeholder="Triceps skinfold thickness (mm)"
                      required
                    />
                    <Input
                      label="Insulin"
                      type="number"
                      value={diabetesData.insulin}
                      onChange={(e) => setDiabetesData({...diabetesData, insulin: e.target.value})}
                      placeholder="2-Hour serum insulin (mu U/ml)"
                      required
                    />
                    <Input
                      label="BMI"
                      type="number"
                      step="0.1"
                      value={diabetesData.bmi}
                      onChange={(e) => setDiabetesData({...diabetesData, bmi: e.target.value})}
                      placeholder="Body mass index"
                      required
                    />
                    <Input
                      label="Diabetes Pedigree"
                      type="number"
                      step="0.001"
                      value={diabetesData.diabetesPedigreeFunction}
                      onChange={(e) => setDiabetesData({...diabetesData, diabetesPedigreeFunction: e.target.value})}
                      placeholder="Diabetes pedigree function"
                      required
                    />
                    <Input
                      label="Age"
                      type="number"
                      value={diabetesData.age}
                      onChange={(e) => setDiabetesData({...diabetesData, age: e.target.value})}
                      placeholder="Age in years"
                      required
                    />
                  </div>
                )}

                {/* Heart Disease Form */}
                {activeTab === 'heart' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Age"
                      type="number"
                      value={heartData.age}
                      onChange={(e) => setHeartData({...heartData, age: e.target.value})}
                      placeholder="Age in years"
                      required
                    />
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Sex <span className="text-red-500">*</span>
                      </label>
                      <select
                        className="w-full px-4 py-3 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={heartData.sex}
                        onChange={(e) => setHeartData({...heartData, sex: e.target.value})}
                        required
                      >
                        <option value="">Select sex</option>
                        <option value="1">Male</option>
                        <option value="0">Female</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Chest Pain Type <span className="text-red-500">*</span>
                      </label>
                      <select
                        className="w-full px-4 py-3 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={heartData.cp}
                        onChange={(e) => setHeartData({...heartData, cp: e.target.value})}
                        required
                      >
                        <option value="">Select type</option>
                        <option value="0">Typical angina</option>
                        <option value="1">Atypical angina</option>
                        <option value="2">Non-anginal pain</option>
                        <option value="3">Asymptomatic</option>
                      </select>
                    </div>
                    <Input
                      label="Resting Blood Pressure"
                      type="number"
                      value={heartData.trestbps}
                      onChange={(e) => setHeartData({...heartData, trestbps: e.target.value})}
                      placeholder="Resting blood pressure (mm Hg)"
                      required
                    />
                    <Input
                      label="Cholesterol"
                      type="number"
                      value={heartData.chol}
                      onChange={(e) => setHeartData({...heartData, chol: e.target.value})}
                      placeholder="Serum cholesterol (mg/dl)"
                      required
                    />
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Fasting Blood Sugar {'>'}= 120 mg/dl <span className="text-red-500">*</span>
                      </label>
                      <select
                        className="w-full px-4 py-3 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={heartData.fbs}
                        onChange={(e) => setHeartData({...heartData, fbs: e.target.value})}
                        required
                      >
                        <option value="">Select option</option>
                        <option value="1">Yes</option>
                        <option value="0">No</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* Stroke Form */}
                {activeTab === 'stroke' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Gender <span className="text-red-500">*</span>
                      </label>
                      <select
                        className="w-full px-4 py-3 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={strokeData.gender}
                        onChange={(e) => setStrokeData({...strokeData, gender: e.target.value})}
                        required
                      >
                        <option value="">Select gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                      </select>
                    </div>
                    <Input
                      label="Age"
                      type="number"
                      value={strokeData.age}
                      onChange={(e) => setStrokeData({...strokeData, age: e.target.value})}
                      placeholder="Age in years"
                      required
                    />
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Hypertension <span className="text-red-500">*</span>
                      </label>
                      <select
                        className="w-full px-4 py-3 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={strokeData.hypertension}
                        onChange={(e) => setStrokeData({...strokeData, hypertension: e.target.value})}
                        required
                      >
                        <option value="">Select option</option>
                        <option value="1">Yes</option>
                        <option value="0">No</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Heart Disease <span className="text-red-500">*</span>
                      </label>
                      <select
                        className="w-full px-4 py-3 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={strokeData.heart_disease}
                        onChange={(e) => setStrokeData({...strokeData, heart_disease: e.target.value})}
                        required
                      >
                        <option value="">Select option</option>
                        <option value="1">Yes</option>
                        <option value="0">No</option>
                      </select>
                    </div>
                    <Input
                      label="Average Glucose Level"
                      type="number"
                      step="0.1"
                      value={strokeData.avg_glucose_level}
                      onChange={(e) => setStrokeData({...strokeData, avg_glucose_level: e.target.value})}
                      placeholder="Average glucose level"
                      required
                    />
                    <Input
                      label="BMI"
                      type="number"
                      step="0.1"
                      value={strokeData.bmi}
                      onChange={(e) => setStrokeData({...strokeData, bmi: e.target.value})}
                      placeholder="Body mass index"
                      required
                    />
                  </div>
                )}

                <div className="flex space-x-4 pt-4">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <span className="mr-2">🔮</span>
                        Get Prediction
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={resetForm}
                  >
                    Reset
                  </Button>
                </div>
              </form>
            </div>
          </Card>

          {/* Results */}
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-bold text-white mb-6 flex items-center">
                <span className="text-2xl mr-3">📊</span>
                Prediction Results
              </h3>

              {prediction ? (
                <div className="space-y-6">
                  {/* Risk Level */}
                  <div className="text-center p-6 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg">
                    <div className="text-6xl mb-4">
                      {prediction.riskLevel.toLowerCase() === 'low' ? '✅' : 
                       prediction.riskLevel.toLowerCase() === 'moderate' ? '⚠️' : '🚨'}
                    </div>
                    <div className="flex justify-center mb-2">
                      <Badge color={getRiskColor(prediction.riskLevel)} className="px-4 py-2 text-lg">
                        {prediction.riskLevel} Risk
                      </Badge>
                    </div>
                    <p className="text-2xl font-bold text-white mb-2">
                      {(prediction.prediction * 100).toFixed(1)}% Risk
                    </p>
                    <p className="text-gray-400">{prediction.interpretation}</p>
                  </div>

                  {/* Recommendations */}
                  <div>
                    <h4 className="font-semibold text-white mb-3 flex items-center">
                      <span className="text-xl mr-2">💡</span>
                      Recommendations
                    </h4>
                    <ul className="space-y-2">
                      {prediction.recommendations.map((rec, index) => (
                        <li key={index} className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                          <span className="text-blue-500 font-bold">{index + 1}.</span>
                          <span className="text-gray-300">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Disclaimer */}
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <span className="text-yellow-500 text-xl">⚠️</span>
                      <div>
                        <p className="text-yellow-800 font-medium mb-1">Medical Disclaimer</p>
                        <p className="text-yellow-700 text-sm">
                          This prediction is for informational purposes only and should not replace 
                          professional medical advice. Please consult with a healthcare provider 
                          for proper diagnosis and treatment.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <span className="text-6xl mb-4 block">🔮</span>
                  <h4 className="text-lg font-medium text-white mb-2">
                    Ready for Analysis
                  </h4>
                  <p className="text-gray-400">
                    Fill out the form on the left to get your personalized {tabInfo.title.toLowerCase()} assessment
                  </p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Information Cards */}
        <div className="grid md:grid-cols-3 gap-6 mt-8">
          <Card className="text-center p-6">
            <span className="text-4xl mb-3 block">🤖</span>
            <h3 className="font-semibold text-white mb-2">AI-Powered</h3>
            <p className="text-sm text-gray-400">
              Advanced machine learning models trained on extensive medical datasets
            </p>
          </Card>
          
          <Card className="text-center p-6">
            <span className="text-4xl mb-3 block">🔒</span>
            <h3 className="font-semibold text-white mb-2">Secure & Private</h3>
            <p className="text-sm text-gray-400">
              Your health data is processed securely and never stored permanently
            </p>
          </Card>
          
          <Card className="text-center p-6">
            <span className="text-4xl mb-3 block">📈</span>
            <h3 className="font-semibold text-white mb-2">Evidence-Based</h3>
            <p className="text-sm text-gray-400">
              Predictions based on clinically validated risk factors and medical research
            </p>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
