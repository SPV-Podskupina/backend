require('dotenv').config();

const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mongoose = require('mongoose');



// Connect to MongoDB
mongoose.connect(process.env.DB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/userRoutes');
const cosmeticRoutes = require('./routes/cosmeticRoutes');
const gameRoutes = require('./routes/gameRoutes')
const { swaggerUi, specs } = require('./swagger');

const app = express();

// Middleware
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/', indexRouter);
app.use('/user', usersRouter);
app.use('/cosmetic', cosmeticRoutes);
app.use('/game', gameRoutes)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
  customCss: '.swagger-ui .topbar { display: none }',
  customJs: '/swagger-ui/custom.js'
}, function (req, res, next) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
}));
// Profile Pictures
app.use('/profile_pictures', express.static('resources/profile_pictures'));


// 404 handler
app.use(function (req, res, next) {
  next(createError(404));
});

// Global error handler
app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);
  res.json(err);
});



module.exports = app;
