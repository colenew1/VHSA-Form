# VHSA Form - School Health Screening System

A comprehensive Node.js + Express backend API and HTML frontend for school health screening management, replacing n8n workflows with a modern, scalable solution.

## 🏥 Overview

This system manages school health screenings including:
- **Vision Screening** - Eye acuity testing with dropdown selections
- **Hearing Screening** - Frequency testing with conditional logic
- **Acanthosis Nigricans Screening** - Diabetes risk assessment
- **Scoliosis Screening** - Spinal curvature detection

## 🚀 Features

### Frontend Features
- **Responsive Design** - Clean, modern interface with collapsible sections
- **Dynamic School Selection** - Dropdown populated from backend API
- **Smart Form Logic** - Conditional fields based on screening results
- **Tab-based Interface** - Initial Screening and Rescreen tabs
- **Real-time Validation** - Client-side validation with error handling
- **Student Search** - Quick student lookup by unique ID

### Backend Features
- **RESTful API** - Clean, documented endpoints
- **Supabase Integration** - PostgreSQL database with real-time capabilities
- **Screening Rules Engine** - Automated determination of required screenings
- **Input Validation** - Server-side validation and sanitization
- **Error Handling** - Comprehensive error responses with proper HTTP status codes
- **CORS Support** - Cross-origin resource sharing enabled

## 🛠️ Tech Stack

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **Supabase** - PostgreSQL database with real-time features
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment variable management

### Frontend
- **HTML5** - Semantic markup
- **CSS3** - Modern styling with animations
- **Vanilla JavaScript** - No framework dependencies
- **Responsive Design** - Mobile-friendly interface

## 📁 Project Structure

```
VHSA-Form/
├── backend/
│   ├── routes/
│   │   ├── students.js      # Student management endpoints
│   │   ├── screenings.js   # Screening submission endpoints
│   │   └── schools.js       # School data endpoints
│   ├── utils/
│   │   ├── supabase.js      # Database connection
│   │   └── screening-rules.js # Business logic for screening requirements
│   ├── server.js           # Main server file
│   ├── package.json        # Backend dependencies
│   └── .env               # Environment variables (not in repo)
├── frontend/
│   └── index.html         # Main frontend application
├── .gitignore            # Git ignore rules
└── README.md            # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Supabase account and project

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env` file in the `backend` directory:
   ```env
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   PORT=3000
   ```

4. **Start the server:**
   ```bash
   npm start
   ```

### Frontend Setup

1. **Serve the frontend:**
   ```bash
   npx http-server frontend -p 8080
   ```

2. **Access the application:**
   Open your browser to `http://localhost:8080`

## 📊 API Endpoints

### Students
- `GET /api/students/:uniqueId` - Get student by unique ID
- `GET /api/students` - Get all students with completion status
- `POST /api/students/quick-add` - Add new student

### Screenings
- `POST /api/screenings` - Submit screening results

### Schools
- `GET /api/schools` - Get all schools

### Health Check
- `GET /health` - Server health status

## 🎯 Screening Logic

The system automatically determines required screenings based on:
- **Grade Level** - Different grades have different requirements
- **Gender** - Some screenings are gender-specific
- **Student Status** - New vs. returning students
- **Date of Birth** - Age-based requirements

### Screening Requirements by Grade:
- **Pre-K (3)**: Vision + Hearing
- **Pre-K (4)**: Vision + Hearing
- **Kindergarten**: Vision + Hearing
- **1st Grade**: Vision + Hearing
- **2nd Grade**: Vision + Hearing
- **3rd Grade**: Vision + Hearing
- **4th Grade**: Vision + Hearing
- **5th Grade**: Vision + Hearing + Acanthosis + Scoliosis
- **6th Grade**: Vision + Hearing + Acanthosis + Scoliosis
- **7th Grade**: Vision + Hearing + Acanthosis + Scoliosis

## 🎨 Frontend Features

### Collapsible Sections
- All screening sections are visible but collapsed by default
- Click section headers to expand and see tabs + form content
- Smooth animations with proper arrow indicators (▶ when collapsed, ▼ when expanded)

### Smart Form Logic
- **Vision**: Dropdown selections with auto-fill on "Pass"
- **Hearing**: Conditional frequency checkboxes on "Fail"
- **Dynamic Validation**: Only validates open sections
- **Smart Submission**: Only submits data from open sections

### User Experience
- **Clean Interface**: Minimal, organized design
- **Responsive**: Works on desktop and mobile
- **Intuitive**: Clear visual feedback and smooth interactions

## 🔧 Development

### Running in Development Mode

1. **Start backend:**
   ```bash
   cd backend
   npm start
   ```

2. **Start frontend:**
   ```bash
   npx http-server frontend -p 8080
   ```

3. **Access application:**
   - Frontend: `http://localhost:8080`
   - Backend API: `http://localhost:3000`

### Environment Variables

Create a `.env` file in the `backend` directory:
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
PORT=3000
```

## 📝 Database Schema

### Students Table
- `id` (UUID, Primary Key)
- `uniqueId` (String, Unique)
- `firstName` (String)
- `lastName` (String)
- `grade` (String)
- `gender` (String)
- `school` (String)
- `teacher` (String)
- `dob` (Date)
- `status` (String: "New" | "Returning")
- `createdAt` (Timestamp)

### Schools Table
- `id` (UUID, Primary Key)
- `name` (String)
- `createdAt` (Timestamp)

### Screenings Table
- `id` (UUID, Primary Key)
- `studentId` (UUID, Foreign Key)
- `screenerName` (String)
- `screeningDate` (Date)
- `vision` (JSONB)
- `hearing` (JSONB)
- `acanthosis` (JSONB)
- `scoliosis` (JSONB)
- `additionalNotes` (Text)
- `createdAt` (Timestamp)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Check the API documentation in `/backend/README.md`

## 🔄 Migration from n8n

This system replaces n8n workflows with:
- **Better Performance** - Direct database connections
- **Improved Reliability** - No external service dependencies
- **Enhanced Security** - Server-side validation and sanitization
- **Better Maintainability** - Clean, documented codebase
- **Scalability** - Built for growth and expansion

---

**Built with ❤️ for school health screening management**
