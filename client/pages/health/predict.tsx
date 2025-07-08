import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/router';
import Navigation from '../../components/Navigation';
import axios from 'axios';

interface PredictionResult {
  prediction: number;
  riskLevel: string;
  interpretation: string;
  recommendations: string[];
  shapValues?: any;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

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
    heartDisease: '',
    everMarried: '',
    workType: '',
    residenceType: '',
    avgGlucoseLevel: '',
    bmi: '',
    smokingStatus: ''
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
      let inputData: any = {};
      let featureNames: string[] = [];

      // Prepare data based on active tab
      if (activeTab === 'diabetes') {
        inputData = Object.values(diabetesData).map(val => parseFloat(val) || 0);
        featureNames = ['pregnancies', 'glucose', 'bloodPressure', 'skinThickness', 'insulin', 'bmi', 'diabetesPedigreeFunction', 'age'];
      } else if (activeTab === 'heart') {
        inputData = Object.values(heartData).map(val => parseFloat(val) || 0);
        featureNames = ['age', 'sex', 'cp', 'trestbps', 'chol', 'fbs', 'restecg', 'thalach', 'exang', 'oldpeak', 'slope', 'ca', 'thal'];
      } else if (activeTab === 'stroke') {
        inputData = Object.values(strokeData).map(val => isNaN(parseFloat(val)) ? val : parseFloat(val));
        featureNames = ['gender', 'age', 'hypertension', 'heartDisease', 'everMarried', 'workType', 'residenceType', 'avgGlucoseLevel', 'bmi', 'smokingStatus'];
      }

      const response = await axios.post(`${API_BASE_URL}/predict`, {
        predictionType: activeTab,
        inputData,
        featureNames
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      setPrediction(response.data.prediction);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Prediction failed');
      console.error('Prediction error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderDiabetesForm = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="form-label">Pregnancies</label>
        <input
          type="number"
          className="form-input"
          value={diabetesData.pregnancies}
          onChange={(e) => setDiabetesData({...diabetesData, pregnancies: e.target.value})}
          placeholder="Number of pregnancies"
        />
      </div>
      <div>
        <label className="form-label">Glucose Level</label>
        <input
          type="number"
          className="form-input"
          value={diabetesData.glucose}
          onChange={(e) => setDiabetesData({...diabetesData, glucose: e.target.value})}
          placeholder="Plasma glucose (mg/dL)"
        />
      </div>
      <div>
        <label className="form-label">Blood Pressure</label>
        <input
          type="number"
          className="form-input"
          value={diabetesData.bloodPressure}
          onChange={(e) => setDiabetesData({...diabetesData, bloodPressure: e.target.value})}
          placeholder="Diastolic BP (mm Hg)"
        />
      </div>
      <div>
        <label className="form-label">Skin Thickness</label>
        <input
          type="number"
          className="form-input"
          value={diabetesData.skinThickness}
          onChange={(e) => setDiabetesData({...diabetesData, skinThickness: e.target.value})}
          placeholder="Triceps skin fold (mm)"
        />
      </div>
      <div>
        <label className="form-label">Insulin</label>
        <input
          type="number"
          className="form-input"
          value={diabetesData.insulin}
          onChange={(e) => setDiabetesData({...diabetesData, insulin: e.target.value})}
          placeholder="2-Hour serum insulin (mu U/ml)"
        />
      </div>
      <div>
        <label className="form-label">BMI</label>
        <input
          type="number"
          step="0.1"
          className="form-input"
          value={diabetesData.bmi}
          onChange={(e) => setDiabetesData({...diabetesData, bmi: e.target.value})}
          placeholder="Body Mass Index"
        />
      </div>
      <div>
        <label className="form-label">Diabetes Pedigree Function</label>
        <input
          type="number"
          step="0.001"
          className="form-input"
          value={diabetesData.diabetesPedigreeFunction}
          onChange={(e) => setDiabetesData({...diabetesData, diabetesPedigreeFunction: e.target.value})}
          placeholder="Diabetes pedigree function"
        />
      </div>
      <div>
        <label className="form-label">Age</label>
        <input
          type="number"
          className="form-input"
          value={diabetesData.age}
          onChange={(e) => setDiabetesData({...diabetesData, age: e.target.value})}
          placeholder="Age in years"
        />
      </div>
    </div>
  );

  const renderHeartForm = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="form-label">Age</label>
        <input
          type="number"
          className="form-input"
          value={heartData.age}
          onChange={(e) => setHeartData({...heartData, age: e.target.value})}
          placeholder="Age in years"
        />
      </div>
      <div>
        <label className="form-label">Sex</label>
        <select
          className="form-input"
          value={heartData.sex}
          onChange={(e) => setHeartData({...heartData, sex: e.target.value})}
        >
          <option value="">Select sex</option>
          <option value="1">Male</option>
          <option value="0">Female</option>
        </select>
      </div>
      <div>
        <label className="form-label">Chest Pain Type</label>
        <select
          className="form-input"
          value={heartData.cp}
          onChange={(e) => setHeartData({...heartData, cp: e.target.value})}
        >
          <option value="">Select type</option>
          <option value="0">Typical angina</option>
          <option value="1">Atypical angina</option>
          <option value="2">Non-anginal pain</option>
          <option value="3">Asymptomatic</option>
        </select>
      </div>
      <div>
        <label className="form-label">Resting Blood Pressure</label>
        <input
          type="number"
          className="form-input"
          value={heartData.trestbps}
          onChange={(e) => setHeartData({...heartData, trestbps: e.target.value})}
          placeholder="mm Hg"
        />
      </div>
      <div>
        <label className="form-label">Serum Cholesterol</label>
        <input
          type="number"
          className="form-input"
          value={heartData.chol}
          onChange={(e) => setHeartData({...heartData, chol: e.target.value})}
          placeholder="mg/dl"
        />
      </div>
      <div>
        <label className="form-label">Fasting Blood Sugar &gt; 120 mg/dl</label>
        <select
          className="form-input"
          value={heartData.fbs}
          onChange={(e) => setHeartData({...heartData, fbs: e.target.value})}
        >
          <option value="">Select</option>
          <option value="1">Yes</option>
          <option value="0">No</option>
        </select>
      </div>
    </div>
  );

  const renderStrokeForm = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="form-label">Gender</label>
        <select
          className="form-input"
          value={strokeData.gender}
          onChange={(e) => setStrokeData({...strokeData, gender: e.target.value})}
        >
          <option value="">Select gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>
      </div>
      <div>
        <label className="form-label">Age</label>
        <input
          type="number"
          className="form-input"
          value={strokeData.age}
          onChange={(e) => setStrokeData({...strokeData, age: e.target.value})}
          placeholder="Age in years"
        />
      </div>
      <div>
        <label className="form-label">Hypertension</label>
        <select
          className="form-input"
          value={strokeData.hypertension}
          onChange={(e) => setStrokeData({...strokeData, hypertension: e.target.value})}
        >
          <option value="">Select</option>
          <option value="1">Yes</option>
          <option value="0">No</option>
        </select>
      </div>
      <div>
        <label className="form-label">Heart Disease</label>
        <select
          className="form-input"
          value={strokeData.heartDisease}
          onChange={(e) => setStrokeData({...strokeData, heartDisease: e.target.value})}
        >
          <option value="">Select</option>
          <option value="1">Yes</option>
          <option value="0">No</option>
        </select>
      </div>
      <div>
        <label className="form-label">Ever Married</label>
        <select
          className="form-input"
          value={strokeData.everMarried}
          onChange={(e) => setStrokeData({...strokeData, everMarried: e.target.value})}
        >
          <option value="">Select</option>
          <option value="Yes">Yes</option>
          <option value="No">No</option>
        </select>
      </div>
      <div>
        <label className="form-label">Average Glucose Level</label>
        <input
          type="number"
          step="0.1"
          className="form-input"
          value={strokeData.avgGlucoseLevel}
          onChange={(e) => setStrokeData({...strokeData, avgGlucoseLevel: e.target.value})}
          placeholder="mg/dL"
        />
      </div>
      <div>
        <label className="form-label">BMI</label>
        <input
          type="number"
          step="0.1"
          className="form-input"
          value={strokeData.bmi}
          onChange={(e) => setStrokeData({...strokeData, bmi: e.target.value})}
          placeholder="Body Mass Index"
        />
      </div>
      <div>
        <label className="form-label">Smoking Status</label>
        <select
          className="form-input"
          value={strokeData.smokingStatus}
          onChange={(e) => setStrokeData({...strokeData, smokingStatus: e.target.value})}
        >
          <option value="">Select</option>
          <option value="never smoked">Never smoked</option>
          <option value="formerly smoked">Formerly smoked</option>
          <option value="smokes">Smokes</option>
          <option value="Unknown">Unknown</option>
        </select>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation variant="dashboard" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Health Risk Prediction</h1>
          <p className="text-gray-600 mt-2">
            Get AI-powered health risk assessments using advanced machine learning
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <nav className="flex space-x-8">
            {['diabetes', 'heart', 'stroke'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)} Risk
              </button>
            ))}
          </nav>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Form */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">
              {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Risk Assessment
            </h2>
            
            <form onSubmit={handleSubmit}>
              {activeTab === 'diabetes' && renderDiabetesForm()}
              {activeTab === 'heart' && renderHeartForm()}
              {activeTab === 'stroke' && renderStrokeForm()}

              {error && (
                <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                  {error}
                </div>
              )}

              <div className="mt-6">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary w-full"
                >
                  {isSubmitting ? 'Analyzing...' : 'Get Risk Assessment'}
                </button>
              </div>
            </form>
          </div>

          {/* Results */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Prediction Results</h2>
            
            {prediction ? (
              <div className="space-y-4">
                <div className={`p-4 rounded-lg border-2 ${
                  prediction.riskLevel === 'high' ? 'risk-high' :
                  prediction.riskLevel === 'medium' ? 'risk-medium' : 'risk-low'
                }`}>
                  <h3 className="font-semibold text-lg">
                    Risk Level: {prediction.riskLevel.toUpperCase()}
                  </h3>
                  <p className="mt-2">{prediction.interpretation}</p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Recommendations:</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {prediction.recommendations.map((rec, index) => (
                      <li key={index} className="text-gray-700">{rec}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <p>Fill out the form and click "Get Risk Assessment" to see your results</p>
              </div>
            )}
          </div>
        </div>

        {/* Creator Information */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Created by{' '}
            <a href="https://www.linkedin.com/in/shashwat-awasthi18/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 font-medium">
              Shashwat Awasthi
            </a>
            {' • '}
            <a href="https://github.com/shashwat-a18" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 font-medium">
              GitHub
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
