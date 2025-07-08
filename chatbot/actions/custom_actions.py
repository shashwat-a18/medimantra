from typing import Any, Text, Dict, List
from rasa_sdk import Action, Tracker
from rasa_sdk.executor import CollectingDispatcher
import requests
import os

class ActionViewHealthData(Action):
    def name(self) -> Text:
        return "action_view_health_data"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        
        user_id = tracker.sender_id
        
        # Mock response - In production, this would fetch from your API
        dispatcher.utter_message(text=f"Here's your recent health data summary:\n"
                                     f"• Blood Pressure: 120/80 mmHg\n"
                                     f"• Heart Rate: 72 bpm\n"
                                     f"• Blood Sugar: 95 mg/dL\n"
                                     f"• Weight: 70 kg\n"
                                     f"Last updated: Today")
        
        return []

class ActionPredictRisk(Action):
    def name(self) -> Text:
        return "action_predict_risk"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        
        user_id = tracker.sender_id
        
        # Mock response - In production, this would call your ML prediction API
        dispatcher.utter_message(text="Based on your current health data:\n"
                                     f"• Diabetes Risk: Low (15%)\n"
                                     f"• Heart Disease Risk: Low (12%)\n"
                                     f"• Stroke Risk: Very Low (8%)\n\n"
                                     f"Keep up the healthy lifestyle! Regular exercise and a balanced diet are helping maintain your low risk levels.")
        
        return []

class ActionSetReminder(Action):
    def name(self) -> Text:
        return "action_set_reminder"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        
        user_id = tracker.sender_id
        
        # Mock response - In production, this would create a reminder via your API
        dispatcher.utter_message(text="I can help you set up reminders! What would you like to be reminded about?\n"
                                     f"• Medication times\n"
                                     f"• Doctor appointments\n"
                                     f"• Health check-ups\n"
                                     f"• Exercise routine\n\n"
                                     f"Please specify the type and time for your reminder.")
        
        return []

class ActionHealthAdvice(Action):
    def name(self) -> Text:
        return "action_health_advice"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        
        health_condition = tracker.get_slot("health_condition")
        
        if health_condition:
            # Provide specific advice based on condition
            advice_map = {
                "diabetes": "For diabetes management:\n• Monitor blood sugar regularly\n• Follow a balanced, low-sugar diet\n• Exercise for 30 minutes daily\n• Take medications as prescribed\n• Stay hydrated",
                "heart": "For heart health:\n• Eat a heart-healthy diet rich in fruits and vegetables\n• Exercise regularly\n• Limit sodium intake\n• Avoid smoking\n• Manage stress levels",
                "stroke": "For stroke prevention:\n• Control blood pressure\n• Maintain healthy cholesterol levels\n• Stay physically active\n• Follow a Mediterranean-style diet\n• Don't smoke"
            }
            
            advice = advice_map.get(health_condition.lower(), "Please consult with your healthcare provider for personalized advice.")
            dispatcher.utter_message(text=advice)
        else:
            dispatcher.utter_message(text="Here are some general health tips:\n"
                                         f"• Eat a balanced diet with plenty of fruits and vegetables\n"
                                         f"• Exercise regularly (at least 150 minutes per week)\n"
                                         f"• Get 7-9 hours of sleep nightly\n"
                                         f"• Stay hydrated\n"
                                         f"• Manage stress through relaxation techniques\n"
                                         f"• Schedule regular check-ups with your doctor")
        
        return []

class ActionMedicationHelp(Action):
    def name(self) -> Text:
        return "action_medication_help"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        
        medication_name = tracker.get_slot("medication_name")
        
        dispatcher.utter_message(text="I can help with medication-related questions! However, for specific medical advice about medications, please consult your healthcare provider or pharmacist.\n\n"
                                     f"For general medication management:\n"
                                     f"• Take medications as prescribed\n"
                                     f"• Set up reminders to avoid missing doses\n"
                                     f"• Keep a medication list updated\n"
                                     f"• Store medications properly\n"
                                     f"• Report side effects to your doctor")
        
        return []
