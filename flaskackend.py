from flask import Flask, request, jsonify
import os
import json
import requests
from google.cloud import pubsub_v1
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Configure GitHub credentials
GITHUB_TOKEN = os.environ.get('GITHUB_TOKEN')
GITHUB_REPO_OWNER = os.environ.get('GITHUB_REPO_OWNER')
GITHUB_REPO_NAME = os.environ.get('GITHUB_REPO_NAME')

# Configure GCP credentials
GCP_PROJECT_ID = os.environ.get('GCP_PROJECT_ID')


@app.route('/api/pubsub/topics', methods=['GET'])
def get_pubsub_topics():
    """Get all available PubSub topics in the GCP project."""
    try:
        # Initialize the PubSub client
        publisher = pubsub_v1.PublisherClient()
        project_path = f"projects/{GCP_PROJECT_ID}"

        # List all topics
        topics = publisher.list_topics(request={"project": project_path})

        # KEY:Format the topics for the frontend ******************************** KEY:How to return value to frontend
        topic_list = []
        for topic in topics:
            # Extract the topic name from the full path
            topic_name = topic.name.split('/')[-1]
            topic_list.append({
                "id": topic.name,
                "name": topic_name
            })

        return jsonify({"topics": topic_list})  # KEY:return to front end ********************************

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/github/upload', methods=['POST'])
def upload_to_github(): #
    """Upload JSON data to GitHub repository."""
    try:
        data = request.json # KEY: Extracts the JSON data from the HTTP request ********** extract JSON http data
        selected_topic = data.get('selectedTopic')
        text_content = data.get('textContent')

        # Create the JSON payload
        payload = {
            "pubsub_topic": selected_topic,
            "content": text_content,
            "timestamp": data.get('timestamp')
        }

        # Convert to JSON string
        json_content = json.dumps(payload, indent=2)

        # Create a filename based on timestamp
        filename = f"data_{data.get('timestamp').replace(':', '-').replace('.', '-')}.json"

        # GitHub API endpoint to create a file
        url = f"https://api.github.com/repos/{GITHUB_REPO_OWNER}/{GITHUB_REPO_NAME}/contents/{filename}"

        # GitHub API request headers
        headers = {
            "Authorization": f"token {GITHUB_TOKEN}",
            "Accept": "application/vnd.github.v3+json"
        }

        # GitHub API request body
        github_payload = {
            "message": f"Add data for {selected_topic}",
            "content": json_content.encode('utf-8').hex(),
            "branch": "main"  # or your target branch
        }

        # Send the request to GitHub
        response = requests.put(url, headers=headers, json=github_payload)

        if response.status_code in [201, 200]:
            return jsonify({"success": True, "message": "Data uploaded to GitHub successfully"})
        else:
            return jsonify({"success": False, "message": f"GitHub API Error: {response.json()}"}), 400

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True)
