const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: [true, 'User ID is required'],
    index: true // Index for better query performance
  },
  title: {
    type: String,
    required: [true, 'Job title is required'],
    trim: true,
    maxlength: [100, 'Job title cannot exceed 100 characters']
  },
  company: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true,
    maxlength: [100, 'Company name cannot exceed 100 characters']
  },
  location: {
    type: String,
    trim: true,
    maxlength: [100, 'Location cannot exceed 100 characters']
  },
  salary: {
    type: String,
    trim: true,
    maxlength: [50, 'Salary cannot exceed 50 characters']
  },
  status: {
    type: String,
    required: [true, 'Status is required'],
    enum: {
      values: ['applied', 'interviewing', 'offer', 'rejected'],
      message: 'Status must be one of: applied, interviewing, offer, rejected'
    },
    default: 'applied'
  },
  appliedDate: {
    type: Date,
    required: [true, 'Applied date is required'],
    default: Date.now
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },
  jobUrl: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        if (!v) return true; // Allow empty values
        // Basic URL validation
        const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
        return urlPattern.test(v);
      },
      message: 'Please enter a valid URL'
    }
  }
}, {
  timestamps: true, // Automatically adds createdAt and updatedAt
  toJSON: { 
    virtuals: true,
    transform: function(doc, ret) {
      ret._id = ret._id.toString();
      return ret;
    }
  },
  toObject: { virtuals: true }
});

// Indexes for better query performance
jobSchema.index({ userId: 1, createdAt: -1 });
jobSchema.index({ userId: 1, status: 1 });
jobSchema.index({ userId: 1, company: 1 });

// Virtual for days since application
jobSchema.virtual('daysSinceApplied').get(function() {
  const now = new Date();
  const applied = new Date(this.appliedDate);
  const diffTime = Math.abs(now - applied);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Static method to get job statistics for a user
jobSchema.statics.getStatsByUser = async function(userId) {
  const stats = await this.aggregate([
    { $match: { userId: userId } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  // Initialize all statuses with 0
  const result = {
    total: 0,
    applied: 0,
    interviewing: 0,
    offers: 0,
    rejected: 0
  };

  // Map the aggregation results
  stats.forEach(stat => {
    result[stat._id] = stat.count;
    result.total += stat.count;
  });

  // Fix the 'offer' vs 'offers' naming
  result.offers = result.offer || 0;
  delete result.offer;

  return result;
};

// Instance method to update status with validation
jobSchema.methods.updateStatus = function(newStatus) {
  const validStatuses = ['applied', 'interviewing', 'offer', 'rejected'];
  if (!validStatuses.includes(newStatus)) {
    throw new Error(`Invalid status: ${newStatus}`);
  }
  this.status = newStatus;
  return this.save();
};

// Pre-save middleware for data cleaning
jobSchema.pre('save', function(next) {
  // Clean up empty strings
  if (this.location === '') this.location = undefined;
  if (this.salary === '') this.salary = undefined;
  if (this.notes === '') this.notes = undefined;
  if (this.jobUrl === '') this.jobUrl = undefined;
  
  next();
});

const Job = mongoose.model('Job', jobSchema);

module.exports = Job;
