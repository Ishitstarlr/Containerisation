import { auth } from 'express-oauth2-jwt-bearer';
import prisma from '../config/database.js';

/**
 * Middleware to check if user is authenticated
 */
export const authenticateUser = async (req, res, next) => {
  try {
    if (!req.auth?.payload?.sub) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    next();
  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({ error: 'Authentication failed' });
  }
};

// Auth0 JWT validation middleware
export const checkJwt = auth({
  audience: process.env.AUTH0_AUDIENCE,
  issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL,
  tokenSigningAlg: 'RS256'
});

// Check if user exists and create if not
export const ensureUser = async (req, res, next) => {
    
  try {
    if (!req.auth?.payload?.sub) {
      return res.status(401).json({ error: 'No valid token provided' });
    }

    const auth0Id = req.auth.payload.sub;
    const email = req.auth.payload.email;
    const nickname = req.auth.payload.nickname;
    const name = req.auth.payload.name;

    let user = await prisma.user.findUnique({
      where: { auth0Id },
      include: {
        profile: true,
        education: true,
        experience: true,
        skills: true,
        socialProfiles: true
      }
    });

    if (!user) {
      // Create new user with Auth0 data
      user = await prisma.user.create({
        data: {
          auth0Id,
          email,
          username: nickname || email.split('@')[0],
          role: 'ORGANIZER',
          status: 'ACTIVE',
          profile: {
            create: {
              firstName: req.auth.payload.given_name || '',
              lastName: req.auth.payload.family_name || '',
              avatarUrl: req.auth.payload.picture || null
            }
          }
        },
        include: {
          profile: true,
          education: true,
          experience: true,
          skills: true,
          socialProfiles: true
        }
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ error: 'Authentication failed', details: error.message });
  }
};

/**
 * Middleware to check if user is an organizer
 */
export const isOrganizer = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.user.role !== 'ORGANIZER' && req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Forbidden. Only organizers can perform this action.' });
  }

  next();
};

// Check if profile is complete
export const requireCompleteProfile = (req, res, next) => {
  // Check for all essential profile fields
  const { profile } = req.user || {};
  
  if (!profile || !profile.firstName || !profile.lastName || !profile.phone) {
    console.log('Profile incomplete. Missing required fields:', { 
      hasProfile: !!profile,
      hasFirstName: !!profile?.firstName,
      hasLastName: !!profile?.lastName,
      hasPhone: !!profile?.phone
    });
    
    return res.status(403).json({ 
      error: 'Profile incomplete. Please complete your profile before applying.',
      isProfileIncomplete: true,
      missingFields: {
        firstName: !profile?.firstName,
        lastName: !profile?.lastName,
        phone: !profile?.phone
      },
      redirectTo: '/profile'
    });
  }
  
  next();
}; 