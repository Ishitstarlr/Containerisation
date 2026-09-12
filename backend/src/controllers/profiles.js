import prisma from '../config/database.js';

/**
 * Get user profile with all related data
 */
export const getProfile = async (req, res) => {
  try {
    const profile = await prisma.user.findUnique({
      where: { auth0Id: req.auth.payload.sub },
      include: {
        profile: true,
        education: true,
        experience: true,
        skills: true,
        socialProfiles: true
      }
    });
    res.json(profile);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};

/**
 * Update user profile and related data
 */
export const updateProfile = async (req, res) => {
  const { profile, education, experience, skills, socialProfiles } = req.body;

  try {
    const updatedUser = await prisma.user.update({
      where: { auth0Id: req.auth.payload.sub },
      data: {
        profile: {
          upsert: {
            create: profile,
            update: profile
          }
        },
        education: {
          deleteMany: {},
          create: education
        },
        experience: {
          deleteMany: {},
          create: experience
        },
        skills: {
          deleteMany: {},
          create: skills
        },
        socialProfiles: {
          deleteMany: {},
          create: socialProfiles
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

    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

