import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import departmentRouter from './routes/department.js';
import employeeRouter from './routes/employee.js';
import salaryRouter from './routes/salary.js';
import leaveRouter from './routes/leave.js';
import settingRouter from './routes/setting.js';
import connectToDatabase from './db/db.js';
import dashboardRouter from './routes/dashboard.js';
import { changePassword } from './controllers/settingController.js';

connectToDatabase();
const app = express();

// ✅ Allow only your frontend domain
app.use( cors( {
    origin: [
        //"https://employee-frontend-czml.vercel.app",
        "https://employee-frontend-tan.vercel.app"
    ],
    credentials: true
} ) );

app.use( express.json() );
app.use( express.static( 'public/' ) );

app.use( '/api/auth', authRoutes );
app.use( '/api/department', departmentRouter );
app.use( '/api/employee', employeeRouter );
app.use( '/api/salary', salaryRouter );
app.use( '/api/leave', leaveRouter );
app.use( '/api/setting', settingRouter );
app.use( '/api/dashboard', dashboardRouter );

// ✅ Define PORT before using it
const PORT = process.env.PORT || 5000;

app.listen( PORT, () => {
    console.log( `Server is Running on port ${PORT}` );
} );
