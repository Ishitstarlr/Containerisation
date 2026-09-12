import { PrismaClient } from '@prisma/client';

const dbUrl = encodeURI(process.env.DATABASE_URL);
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: dbUrl
    }
  },
  // Add log level for debugging
  log: ['query', 'info', 'warn', 'error']
});

// Alternative connection method with retry logic
async function connectWithRetry(maxRetries = 5, delay = 5000) {
  let retries = 0;
  
  while (retries < maxRetries) {
    try {
      await prisma.$connect();
      console.log('Database connected successfully');
      return;
    } catch (error) {
      retries++;
      console.error(`Database connection attempt ${retries} failed:`, error);
      
      if (retries >= maxRetries) {
        console.error('Max retries reached. Exiting...');
        process.exit(1);
      }
      
      console.log(`Retrying in ${delay/1000} seconds...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

// Connect with retry logic
connectWithRetry().catch(error => {
  console.error('Failed to connect to database after multiple attempts:', error);
  process.exit(1);
});

// Handle graceful shutdown
process.on('beforeExit', async () => {
  console.log('Disconnecting from database...');
  await prisma.$disconnect();
});

export default prisma; 