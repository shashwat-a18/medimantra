const validateEnvironment = () => {
  const requiredEnvVars = [
    'JWT_SECRET',
    'NODE_ENV',
    'PORT'
  ];

  const optionalEnvVars = [
    'MONGODB_URI',
    'CORS_ORIGIN'
  ];

  const errors = [];
  const warnings = [];

  // Check required environment variables
  requiredEnvVars.forEach(varName => {
    if (!process.env[varName]) {
      errors.push(`Missing required environment variable: ${varName}`);
    }
  });

  // Check optional environment variables and provide info
  optionalEnvVars.forEach(varName => {
    if (!process.env[varName]) {
      warnings.push(`Optional environment variable not set: ${varName}`);
    }
  });

  // Special validation for JWT_SECRET
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.includes('your-super-secret')) {
    warnings.push('JWT_SECRET appears to be using default value. Please change it in production.');
  }

  // Special validation for NODE_ENV
  if (process.env.NODE_ENV === 'production' && !process.env.MONGODB_URI) {
    errors.push('MONGODB_URI is required when NODE_ENV is production');
  }

  if (process.env.NODE_ENV === 'production' && !process.env.CORS_ORIGIN) {
    warnings.push('CORS_ORIGIN should be set in production for security');
  }

  return { errors, warnings };
};

const logEnvironmentStatus = () => {
  const { errors, warnings } = validateEnvironment();

  console.log('\n🔧 Environment Configuration Status:');
  console.log(`   NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
  console.log(`   PORT: ${process.env.PORT || '5000'}`);
  console.log(`   MONGODB_URI: ${process.env.MONGODB_URI ? '✅ Set' : '❌ Not set'}`);
  console.log(`   JWT_SECRET: ${process.env.JWT_SECRET ? '✅ Set' : '❌ Not set'}`);
  console.log(`   CORS_ORIGIN: ${process.env.CORS_ORIGIN ? '✅ Set' : '❌ Not set'}`);

  if (warnings.length > 0) {
    console.log('\n⚠️  Environment Warnings:');
    warnings.forEach(warning => console.log(`   - ${warning}`));
  }

  if (errors.length > 0) {
    console.log('\n❌ Environment Errors:');
    errors.forEach(error => console.log(`   - ${error}`));
    console.log('\n🛑 Server cannot start due to environment configuration errors.');
    return false;
  }

  console.log('\n✅ Environment configuration is valid!\n');
  return true;
};

module.exports = {
  validateEnvironment,
  logEnvironmentStatus
};
