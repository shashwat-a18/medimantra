#!/usr/bin/env python3
"""
Simple Chatbot Server for MediMitra
Created by: Shashwat Awasthi
GitHub: https://github.com/shashwat-a18
LinkedIn: https://www.linkedin.com/in/shashwat-awasthi18/

A lightweight chatbot server that can be used as an alternative to Rasa
for development and testing purposes.
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import random
import json
from datetime import datetime

app = Flask(__name__)
CORS(app)

# Simple response patterns for health-related queries
HEALTH_RESPONSES = {
    "greet": [
        "Hello! I'm your MediMitra health assistant. How can I help you today?",
        "Hi there! Ready to help you with your health questions.",
        "Welcome to MediMitra! What health information can I assist you with?"
    ],
    "goodbye": [
        "Take care of your health! Goodbye!",
        "Stay healthy! See you later.",
        "Remember to stay hydrated and exercise! Bye!"
    ],
    "headache": [
        "For headaches, try drinking water, resting in a dark room, and applying a cold compress. If symptoms persist, consult a doctor.",
        "Headaches can be caused by dehydration, stress, or lack of sleep. Try relaxing and staying hydrated."
    ],
    "fever": [
        "For fever, rest, drink plenty of fluids, and monitor your temperature. If fever exceeds 103°F (39.4°C), seek medical attention.",
        "Fever is your body's way of fighting infection. Stay hydrated and rest. Contact a doctor if symptoms worsen."
    ],
    "diabetes": [
        "For diabetes management, monitor blood sugar regularly, follow a healthy diet, exercise, and take medications as prescribed.",
        "Diabetes requires careful management. Use our prediction tool to assess your risk and consult healthcare providers."
    ],
    "heart": [
        "Heart health is important! Regular exercise, healthy diet, and stress management are key.",
        "For heart-related concerns, consider using our heart disease risk prediction tool and consult a cardiologist."
    ],
    "emergency": [
        "🚨 FOR MEDICAL EMERGENCIES, CALL 911 IMMEDIATELY! 🚨",
        "⚠️ This is not a substitute for emergency medical care. Call emergency services if needed."
    ],
    "default": [
        "I understand you have a health question. Can you provide more details?",
        "I'm here to help with health-related queries. Try asking about symptoms, conditions, or use our prediction tools.",
        "For specific medical advice, please consult a healthcare professional. I can provide general health information."
    ]
}

def get_response_category(message):
    """Determine response category based on message content"""
    message_lower = message.lower()
    
    if any(word in message_lower for word in ["hello", "hi", "hey", "good morning", "good evening"]):
        return "greet"
    elif any(word in message_lower for word in ["bye", "goodbye", "see you", "thanks", "thank you"]):
        return "goodbye"
    elif any(word in message_lower for word in ["headache", "head pain", "migraine"]):
        return "headache"
    elif any(word in message_lower for word in ["fever", "temperature", "hot", "burning"]):
        return "fever"
    elif any(word in message_lower for word in ["diabetes", "blood sugar", "glucose"]):
        return "diabetes"
    elif any(word in message_lower for word in ["heart", "chest pain", "cardiac"]):
        return "heart"
    elif any(word in message_lower for word in ["emergency", "urgent", "serious", "911", "help"]):
        return "emergency"
    else:
        return "default"

@app.route('/webhooks/rest/webhook', methods=['POST'])
def webhook():
    """Main webhook endpoint for chatbot conversations"""
    try:
        data = request.get_json()
        message = data.get('message', '')
        sender = data.get('sender', 'user')
        
        # Get appropriate response category
        category = get_response_category(message)
        
        # Select random response from category
        responses = HEALTH_RESPONSES.get(category, HEALTH_RESPONSES["default"])
        bot_message = random.choice(responses)
        
        # Add quick reply buttons for certain categories
        response_data = {
            "text": bot_message
        }
        
        if category == "greet":
            response_data["buttons"] = [
                {"title": "Check Health Risk", "payload": "/predict_risk"},
                {"title": "Ask Health Question", "payload": "/health_question"},
                {"title": "View Health Records", "payload": "/view_records"}
            ]
        elif category == "default":
            response_data["buttons"] = [
                {"title": "Diabetes Risk", "payload": "/diabetes"},
                {"title": "Heart Health", "payload": "/heart"},
                {"title": "Emergency Help", "payload": "/emergency"}
            ]
        
        return jsonify([response_data])
        
    except Exception as e:
        return jsonify([{
            "text": "I'm having trouble processing your request. Please try again or contact support."
        }]), 500

@app.route('/model/parse', methods=['POST'])
def parse():
    """Parse intent from message (Rasa compatibility endpoint)"""
    try:
        data = request.get_json()
        message = data.get('text', '')
        
        # Simple intent classification
        category = get_response_category(message)
        
        return jsonify({
            "text": message,
            "intent": {"name": category, "confidence": 0.8},
            "entities": [],
            "intent_ranking": [{"name": category, "confidence": 0.8}]
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/status', methods=['GET'])
def status():
    """Health check endpoint"""
    return jsonify({
        "status": "running",
        "message": "MediMitra Chatbot is online",
        "version": "1.0.0",
        "timestamp": datetime.now().isoformat()
    })

@app.route('/', methods=['GET'])
def home():
    """Home endpoint with API information"""
    return jsonify({
        "service": "MediMitra Chatbot Server",
        "creator": "Shashwat Awasthi",
        "github": "https://github.com/shashwat-a18",
        "linkedin": "https://www.linkedin.com/in/shashwat-awasthi18/",
        "version": "1.0.0",
        "endpoints": {
            "/webhooks/rest/webhook": "POST - Main chat endpoint",
            "/model/parse": "POST - Intent parsing",
            "/status": "GET - Health check"
        }
    })

if __name__ == '__main__':
    print("Starting MediMitra Chatbot Server...")
    print("Created by: Shashwat Awasthi")
    print("GitHub: https://github.com/shashwat-a18")
    print("LinkedIn: https://www.linkedin.com/in/shashwat-awasthi18/")
    print("Server will run on http://localhost:5005")
    
    app.run(host='0.0.0.0', port=5005, debug=True)
