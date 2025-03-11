from flask import Flask, request, jsonify
import random

app = Flask(__name__)

responses = {
    "stress": ["Try deep breathing exercises!", "Consider talking to a counselor."],
    "anxiety": ["Meditation can help reduce anxiety.", "Would you like some relaxation techniques?"]
}

@app.route('/chatbot', methods=['POST'])
def chatbot():
    data = request.json
    user_message = data.get("message", "").lower()
    for key in responses:
        if key in user_message:
            return jsonify({"response": random.choice(responses[key])})
    return jsonify({"response": "I'm here to help. Please tell me more."})

if __name__ == "__main__":
   app.run(host="0.0.0.0", port=5000, debug=True)

