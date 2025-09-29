import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import type { Express } from 'express';


import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import type { Request, Response, NextFunction } from 'express-serve-static-core';

// Emulate __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename)

export default function setupSwagger(app: Express) {
  const docsPath = join(__dirname, '../docs/swagger.yaml');

 // const swaggerDocument = YAML.load(join(__dirname, '../docs/swagger.yaml'));

  if (process.env.NODE_ENV === 'DEVELOPMENT') {
    // Load YAML on every request
    app.use('/api/api-docs', swaggerUi.serve, (req:Request, res:Response, next:NextFunction) => {
      const swaggerDocument = YAML.load(docsPath);
      res.setHeader('Cache-Control', 'no-store');
      swaggerUi.setup(swaggerDocument)(req, res, next);
    });
  } else {
    // Load YAML once at startup
    const swaggerDocument = YAML.load(docsPath);
    app.use('/api/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
  }

  //app.use('/api/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

}
