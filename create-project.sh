#!/bin/bash
set -e

echo "Creating Hygienix v2 Project..."

# Backend package.json
cat > backend/package.json << 'EOF'
{
  "name": "hygienix-backend",
  "version": "2.0.0",
  "description": "Hygienix v2 - Pest Control Management System",
  "main": "src/server.js",
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js"
  },
  "dependencies": {
    "@prisma/client": "^5.10.0",
    "bcryptjs": "^2.4.3",
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "express": "^4.18.3",
    "express-validator": "^7.0.1",
    "jsonwebtoken": "^9.0.2",
    "multer": "^1.4.5-lts.1",
    "pdfkit": "^0.14.0"
  },
  "engines": { "node": ">=18.0.0" }
}
EOF

# Railway config
cat > backend/railway.json << 'EOF'
{
  "deploy": {
    "startCommand": "npx prisma migrate deploy && npm start",
    "healthcheckPath": "/api/health"
  }
}
EOF

# Environment template
cat > backend/.env.example << 'EOF'
DATABASE_URL="file:./dev.db"
JWT_SECRET=your-secret-key
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://hygienixprivate.up.railway.app
EOF

echo "Created backend config files"
