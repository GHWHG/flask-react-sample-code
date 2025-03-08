// App.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [topics, setTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState('');
  const [textContent, setTextContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Uses the useEffect hook to run the fetchTopics function when the component mounts
  // Empty dependency array [] ensures it only runs once
  useEffect(() => {
    fetchTopics();
  }, []);

  const fetchTopics = async () => { // Defines the async function to fetch PubSub topics
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/pubsub/topics'); //Makes a GET request to the Flask backend endpoint
      setTopics(response.data.topics); // Sets the topics state with the response data
      setLoading(false);
    } catch (err) {
      console.error('Error fetching topics:', err);
      setError('Failed to load PubSub topics. Please check your GCP credentials.');
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => { // executed when Submit to GitHub button is clicked
    e.preventDefault(); // Prevents the default form submission behavior

    if (!selectedTopic) {
      setError('Please select a PubSub topic');
      return;
    }

    if (!textContent.trim()) {
      setError('Please enter some content');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setMessage('');

      // This is where the upload_to_github function gets called
      const response = await axios.post('http://localhost:5000/api/github/upload', { // make API call to backend
        selectedTopic,
        textContent,
        timestamp: new Date().toISOString() //Sends the selected topic, text content, and current timestamp in JSON
      });

      if (response.data.success) { //Checks if the upload was successful based on the response, success is a variable returned from backend
        setMessage('Data successfully uploaded to GitHub!');
        setTextContent(''); // Clear the form
      } else {
        setError('Failed to upload data to GitHub');
      }

      setLoading(false);
    } catch (err) {
      console.error('Error uploading to GitHub:', err);
      setError(err.response?.data?.message || 'Failed to upload data to GitHub');
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>PubSub to GitHub Uploader</h1> // create header
      </header>
      <main className="App-main">
        <form onSubmit={handleSubmit} className="upload-form"> // create form and Sets form's submit handler to the handleSubmit function
          <div className="form-group">
            <label htmlFor="topic-select">Select PubSub Topic:</label>
            <select
              id="topic-select"
              value={selectedTopic} // Binds the value to the selectedTopic state
              onChange={(e) => setSelectedTopic(e.target.value)}
              disabled={loading || topics.length === 0} //Disables the dropdown when loading or when no topics are available
            >
              <option value="">-- Select a topic --</option>
              {topics.map((topic) => ( //Maps through the topics array to create option elements, topics is from backend
                <option key={topic.id} value={topic.id}>
                  {topic.name}
                </option>
              ))}
            </select>
            {topics.length === 0 && !loading && !error && (
              <p className="note">No topics available. Please check your GCP project.</p> // Shows a note if no topics are available
            )}
          </div>

          <div className="form-group">
            <label htmlFor="content-textarea">Content:</label>
            <textarea
              id="content-textarea"
              value={textContent}  // Binds its value to the textContent state
              onChange={(e) => setTextContent(e.target.value)}
              rows="10"
              placeholder="Enter your content here..."
              disabled={loading}
            />
          </div>

          {error && <div className="error-message">{error}</div>}
          {message && <div className="success-message">{message}</div>}

          <button
            type="submit"
            className="submit-button"
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Submit to GitHub'}
          </button>
        </form>
      </main>
    </div>
  );
}

export default App;
