import { Role } from '../models/role.model.js';
import { User } from '../models/user.model.js';
import { logger } from './logger.js';

// Function to seed the database with initial data
export const seedDatabase = async () => {
  try {
    // Check if roles already exist
    const rolesCount = await Role.countDocuments();
    
    if (rolesCount === 0) {
      logger.info('Seeding roles...');
      
      // Create roles
      const adminRole = await Role.create({
        name: 'Admin',
        permissions: [
          { resource: 'users', actions: ['create', 'read', 'update', 'delete'] },
          { resource: 'pages', actions: ['create', 'read', 'update', 'delete'] },
          { resource: 'menus', actions: ['create', 'read', 'update', 'delete'] },
          { resource: 'roles', actions: ['create', 'read', 'update', 'delete'] },
          { resource: 'security', actions: ['create', 'read', 'update', 'delete'] },
        ],
      });
      
      const editorRole = await Role.create({
        name: 'Editor',
        permissions: [
          { resource: 'pages', actions: ['create', 'read', 'update'] },
          { resource: 'menus', actions: ['read'] },
          { resource: 'users', actions: ['read'] },
        ],
      });
      
      const viewerRole = await Role.create({
        name: 'Viewer',
        permissions: [
          { resource: 'pages', actions: ['read'] },
          { resource: 'menus', actions: ['read'] },
        ],
      });
      
      logger.info('Roles seeded successfully');
      
      // Check if admin user exists
      const adminUserExists = await User.countDocuments({ username: 'admin' });
      
      if (!adminUserExists) {
        logger.info('Creating admin user...');
        
        // Create admin user
        await User.create({
          //_id: '668d6b7b0032392868a309d1',          
          username: 'admin',
          email: 'admin@example.com',
          password: 'Admin123!',
          role: adminRole._id,
        });
        
        logger.info('Admin user created successfully');
      }
      
      // Create sample users
      const editorUserExists = await User.countDocuments({ username: 'editor' });
      
      if (!editorUserExists) {
        await User.create({
          //_id: '668d6b7b0032392868a309d2',
          username: 'editor',
          email: 'editor@example.com',
          password: 'Editor123!',
          role: editorRole._id,
        });
        
        logger.info('Editor user created successfully');
      }
      
      const viewerUserExists = await User.countDocuments({ username: 'viewer' });
      
      if (!viewerUserExists) {
        await User.create({
          //_id: '668d6b7b0032392868a309d3',
          username: 'viewer',
          email: 'viewer@example.com',
          password: 'Viewer123!',
          role: viewerRole._id,
        });
        
        logger.info('Viewer user created successfully');
      }
    } else {
      logger.info('Database already seeded, skipping seed process');
    }
  } catch (error) {
    logger.error('Error seeding database', error);
    throw error;
  }
};