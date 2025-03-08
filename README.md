# flask-react-sample-code

Setup Instructions:

Backend Setup:

Create a new directory for your project
Set up a virtual environment for Python
Install the required dependencies: 
    pip install flask flask-cors google-cloud-pubsub requests
Set the required environment variables:
    export GITHUB_TOKEN="your_github_personal_access_token"
    export GITHUB_REPO_OWNER="your_github_username"
    export GITHUB_REPO_NAME="your_repository_name"
    export GCP_PROJECT_ID="your_gcp_project_id"

Frontend Setup:

Create a React app:
    npx create-react-app pubsub-github-uploader
    cd pubsub-github-uploader

Run the application:
Start the Flask backend:
    python flaskbackend.py
Start the React frontend:
    npm start

Key Features:

PubSub Topic Loading:

The React app fetches available PubSub topics from your GCP project
Topics are displayed in a dropdown menu


Form Submission:

Users can select a topic and enter text content
The form validates input before submission


GitHub Integration:

The Flask backend converts the data to JSON format
It uses the GitHub API to create a new file in your repository
Each submission creates a new file with a timestamp-based filename


Error Handling:

The app provides feedback for successful uploads and errors
It handles potential issues with GitHub API or PubSub connectivity




    
