# VHSA Form Backend API

A Node.js + Express backend API for school health screening system, replacing n8n workflows with Supabase integration.

## Setup Instructions

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Environment Configuration
Copy the environment template and fill in your Supabase credentials:
```bash
cp env-template.txt .env
```

Edit `.env` file with your actual values:
```
SUPABASE_URL=your_supabase_url_here
SUPABASE_ANON_KEY=your_supabase_anon_key_here
PORT=3000
```

### 3. Database Setup
Ensure your Supabase database has the following tables:

#### Students Table
```sql
CREATE TABLE students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  unique_id text UNIQUE NOT NULL,
  first_name text,
  last_name text,
  grade text,
  gender text,
  school text,
  teacher text,
  dob date,
  status text,
  created_at timestamptz DEFAULT now()
);
```

#### Screening Results Table
```sql
CREATE TABLE screening_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES students(id),
  school text,
  screening_year integer,
  screening_event_date date,
  absent boolean,
  notes text,
  vision_day1_screener text,
  vision_day1_result text,
  vision_day1_right_eye text,
  vision_day1_left_eye text,
  hearing_day1_screener text,
  hearing_day1_result text,
  hearing_day1_right_1000 text,
  hearing_day1_right_2000 text,
  hearing_day1_right_4000 text,
  hearing_day1_left_1000 text,
  hearing_day1_left_2000 text,
  hearing_day1_left_4000 text,
  acanthosis_day1_screener text,
  acanthosis_day1_result text,
  scoliosis_day1_screener text,
  scoliosis_day1_result text,
  -- Day 2 fields (similar pattern)
  vision_day2_screener text,
  vision_day2_result text,
  vision_day2_right_eye text,
  vision_day2_left_eye text,
  hearing_day2_screener text,
  hearing_day2_result text,
  hearing_day2_right_1000 text,
  hearing_day2_right_2000 text,
  hearing_day2_right_4000 text,
  hearing_day2_left_1000 text,
  hearing_day2_left_2000 text,
  hearing_day2_left_4000 text,
  acanthosis_day2_screener text,
  acanthosis_day2_result text,
  scoliosis_day2_screener text,
  scoliosis_day2_result text,
  created_at timestamptz DEFAULT now()
);
```

#### Schools Table
```sql
CREATE TABLE schools (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);
```

### 4. Run the Server
```bash
npm start
```

For development with auto-restart:
```bash
npm run dev
```

## API Endpoints

### Students
- `GET /api/students/:uniqueId` - Search student by unique ID
- `POST /api/students/quick-add` - Create new student
- `GET /api/students` - Get all students with completion status

### Screenings
- `POST /api/screenings` - Submit screening results
- `GET /api/screenings/:studentId` - Get screenings for student
- `GET /api/screenings` - Get all screenings (admin)

### Schools
- `GET /api/schools` - Get all schools
- `POST /api/schools` - Create new school
- `PUT /api/schools/:id` - Update school
- `DELETE /api/schools/:id` - Deactivate school

### Health Check
- `GET /health` - Server health status

## Screening Requirements Logic

The system automatically calculates required screenings based on:
- Grade level
- Gender
- Student status (new/returning)
- Date of birth (for age cutoffs)

See `utils/screening-rules.js` for detailed logic.

## Deployment

### Vercel
1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel`
3. Set environment variables in Vercel dashboard

### Railway
1. Connect your GitHub repository
2. Set environment variables in Railway dashboard
3. Deploy automatically

## Error Handling

The API includes comprehensive error handling:
- Input validation
- Database error handling
- Graceful error responses
- Request logging

## CORS Configuration

CORS is enabled for frontend access. Configure `FRONTEND_URL` in environment variables for production.
