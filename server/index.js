// server/index.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const feedbackSchema = new mongoose.Schema({
  category: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  feedback: { type: String, required: true },
  improvement: String,
  email: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});
const Feedback = mongoose.model('Feedback', feedbackSchema);

// Configure nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

app.post('/api/feedback', async (req, res) => {
  try {
    const { category, rating, feedback, improvement, email } = req.body;
    
    // Validate required fields
    if (!category || !rating || !feedback || !email) {
      return res.status(400).json({
        success: false,
        error: 'Please fill in all required fields',
        missingFields: {
          category: !category,
          rating: !rating,
          feedback: !feedback,
          email: !email
        }
      });
    }

    // Create and save feedback
    const fb = new Feedback({
      category,
      rating: Number(rating),
      feedback,
      improvement,
      email
    });

    console.log('Saving feedback:', fb);
    await fb.save();

    // Send confirmation email to user
    const userMailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Thank You for Your Feedback',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <h2 style="color: #4B2CA0;">Thank You for Your Feedback!</h2>
          <p>We appreciate you taking the time to share your thoughts with us.</p>
          <div style="background-color: #fff; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #6B3FCF;">Your Feedback Details:</h3>
            <p><strong>Category:</strong> ${category}</p>
            <p><strong>Rating:</strong> ${rating}/5</p>
            <p><strong>Feedback:</strong> ${feedback}</p>
            ${improvement ? `<p><strong>Suggestions for Improvement:</strong> ${improvement}</p>` : ''}
          </div>
          <p>We value your input and will use it to improve our services.</p>
          <p style="color: #666; font-size: 0.9em;">This is an automated message, please do not reply.</p>
        </div>
      `
    };

    // Send notification email to admin
    const adminMailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER, // Send to admin email
      subject: 'New Feedback Received',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <h2 style="color: #4B2CA0;">New Feedback Received</h2>
          <div style="background-color: #fff; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #6B3FCF;">Feedback Details:</h3>
            <p><strong>From:</strong> ${email}</p>
            <p><strong>Category:</strong> ${category}</p>
            <p><strong>Rating:</strong> ${rating}/5</p>
            <p><strong>Feedback:</strong> ${feedback}</p>
            ${improvement ? `<p><strong>Suggestions for Improvement:</strong> ${improvement}</p>` : ''}
            <p><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
          </div>
        </div>
      `
    };

    // Send both emails
    await transporter.sendMail(userMailOptions);
    await transporter.sendMail(adminMailOptions);

    res.status(201).json({ success: true, message: 'Feedback saved and confirmation emails sent!' });
  } catch (error) {
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      validationErrors: error.errors
    });
    
    res.status(500).json({
      success: false,
      error: error.message,
      validationErrors: error.errors ? Object.keys(error.errors).map(key => ({
        field: key,
        message: error.errors[key].message
      })) : null
    });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
