export const swaggerDocs = {
  openapi: '3.0.0',
  info: {
    title: 'SystemTwo API Documentation',
    version: '1.0.0',
    description: 'API documentation for the SystemTwo application',
  },
  servers: [
    {
      url: 'http://localhost:3000/api',
      description: 'Development server',
    },
  ],
  security: [
    {
      BearerAuth: []
    }
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      User: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          username: { type: 'string' },
          email: { type: 'string', format: 'email' },
          role: { type: 'string', format: 'ObjectId', description: 'Reference to Role schema' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      Role: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          name: { type: 'string', enum: ['Admin', 'Editor', 'Viewer'] },
          permissions: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                resource: { type: 'string' },
                actions: {
                  type: 'array',
                  items: { type: 'string', enum: ['create', 'read', 'update', 'delete'] },
                },
              },
            },
          },
        },
      },
      Page: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          title: { type: 'string' },
          content: { type: 'string' },
          slug: { type: 'string' },
          permissions: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                role: { type: 'string', format: 'ObjectId', description: 'Reference to Role schema' },
                actions: {
                  type: 'array',
                  items: { type: 'string', enum: ['read', 'update', 'delete'] },
                },
              },
            },
          },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      PageElement: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          page: { type: 'string', format: 'ObjectId', description: 'Reference to Page schema' },
          type: { type: 'string', enum: ['text', 'image', 'video', 'link'] }, 
          content: { type: 'string' },
          position: { type: 'number' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      Menu: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          name: { type: 'string' },
          items: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                label: { type: 'string' },
                url: { type: 'string' },
                roles: {
                  type: 'array',
                  items: { type: 'string', format: 'ObjectId', description: 'Reference to Role schema' },
                },
              },
            },
          },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      AuthResponse: {
        type: 'object',
        properties: {
          token: { type: 'string' },
          refreshToken: { type: 'string' },
          user: { $ref: '#/components/schemas/User' },
        },
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          message: { type: 'string' },
          errors: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                field: { type: 'string' },
                message: { type: 'string' },
              },
            },
          },
        },
      },
    },
  },
  paths: {
    '/auth/signup': {
      post: {
        tags: ['Authentication'],
        security: [], 
        summary: 'Register a new user',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['username', 'email', 'password'],
                properties: {
                  username: { type: 'string', example: 'johndoe' },
                  email: { type: 'string', format: 'email', example: 'john@example.com' },
                  password: { type: 'string', format: 'password', example: 'Password123!' },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'User created successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AuthResponse' },
              },
            },
          },
          400: {
            description: 'Validation error',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/auth/login': {
      post: {
        tags: ['Authentication'],
        security: [], 
        summary: 'Log in a user',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email', example: 'john@example.com' },
                  password: { type: 'string', format: 'password', example: 'Password123!' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'User logged in successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AuthResponse' },
              },
            },
          },
          401: {
            description: 'Invalid credentials',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/auth/refresh-token': {
      post: {
        tags: ['Authentication'],
        security: [{ BearerAuth: [] }],
        summary: 'Refresh access token',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['refreshToken'],
                properties: {
                  refreshToken: { type: 'string' }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Token refreshed successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AuthResponse' }
              }
            }
          },
          401: {
            description: 'Invalid refresh token',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' }
              }
            }
          }
        }
      }
    },
    '/users/{id}': {
      get: {
        tags: ['Users'],        
        summary: 'Get user by ID',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
        ],
        responses: {
          200: { description: 'User found', content: { 'application/json': { schema: { $ref: '#/components/schemas/User' } } } },
          404: { description: 'User not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
        }
      },
      put: {
        tags: ['Users'],
        summary: 'Update user by ID',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/User' }
            }
          }
        },
        responses: {
          200: { description: 'User updated', content: { 'application/json': { schema: { $ref: '#/components/schemas/User' } } } },
          400: { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
        }
      },
      delete: {
        tags: ['Users'],
        summary: 'Delete user by ID',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
        ],
        responses: {
          204: { description: 'User deleted' },
          404: { description: 'User not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
        }
      }
    },
    '/roles': {
      get: {
        tags: ['Roles'],
        summary: 'Get all roles',
        security: [{ BearerAuth: [] }],
        responses: {
          200: { description: 'List of roles', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Role' } } } } }
        }
      },
      post: {
        tags: ['Roles'],
        summary: 'Create a new role',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Role' }
            }
          }
        },
        responses: {
          201: { description: 'Role created', content: { 'application/json': { schema: { $ref: '#/components/schemas/Role' } } } },
          400: { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
        }
      }
    },
    '/roles/{id}': {
      get: {
        tags: ['Roles'],
        summary: 'Get role by ID',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
        ],
        responses: {
          200: { description: 'Role found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Role' } } } },
          404: { description: 'Role not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
        }
      },
      put: {
        tags: ['Roles'],
        summary: 'Update role by ID',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Role' }
            }
          }
        },
        responses: {
          200: { description: 'Role updated', content: { 'application/json': { schema: { $ref: '#/components/schemas/Role' } } } },
          400: { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
        }
      },
      delete: {
        tags: ['Roles'],
        summary: 'Delete role by ID',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
        ],
        responses: {
          204: { description: 'Role deleted' },
          404: { description: 'Role not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
        }
      }
    },
    '/menus': {
      get: {
        tags: ['Menus'],
        summary: 'Get all menus (filtered by role)',
        security: [{ BearerAuth: [] }],
        responses: {
          200: { description: 'List of menus', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Menu' } } } } }
        }
      },
      post: {
        tags: ['Menus'],
        summary: 'Create menu (Admin only)',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/Menu' } } }
        },
        responses: {
          201: { description: 'Menu created', content: { 'application/json': { schema: { $ref: '#/components/schemas/Menu' } } } }
        }
      }
    },
    '/menus/manage': {
      get: {
        tags: ['Menus'],
        summary: 'Get menu management interface (Admin only)',
        security: [{ BearerAuth: [] }],
        responses: {
          200: { description: 'Menu management data', content: { 'application/json': { schema: { type: 'object' } } } }
        }
      }
    },
    '/menus/{id}': {
      get: {
        tags: ['Menus'],
        summary: 'Get menu by ID',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Menu found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Menu' } } } }
        }
      },
      put: {
        tags: ['Menus'],
        summary: 'Update menu (Admin only)',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/Menu' } } }
        },
        responses: {
          200: { description: 'Menu updated', content: { 'application/json': { schema: { $ref: '#/components/schemas/Menu' } } } }
        }
      },
      delete: {
        tags: ['Menus'],
        summary: 'Delete menu (Admin only)',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          204: { description: 'Menu deleted' }
        }
      }
    },
    '/menus/slug/{slug}': {
      get: {
        tags: ['Menus'],
        summary: 'Get menu by slug',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'slug', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Menu found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Menu' } } } }
        }
      }
    },   
    '/menus/{id}/reorder': {
      put: {
        tags: ['Menus'],
        summary: 'Reorder menu items (Admin only)',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { type: 'object', properties: { itemIds: { type: 'array', items: { type: 'string' } } } } } }
        },
        responses: {
          200: { description: 'Menu items reordered', content: { 'application/json': { schema: { type: 'object' } } } }
        }
      }
    },
    '/pages': {
      get: {
        tags: ['Pages'],
        summary: 'Get all pages',
        security: [{ BearerAuth: [] }],
        responses: {
          200: { description: 'List of pages', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Page' } } } } }
        }
      },
      post: {
        tags: ['Pages'],
        summary: 'Create page',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/Page' } } }
        },
        responses: {
          201: { description: 'Page created', content: { 'application/json': { schema: { $ref: '#/components/schemas/Page' } } } }
        }
      }
    },
    '/pages/{id}': {
      get: {
        tags: ['Pages'],
        summary: 'Get page by ID',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Page found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Page' } } } }
        }
      },
      put: {
        tags: ['Pages'],
        summary: 'Update page',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/Page' } } }
        },
        responses: {
          200: { description: 'Page updated', content: { 'application/json': { schema: { $ref: '#/components/schemas/Page' } } } }
        }
      },
      delete: {
        tags: ['Pages'],
        summary: 'Delete page',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          204: { description: 'Page deleted' }
        }
      }
    },   
    '/security/logs': {
      get: {
        tags: ['Security'],
        summary: 'Get audit logs (Admin only)',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 10, maximum: 100 } },
          { name: 'startDate', in: 'query', schema: { type: 'string', format: 'date-time' } },
          { name: 'endDate', in: 'query', schema: { type: 'string', format: 'date-time' } },
          { name: 'userId', in: 'query', schema: { type: 'string' } },
          { name: 'action', in: 'query', schema: { type: 'string' } },
          { name: 'resource', in: 'query', schema: { type: 'string' } }
        ],
        responses: {
          200: { description: 'Audit logs', content: { 'application/json': { schema: { type: 'object' } } } }
        }
      }
    },
    '/security/settings': {
      get: {
        tags: ['Security'],
        summary: 'Get security settings (Admin only)',
        security: [{ BearerAuth: [] }],
        responses: {
          200: { description: 'Security settings', content: { 'application/json': { schema: { type: 'object' } } } }
        }
      },
      put: {
        tags: ['Security'],
        summary: 'Update security settings (Admin only)',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { type: 'object', properties: { jwtExpiration: { type: 'string' }, refreshTokenExpiration: { type: 'string' }, passwordStrengthRegex: { type: 'string' } } } } }
        },
        responses: {
          200: { description: 'Security settings updated', content: { 'application/json': { schema: { type: 'object' } } } }
        }
      },
    },
    '/pages/{id}/elements': {
      get: {
        tags: ['Pages'],
        summary: 'Get page elements by page ID',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Page elements', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/PageElement' } } } } }
        }
      },
      post: {
        tags: ['Pages'],
        summary: 'Create page element',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/PageElement' } } }
        },
        responses: {
          201: { description: 'Page element created', content: { 'application/json': { schema: { $ref: '#/components/schemas/PageElement' } } } }
        }
      }
    },
    '/pages/{id}/elements/{elementId}': {
      put: {
        tags: ['Pages'],
        summary: 'Update page element',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'elementId', in: 'path', required: true, schema: { type: 'string' } }
        ],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/PageElement' } } }
        },
        responses: {
          200: { description: 'Page element updated', content: { 'application/json': { schema: { $ref: '#/components/schemas/PageElement' } } } }
        }
      },
      delete: {
        tags: ['Pages'],
        summary: 'Delete page element',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'elementId', in: 'path', required: true, schema: { type: 'string' } }
        ],
        responses: {
          204: { description: 'Page element deleted' }
        }
      }
    },
    '/pages/{id}/elements/manage': {
      post: {
        tags: ['Pages'],
        summary: 'Manage page elements (bulk operations)',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { type: 'object' } } }
        },
        responses: {
          200: { description: 'Bulk operation result', content: { 'application/json': { schema: { type: 'object' } } } }
        }
      }      
    },
    '/pages/{id}/elements/reorder': {
      put: {
        tags: ['Pages'],
        summary: 'Reorder page elements',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { type: 'object', properties: { elementIds: { type: 'array', items: { type: 'string' } } } } } }
        },
        responses: {
          200: { description: 'Page elements reordered', content: { 'application/json': { schema: { type: 'object' } } } }  
        }
      }
    },        
  }
};