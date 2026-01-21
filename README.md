# SkillSpot - Visual Resume & Career Mapper

A comprehensive full-stack web application for creating professional visual resumes, tracking skill progression with certificates, and mapping career development with interactive visualizations.

## 🚀 Features

### Core Functionality
- **Enhanced Interactive Skill Graphs**: Beautiful D3.js visualizations with gradient areas and certificate indicators
- **Certificates & Credentials Management**: Add, track, and display professional certifications for each skill
- **Project Timeline**: Showcase projects with a beautiful timeline interface
- **Job Matching**: Match your skills with job requirements
- **Professional Resume Export**: Generate high-quality PDF resumes with certificates and enhanced visuals
- **Public Portfolio**: Share your professional profile publicly
- **Comparison Dashboard**: Compare your skills vs job requirements

### User Management
- **Authentication**: Secure JWT-based user authentication
- **User Profiles**: Personalize your career profile
- **Protected Routes**: Secure access to personal data

### Data Management
- **CRUD Operations**: Full Create, Read, Update, Delete for skills, projects, and certificates
- **Real-time Updates**: Live data synchronization with automatic refresh
- **Data Validation**: Comprehensive input validation and sanitization
- **Error Handling**: User-friendly error messages and loading states
- **Certificate Tracking**: Complete certificate lifecycle management

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern React with hooks
- **Tailwind CSS** - Utility-first CSS framework
- **D3.js** - Data visualization library
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Lucide React** - Beautiful icons
- **React-to-Print** - PDF generation

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - JSON Web Tokens for authentication
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin resource sharing

### Development Tools
- **Jest** - Testing framework
- **Nodemon** - Development server
- **ESLint** - Code linting
- **GitHub Actions** - CI/CD Pipeline

## 📦 Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- Git

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/skillplot.git
   cd skillplot
   ```

2. **Install dependencies**
   ```bash
   # Install backend dependencies
   cd server
   npm install
   
   # Install frontend dependencies
   cd ../client
   npm install
   ```

3. **Environment Configuration**
   
   Create `.env` file in the server directory:
   ```env
   MONGODB_URI=mongodb://localhost:27017/skillplot
   JWT_SECRET=your_jwt_secret_here
   PORT=5000
   NODE_ENV=development
   CLIENT_URL=http://localhost:3000
   ```

4. **Database Setup**
   ```bash
   # Run database cleanup script (if needed)
   cd server
   node scripts/cleanup-db.js
   ```

5. **Start the application**
   ```bash
   # Start backend server (from server directory)
   npm start
   
   # Start frontend (from client directory, in new terminal)
   cd client
   npm start
   ```

6. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000/api

## 🗂️ Project Structure

```
SkillSpot/
├── client/                 # React frontend
│   ├── public/            # Static files
│   ├── src/               # Source code
│   │   ├── components/    # Reusable components
│   │   │   ├── EnhancedSkillGraph.js  # Enhanced D3.js skill visualization
│   │   │   ├── ResumePDF.js           # Professional resume component
│   │   │   ├── SkillGraph.js          # Original skill graph
│   │   │   ├── ProjectTimeline.js     # Project timeline visualization
│   │   │   ├── JobMatchBoard.js       # Job matching interface
│   │   │   ├── ComparisonDashboard.js # Skills comparison
│   │   │   └── Layout.js              # Main layout component
│   │   ├── pages/         # Page components
│   │   │   ├── Skills.js              # Skills management with certificates
│   │   │   ├── ResumeExport.js        # Resume generation and export
│   │   │   ├── Dashboard.js           # Main dashboard
│   │   │   ├── Projects.js            # Project management
│   │   │   ├── JobMatches.js          # Job matching
│   │   │   ├── PublicPortfolio.js     # Public portfolio view
│   │   │   ├── Login.js               # Authentication
│   │   │   ├── Register.js            # User registration
│   │   │   └── Settings.js            # User settings
│   │   ├── context/       # React context
│   │   │   └── AuthContext.js         # Authentication state management
│   │   ├── utils/         # Utility functions
│   │   │   └── api.js                 # API communication
│   │   └── index.js       # App entry point
│   └── package.json
├── server/                # Node.js backend
│   ├── models/           # Mongoose models
│   │   ├── Skill.js                   # Skills with certificates schema
│   │   ├── Project.js                 # Projects schema
│   │   ├── Job.js                     # Job listings schema
│   │   └── User.js                    # User authentication schema
│   ├── routes/           # API routes
│   │   ├── skills.js                  # Skills and certificates CRUD
│   │   ├── projects.js                # Projects CRUD
│   │   ├── jobs.js                    # Job listings and matching
│   │   ├── users.js                   # User authentication
│   │   └── jooble.js                  # External job API integration
│   ├── middleware/       # Custom middleware
│   │   └── auth.js                    # JWT authentication middleware
│   ├── scripts/          # Database scripts
│   │   └── cleanup-db.js              # Database maintenance
│   └── server.js         # Server entry point
├── README.md
├── project_analysis.txt
└── package.json
```

## 🔧 API Endpoints

### Authentication
- `POST /api/users/register` - User registration
- `POST /api/users/login` - User login
- `GET /api/users/me` - Get current user

### Skills & Certificates
- `GET /api/skills` - Get user skills with certificates
- `POST /api/skills` - Add new skill with certificates
- `PUT /api/skills/:id` - Update skill and certificates
- `DELETE /api/skills/:id` - Delete skill
- `GET /api/skills/:userId` - Get public skills for portfolio

### Projects
- `GET /api/projects` - Get user projects
- `POST /api/projects` - Add new project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project
- `GET /api/projects/:userId` - Get public projects

### Jobs
- `GET /api/jobs` - Get job listings
- `POST /api/jobs` - Add job listing
- `GET /api/jobs/match` - Get job matches

## 🎨 Features Overview

### Dashboard
- Real-time statistics
- Quick action buttons
- Skill comparison charts
- Recent activity feed

### Skills Management
- Add/edit/delete skills with comprehensive forms
- Track proficiency over time with multiple entries
- Enhanced interactive skill graphs with gradient areas
- Certificate and credential management per skill
- Visual certificate indicators and badges
- Professional skill progression visualization

### Project Portfolio
- Project timeline visualization
- Add/edit/delete projects
- Tag-based categorization
- Project links and images

### Job Matching
- Skill-based job matching
- Match percentage calculation
- Job requirement comparison
- Skill gap analysis

### Resume Export
- High-quality PDF generation with professional formatting
- Enhanced Skills Progression graph with gradient areas
- Comprehensive certificate and credential display
- Skills summary with visual indicators
- Print-friendly design optimized for A4 format
- Real-time data refresh and synchronization
- Certificate count tracking and display

## 🔒 Security Features

- JWT authentication
- Password hashing with bcrypt
- Protected API routes
- Input validation and sanitization
- CORS configuration
- Rate limiting

## 🔄 CI/CD Pipeline

- **Continuous Integration**: Automated testing for both client and server on every push using GitHub Actions
- **Continuous Deployment**: Automated build and deployment pipeline ensures production is always up-to-date


## 🚀 Deployment

### Frontend Deployment (Vercel/Netlify)
1. Build the React app: `npm run build`
2. Deploy the `build` folder to your hosting platform

### Backend Deployment (Heroku/Railway)
1. Set environment variables
2. Deploy the server directory
3. Configure MongoDB connection

### Environment Variables for Production
```env
MONGODB_URI=your_production_mongodb_uri
JWT_SECRET=your_secure_jwt_secret
NODE_ENV=production
CLIENT_URL=your_frontend_url
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -am 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- D3.js for data visualization
- Tailwind CSS for styling
- React community for excellent documentation
- MongoDB for database solution


## 🆕 Recent Updates

### Certificate & Credentials Management
- **Complete Certificate System**: Add certificates with issuer, issue date, expiry date, credential ID, and verification URL
- **Visual Indicators**: Certificate badges and counts displayed throughout the application
- **Resume Integration**: Certificates automatically included in professional resume exports
- **Enhanced UI**: Comprehensive certificate management forms with validation

### Enhanced Skills Progression Graph
- **Gradient Areas**: Beautiful gradient fills under skill progression lines
- **Certificate Indicators**: Visual certificate counts in graph legend
- **Professional Styling**: Enhanced colors, shadows, and typography for resume export
- **Interactive Tooltips**: Detailed tooltips with certificate information
- **Resume Mode**: Optimized display for PDF generation and printing

### Improved User Experience
- **Responsive Design**: Mobile-first approach with collapsible sidebar
- **Real-time Data Refresh**: Automatic data synchronization between pages
- **Enhanced Forms**: Wider modals and better form layouts for certificate management
- **Visual Feedback**: Loading states, error handling, and success indicators
- **Professional Design**: Gradient backgrounds, shadows, and modern styling
- **Mobile Navigation**: Hamburger menu with smooth sidebar transitions

---

**SkillSpot** - Visualize your career journey with professional certificates and style! 🚀📜 
