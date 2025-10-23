# VHSA Form - Netlify Deployment Guide

## 🚀 Quick Deploy to Netlify

### 1. Connect to Netlify

1. Go to [netlify.com](https://netlify.com) and sign in
2. Click "New site from Git"
3. Connect your GitHub repository
4. Configure build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend`
   - **Node version**: `18`

### 2. Set Environment Variables

In your Netlify site dashboard, go to Site settings > Environment variables and add:

```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### 3. Deploy

Click "Deploy site" and Netlify will:
- Install dependencies
- Build your frontend
- Deploy your serverless functions
- Set up API routing

## 📁 Project Structure for Netlify

```
VHSA-Form/
├── netlify/
│   └── functions/
│       ├── api.js              # Main serverless function
│       ├── routes/             # API route handlers
│       ├── utils/              # Utility functions
│       └── package.json        # Function dependencies
├── frontend/
│   └── index.html             # Frontend application
├── netlify.toml               # Netlify configuration
├── package.json               # Root package.json
└── README.md
```

## 🔧 Configuration Files

### netlify.toml
- Configures build settings and redirects
- Routes API calls to serverless functions
- Sets up SPA routing

### Environment Variables Required
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_ANON_KEY`: Your Supabase anonymous key

## 🌐 API Endpoints

Once deployed, your API will be available at:
- `https://your-site.netlify.app/api/students`
- `https://your-site.netlify.app/api/screenings`
- `https://your-site.netlify.app/api/schools`

## 🛠️ Local Development

For local development, you can still run the traditional backend:

```bash
cd backend
npm install
npm start
```

The frontend will automatically detect if it's running locally and use the local API.

## 📝 Notes

- The application uses serverless functions instead of a traditional backend
- All API routes are handled by Netlify Functions
- The frontend automatically detects the environment and uses the correct API URL
- Database connections are handled through Supabase

## 🔍 Troubleshooting

### Common Issues:

1. **Functions not working**: Check environment variables are set correctly
2. **API calls failing**: Verify Supabase credentials and database setup
3. **Build failures**: Ensure all dependencies are in package.json

### Debug Steps:

1. Check Netlify function logs in the dashboard
2. Verify environment variables are set
3. Test API endpoints directly
4. Check browser console for errors
