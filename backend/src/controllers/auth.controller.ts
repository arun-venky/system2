import { Request, Response } from 'express';
import { User } from '../models/user.model.js';
import { Role } from '../models/role.model.js';
import { AuditLog } from '../models/audit-log.model.js';
import { generateToken, generateRefreshToken, parseUser } from '../utils/tokenUtils.js';
import { logger, logAudit } from '../utils/logger.js';
import { AuthRequest, validateTokenInternal } from '../middleware/auth.middleware.js';
import { sendPasswordResetEmail, sendVerificationEmail } from '../services/emailService.js';

// Signup controller
export const signup = async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;
    
    logger.info('Attempting signup', { username, email });

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
    });
    
    if (existingUser) {
      logger.warn('Signup failed - User already exists', {
        attemptedUsername: username,
        attemptedEmail: email,
        existingUsername: existingUser.username,
        existingEmail: existingUser.email
      });
      return res.status(400).json({ 
        message: 'User already exists with this email or username' 
      });
    }
    
    // Get default Viewer role
    const viewerRole = await Role.findOne({ name: 'Viewer' });
    
    if (!viewerRole) {
      logger.error('Signup failed - Viewer role not found', {
        username,
        email,
        availableRoles: await Role.find().select('name').lean()
      });
      return res.status(500).json({ message: 'Role setup error' });
    }
    
    // Create new user
    const user = new User({
      username,
      email,
      password,
      role: viewerRole._id,
      isVerified: false
    });
    
    // Generate verification token
    const verificationToken = await user.generateVerificationToken();
    await user.save();
    
    // Send verification email
    try {
      await sendVerificationEmail(email, verificationToken);
    } catch (emailError) {
      logger.error('Failed to send verification email:', emailError);
      // Don't expose the error to the client
    }
    
    // Generate tokens
    const token = generateToken(user);
    const refreshToken = generateRefreshToken(user);
    
    // Log the signup action
    await AuditLog.create({
      userId: user._id,
      action: 'signup',
      resource: 'auth',
      details: `User ${username} registered`,
    });
    
    logger.info('User signup successful', {
      userId: user._id,
      username: user.username,
      email: user.email,
      role: viewerRole.name
    });
    
    logAudit(user.id.toString(), 'signup', 'auth', `User ${username} registered`);
    
    // Send response
    res.status(201).json({
      message: 'User registered successfully. Please check your email to verify your account.',
      token,
      refreshToken,
      user: parseUser(user),
    });
  } catch (error) {
    logger.error('Signup error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      requestBody: req.body
    });
    res.status(500).json({ message: 'Error creating user' });
  }
};

// Login controller
export const login = async (req: Request, res: Response) => {
  const startTime = Date.now();
  const requestId = Math.random().toString(36).substring(7);
  
  try {
    logger.info('Login controller started', {
      requestId,
      body: req.body,
      timestamp: new Date().toISOString()
    });

    const { email, password } = req.body;
    
    // // Find user by email
    const user = await User.findOne({ email })

    if (!user) {
      logger.warn('Login failed - User not found', { 
        attemptedEmail: email,
        timestamp: new Date().toISOString()
      });
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      logger.warn('Login failed - Invalid password', {
        userId: user._id,
        username: user.username,
        email: user.email,
        timestamp: new Date().toISOString()
      });
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate tokens
    const token = generateToken(user);
    const refreshToken = generateRefreshToken(user);

    // Store tokens in database and create audit log in parallel
    //await user.setTokens(token, refreshToken);
    await Promise.all([
      user.setTokens(token, refreshToken),
      AuditLog.create({
        userId: user._id,
        action: 'login',
        resource: 'auth',
        details: `User ${user.username} logged in`,
      })
    ]);

    const endTime = Date.now();
    logAudit(user.id.toString(), 'login', 'auth', `User ${user.username} logged in`);

    // Send response
    res.status(200).json({
      message: 'Login successful',
      token,
      refreshToken,
      user: parseUser(user),
    });
  } catch (error) {
    const endTime = Date.now();
    logger.error('Login error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      requestBody: req.body,
      duration: endTime - startTime
    });
    res.status(500).json({ message: 'Error during login' });
  }
};

// Refresh token controller
export const refreshToken = async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;
    
    // Find user
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // Check if refresh token is valid
    if (!user.refreshToken || !user.refreshTokenExpiry || user.refreshTokenExpiry < new Date()) {
      return res.status(401).json({ message: 'Refresh token expired or invalid' });
    }
    
    // Generate new tokens
    const token = generateToken(user);
    const refreshToken = generateRefreshToken(user);
    
    // Store new tokens in database
    await user.setTokens(token, refreshToken);
    
    // Send response
    res.status(200).json({
      token,
      refreshToken,
    });
  } catch (error) {
    logger.error('Token refresh error', error);
    res.status(500).json({ message: 'Error refreshing token' });
  }
};

// Logout controller
export const logout = async (req: AuthRequest, res: Response) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (token && req.user) {
      // Clear tokens from database
      await req.user.clearTokens();
      
      // Log the logout action
      await AuditLog.create({
        userId: req.user._id,
        action: 'logout',
        resource: 'auth',
        details: `User ${req.user.username} logged out`,
      });
      
      logAudit(
        req.user?._id?.toString() || 'system',
        'logout',
        'auth',
        `User ${req.user.username} logged out`
      );
      
      res.status(200).json({ message: 'Logged out successfully' });
    } else {
      res.status(400).json({ message: 'No token provided' });
    }
  } catch (error) {
    logger.error('Logout error', error);
    res.status(500).json({ message: 'Error during logout' });
  }
};

// Manage auth operations controller (bulk operations)
export const manageAuth = async (req: AuthRequest, res: Response) => {
  try {
    const { operations } = req.body;
    
    if (!Array.isArray(operations)) {
      return res.status(400).json({ 
        message: 'Operations must be an array' 
      });
    }
    
    const results = [];
    
    for (const op of operations) {
      const { action, data } = op as {
        action: 'signup' | 'login' | 'refresh' | 'logout';
        data?: any;
      };
      
      switch (action) {
        case 'signup': {
          const { username, email, password } = data;
          
          // Check if user already exists
          const existingUser = await User.findOne({ 
            $or: [{ email }, { username }] 
          });
          
          if (existingUser) {
            results.push({
              action,
              success: false,
              message: 'User already exists with this email or username'
            });
            continue;
          }
          
          // Get default Viewer role
          const viewerRole = await Role.findOne({ name: 'Viewer' });
          
          if (!viewerRole) {
            results.push({
              action,
              success: false,
              message: 'Role setup error'
            });
            continue;
          }
          
          // Create new user
          const user = new User({
            username,
            email,
            password,
            role: viewerRole._id,
          });
          
          await user.save();
          
          // Generate tokens
          const token = generateToken(user);
          const refreshToken = generateRefreshToken(user);
          
          // Log the signup action
          await AuditLog.create({
            userId: user._id,
            action: 'signup',
            resource: 'auth',
            details: `User ${username} registered`,
          });
          
          logAudit(user.id.toString(), 'signup', 'auth', `User ${username} registered`);
          
          results.push({
            action,
            success: true,
            token,
            refreshToken,
            user: parseUser(user)
          });
          break;
        }
        
        case 'login': {
          const { email, password } = data;
          
          // Find user by email
          const user = await User.findOne({ email }).populate('role');
          
          if (!user) {
            results.push({
              action,
              success: false,
              message: 'Invalid credentials'
            });
            continue;
          }
          
          // Check password
          const isPasswordValid = await user.comparePassword(password);
          
          if (!isPasswordValid) {
            results.push({
              action,
              success: false,
              message: 'Invalid credentials'
            });
            continue;
          }
          
          // Generate tokens
          const token = generateToken(user);
          const refreshToken = generateRefreshToken(user);
          
          // Log the login action
          await AuditLog.create({
            userId: user._id,
            action: 'login',
            resource: 'auth',
            details: `User ${user.username} logged in`,
          });
          
          logAudit(user.id.toString(), 'login', 'auth', `User ${user.username} logged in`);
          
          results.push({
            action,
            success: true,
            token,
            refreshToken,
            user: parseUser(user)
          });
          break;
        }
        
        case 'refresh': {
          const { userId } = data;
          
          // Find user
          const user = await User.findById(userId);
          
          if (!user) {
            results.push({
              action,
              success: false,
              message: 'User not found'
            });
            continue;
          }
          
          // Generate new tokens
          const token = generateToken(user);
          const refreshToken = generateRefreshToken(user);
          
          results.push({
            action,
            success: true,
            token,
            refreshToken
          });
          break;
        }
        
        case 'logout': {
          const { token } = data;
          
          if (!token) {
            results.push({
              action,
              success: false,
              message: 'No token provided'
            });
            continue;
          }
          
          // Log the logout action
          await AuditLog.create({
            userId: req.user?._id,
            action: 'logout',
            resource: 'auth',
            details: `User ${req.user?.username} logged out`,
          });
          
          logAudit(
            req.user?._id?.toString() || 'system',
            'logout',
            'auth',
            `User ${req.user?.username} logged out`
          );
          
          results.push({
            action,
            success: true,
            message: 'Logged out successfully'
          });
          break;
        }
        
        default:
          results.push({
            action,
            success: false,
            message: 'Invalid action'
          });
      }
    }
    
    // Log the bulk operation
    await AuditLog.create({
      userId: req.user?._id,
      action: 'manage',
      resource: 'auth',
      details: `Bulk auth operations performed: ${operations.length} operations`,
    });
    
    logAudit(
      req.user?._id?.toString() || 'system',
      'manage',
      'auth',
      `Bulk auth operations performed: ${operations.length} operations`
    );
    
    res.status(200).json({
      message: 'Bulk operations completed',
      results
    });
  } catch (error) {
    logger.error('Error managing auth operations', error);
    res.status(500).json({ message: 'Error performing bulk operations' });
  }
};

// Request password reset controller
export const requestPasswordReset = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    
    // Find user by email
    const user = await User.findOne({ email });
    
    if (!user) {
      // Don't reveal that the user doesn't exist
      return res.status(200).json({ 
        message: 'If an account exists with this email, a password reset link will be sent' 
      });
    }
    
    // Generate reset token
    const resetToken = await user.generateResetToken();
    await user.save();
    
    // Send password reset email
    try {
      await sendPasswordResetEmail(email, resetToken);
    } catch (emailError) {
      logger.error('Failed to send password reset email:', emailError);
      // Don't expose the error to the client
    }
    
    // Log the action
    await AuditLog.create({
      userId: user._id,
      action: 'request_password_reset',
      resource: 'auth',
      details: `Password reset requested for ${email}`,
    });
    
    logAudit(user.id.toString(), 'request_password_reset', 'auth', `Password reset requested for ${email}`);
    
    res.status(200).json({ 
      message: 'If an account exists with this email, a password reset link will be sent' 
    });
  } catch (error) {
    logger.error('Password reset request error', error);
    res.status(500).json({ message: 'Error processing password reset request' });
  }
};

// Reset password controller
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, password } = req.body;
    
    // Find user with reset token
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() }
    });
    
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }
    
    // Update password
    user.password = password;
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();
    
    // Log the action
    await AuditLog.create({
      userId: user._id,
      action: 'reset_password',
      resource: 'auth',
      details: `Password reset completed for ${user.email}`,
    });
    
    logAudit(user.id.toString(), 'reset_password', 'auth', `Password reset completed for ${user.email}`);
    
    res.status(200).json({ message: 'Password has been reset successfully' });
  } catch (error) {
    logger.error('Password reset error', error);
    res.status(500).json({ message: 'Error resetting password' });
  }
};

// Verify token controller
export const verify = async (req: Request, res: Response) => {
  const { token } = req.body;
  const user = await validateTokenInternal(token);
  if (user === null) {
    return res.status(401).json({ message: 'Unauthorized - Token expired or invalid' });
  }  
  res.status(200).json({
    message: 'Token verified successfully',
    valid: true,
    token,
    user: parseUser(user),
  });
  return user;
};

// Verify email controller
export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const { token } = req.query;
    
    if (!token) {
      return res.status(400).json({ message: 'Verification token is required' });
    }

    // Find user with verification token
    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpiry: { $gt: Date.now() }
    });
    
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired verification token' });
    }
    
    // Mark user as verified and clear verification token
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiry = undefined;
    await user.save();
    
    // Log the action
    await AuditLog.create({
      userId: user._id,
      action: 'verify_email',
      resource: 'auth',
      details: `Email verified for ${user.email}`,
    });
    
    logAudit(user.id.toString(), 'verify_email', 'auth', `Email verified for ${user.email}`);
    
    res.status(200).json({ message: 'Email verified successfully' });
  } catch (error) {
    logger.error('Email verification error', error);
    res.status(500).json({ message: 'Error verifying email' });
  }
};

// Resend verification email controller
export const resendVerificationEmail = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (user.isVerified) {
      return res.status(400).json({ message: 'Email is already verified' });
    }
    
    // Generate new verification token
    const verificationToken = await user.generateVerificationToken();
    await user.save();
    
    // Send verification email
    try {
      await sendVerificationEmail(email, verificationToken);
    } catch (emailError) {
      logger.error('Failed to send verification email:', emailError);
      // Don't expose the error to the client
    }
    
    // Log the action
    await AuditLog.create({
      userId: user._id,
      action: 'resend_verification',
      resource: 'auth',
      details: `Verification email resent to ${email}`,
    });
    
    logAudit(user.id.toString(), 'resend_verification', 'auth', `Verification email resent to ${email}`);
    
    res.status(200).json({ message: 'Verification email has been resent' });
  } catch (error) {
    logger.error('Resend verification email error', error);
    res.status(500).json({ message: 'Error resending verification email' });
  }
};

// Change password controller
export const changePassword = async (req: AuthRequest, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user?._id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Verify current password
    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }
    
    // Update password
    user.password = newPassword;
    await user.save();
    
    // Log the action
    await AuditLog.create({
      userId: user._id,
      action: 'change_password',
      resource: 'auth',
      details: `Password changed for ${user.email}`,
    });
    
    logAudit(user.id.toString(), 'change_password', 'auth', `Password changed for ${user.email}`);
    
    res.status(200).json({ message: 'Password changed successfully' });
  } catch (error) {
    logger.error('Change password error', error);
    res.status(500).json({ message: 'Error changing password' });
  }
};

export const refreshSession = async (req: Request, res: Response) => {
  try {
    const { token } = req.body;
    const user = await validateTokenInternal(token);
  } catch (error) {
    logger.error('Refresh session error', error);
    res.status(500).json({ message: 'Error refreshing session' });
  }
};

