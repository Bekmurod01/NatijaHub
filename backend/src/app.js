require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const errorHandler = require('./middlewares/errorHandler');
const cookieParser = require('cookie-parser');

const app = express();

// --- QA: Ensure users table exists in Supabase ---
const supabase = require('./config/supabaseClient');
async function ensureUsersTable() {
  try {
    const { error } = await supabase.from('users').select('*').limit(1);
    if (error && error.message.includes('does not exist')) {
      await supabase.rpc('execute_sql', {
        sql: `create table if not exists users (
          id uuid default gen_random_uuid() primary key,
          email text unique not null,
          password text not null,
          role text check (role in ('student', 'company', 'admin')) not null,
          created_at timestamp with time zone default now()
        );`
      });
      console.log('users table created');
    } else {
      console.log('users table exists');
    }
  } catch (e) {
    console.error('Error ensuring users table:', e);
  }
}
ensureUsersTable();

app.use(cors({
  origin: 'http://localhost:3000', // or your frontend URL
  credentials: true
}));
app.use(express.json());
app.use(helmet());
app.use(cookieParser());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/internships', require('./routes/internshipRoutes'));
app.use('/api/applications', require('./routes/applicationRoutes'));
app.use('/api/company', require('./routes/companyRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));

app.use(errorHandler);

module.exports = app;
