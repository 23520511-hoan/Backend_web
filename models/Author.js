// models/Author.js
const authorSchema = new mongoose.Schema({
    name: {
      type: String,
      required: [true, 'Please provide an author name'],
      trim: true,
      maxlength: [100, 'Author name cannot be more than 100 characters']
    },
    biography: {
      type: String,
      maxlength: [2000, 'Biography cannot be more than 2000 characters']
    },
    dateOfBirth: {
      type: Date
    },
    nationality: {
      type: String
    },
    avatar: {
      type: String,
      default: 'default-author.jpg'
    },
    website: {
      type: String
    },
    socialMedia: {
      facebook: String,
      twitter: String,
      instagram: String
    },
    isActive: {
      type: Boolean,
      default: true
    }
  }, {
    timestamps: true
  });
  
  module.exports = mongoose.model('Author', authorSchema);