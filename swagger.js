const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'SPV-Casino backend API',
      version: '1.0.0',
      description: 'API developed for SPV project',
    },
    servers: [
      {
        url: 'http://84.52.181.142:3000', // Replace with your production API base URL
        description: 'Production server',
      },
      {
        url: 'http://localhost:3000',
        description: 'Local'
      }
    ],
    components: {  // <- Moved inside definition
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      responses: {
        UnauthorizedMissingToken: {
          description: 'Missing JWT token',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  message: { type: 'string', example: 'Missing JWT token' },
                },
              },
            },
          },
        },
        UnauthorizedInvalidToken: {
          description: 'Invalid JWT token',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  message: { type: 'string', example: 'Invalid JWT token' },
                },
              },
            },
          },
        },
        ForbiddenRevokedToken: {
          description: 'Token has been revoked',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  message: { type: 'string', example: 'Token has been revoked' },
                },
              },
            },
          },
        },
      },
    },
  },
  apis: ['./routes/*.js', './controllers/*.js', './models/*.js'],
};

const specs = swaggerJsdoc(options);

module.exports = {
  swaggerUi,
  specs
};