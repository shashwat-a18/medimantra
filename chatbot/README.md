# MediMitra Chatbot

## Creator Information
**Created by:** Shashwat Awasthi  
**GitHub:** [https://github.com/shashwat-a18](https://github.com/shashwat-a18)  
**LinkedIn:** [https://www.linkedin.com/in/shashwat-awasthi18/](https://www.linkedin.com/in/shashwat-awasthi18/)

## Overview
This is the AI chatbot component for Medical Health Tracker (MediMitra).

### Features
- Health-related conversation handling
- Intent recognition for medical queries
- Emergency detection and appropriate responses
- Integration with MediMitra prediction tools
- Quick action buttons for common health tasks

### Available Chatbot Options

#### Option 1: Simple Flask Chatbot (Recommended for Development)
```bash
# Install dependencies
pip install flask flask-cors requests

# Run the simple chatbot server
python simple_chatbot.py
```
**Endpoints:**
- `http://localhost:5005/webhooks/rest/webhook` - Main chat endpoint
- `http://localhost:5005/status` - Health check
- `http://localhost:5005/` - API information

#### Option 2: Full Rasa Integration (Production)
```bash
# Install Rasa
pip install rasa rasa-sdk

# Train the model
rasa train

# Run Rasa server
rasa run --enable-api --cors "*" --port 5005
```

### Configuration Files
- `simple_chatbot.py` - Lightweight Flask chatbot server
- `config.yml` - Rasa pipeline configuration
- `domain.yml` - Intents, entities, and responses
- `data/nlu.yml` - Training examples
- `data/stories.yml` - Conversation flows
- `actions/custom_actions.py` - Custom actions

### Health Topics Supported
- General health questions
- Symptom assessment (headache, fever, etc.)
- Diabetes and heart health information
- Emergency guidance
- Integration with ML prediction tools

### Medical Disclaimer
⚠️ **Important:** This chatbot provides general health information only and should not replace professional medical advice. For emergencies, call 911 immediately.

---
**Project:** MediMitra - Medical Health Tracker  
**Created by:** Shashwat Awasthi
