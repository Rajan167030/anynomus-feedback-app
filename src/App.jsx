import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [formData, setFormData] = useState({
    category: '',
    rating: '5',
    feedback: '',
    improvement: '',
    email: ''
  });
  const [showScroll, setShowScroll] = useState(false);
  
  useEffect(() => {
    const checkScrollTop = () => {
      if (!showScroll && window.pageYOffset > 400) {
        setShowScroll(true);
      } else if (showScroll && window.pageYOffset <= 400) {
        setShowScroll(false);
      }
    };

    window.addEventListener('scroll', checkScrollTop);
    return () => window.removeEventListener('scroll', checkScrollTop);
  }, [showScroll]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate form data
    if (!formData.category) {
      setError('Please select a category');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('http://localhost:5000/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      
      if (data.success) {
        setSubmitted(true);
      } else {
        if (data.validationErrors) {
          const errorMessages = data.validationErrors
            .map(err => `${err.field}: ${err.message}`)
            .join('\n');
          setError(`Validation failed:\n${errorMessages}`);
        } else if (data.missingFields) {
          const missing = Object.entries(data.missingFields)
            .filter(([_, isMissing]) => isMissing)
            .map(([field]) => field)
            .join(', ');
          setError(`Please fill in these required fields: ${missing}`);
        } else {
          setError(data.error || 'Failed to save feedback');
        }
      }
    } catch (err) {
      console.error('Error submitting feedback:', err);
      setError('Server error: ' + (err.message || 'Unknown error'));
    }
    setLoading(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="form-container">
      <h1>Anonymous Feedback Form</h1>
      <p className="form-description">
        Your feedback helps us improve. All submissions are completely anonymous.
      </p>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="category">Category:</label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
            disabled={loading || submitted}
          >
        
            <option value="general">Close friend(jinke sath mai maximum time cllg rehta hoo)</option>
            <option value="bug">Friend(jinke saath baatchit chalti hai )</option>
            <option value="feature">known(joo mujhe sirf naam se jante hai)</option>
                      <option value="improvement">Suggestion for Improvement</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="email">Your Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            disabled={loading || submitted}
            placeholder="Enter your email for confirmation"
          />
        </div>

        <div className="form-group">
          <label htmlFor="rating">Rating:</label>
          <div className="rating-container">
            {[1, 2, 3, 4, 5].map((num) => (
              <label key={num} className="rating-label">
                <input
                  type="radio"
                  name="rating"
                  value={num}
                  checked={formData.rating === num.toString()}
                  onChange={handleChange}
                  disabled={loading || submitted}
                />
                {num}
              </label>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="feedback">Your Feedback:</label>
          <textarea
            id="feedback"
            name="feedback"
            value={formData.feedback}
            onChange={handleChange}
            required
            disabled={loading || submitted}
            rows={4}
            placeholder="Please share your thoughts..."
          />
        </div>

        <div className="form-group">
          <label htmlFor="improvement">Suggestions for Improvement:</label>
          <textarea
            id="improvement"
            name="improvement"
            value={formData.improvement}
            onChange={handleChange}
            disabled={loading || submitted}
            rows={3}
            placeholder="Any specific suggestions for improvement? (Optional)"
          />
        </div>

        <button 
          type="submit" 
          disabled={loading || submitted}
          className={loading ? 'loading' : ''}
        >
          {loading ? 'Submitting...' : 'Submit Feedback'}
        </button>
      </form>
      {error && <p className="error-message">{error}</p>}
      {submitted && (
        <div className="submitted-message">
          <h2>Thank you for your feedback!</h2>
          <p>Your anonymous feedback has been submitted successfully.</p>
        </div>
      )}
      {showScroll && (
        <button 
          className="scroll-to-top"
          onClick={scrollToTop}
          aria-label="Scroll to top"
        >
          ↑
        </button>
      )}
    </div>
  );
}

export default App
