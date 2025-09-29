const allowedOrigins = ['http://localhost:5173', 'http://localhost:5174'];
export const corsOptions = {
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true, // Required for cookies & auth headers
  optionsSuccessStatus: 200
};
