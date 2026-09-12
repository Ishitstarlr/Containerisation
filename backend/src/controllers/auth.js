import prisma from '../config/database.js';

export const register = async (req, res) => {
  try {
    const { user: auth0User } = req.body;
    
    if (!auth0User?.sub || !auth0User?.email) {
      return res.status(400).json({ error: 'Invalid user data' });
    }

    // Try to find existing user first
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { auth0Id: auth0User.sub },
          { email: auth0User.email }
        ]
      }
    });

    if (user) {
      // Update existing user
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          auth0Id: auth0User.sub,
          email: auth0User.email,
          username: auth0User.nickname || auth0User.email.split('@')[0],
          role: 'ORGANIZER',  // Default role
          status: 'ACTIVE',
          profile: {
            upsert: {
              create: {
                avatarUrl: auth0User.picture || null
              },
              update: {
                avatarUrl: auth0User.picture || null
              }
            }
          }
        },
        include: {
          profile: true
        }
      });
    } else {
      // Create new user
      user = await prisma.user.create({
        data: {
          auth0Id: auth0User.sub,
          email: auth0User.email,
          username: auth0User.nickname || auth0User.email.split('@')[0],
          role: 'ORGANIZER',  // Default role
          status: 'ACTIVE',
          profile: {
            create: {
              avatarUrl: auth0User.picture || null
            }
          }
        },
        include: {
          profile: true
        }
      });
    }

    res.status(201).json(user);
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Failed to register user' });
  }
};

export const getCurrentUser = async (req, res) => {
  try {
    console.log(req.auth.payload.sub);
    const user = await prisma.user.findUnique({
      where: { auth0Id: req.auth.payload.sub },
      include: {
        profile: true,
        education: true,
        experience: true,
        skills: true,
        socialProfiles: true
      }
    });
    console.log(user)

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
};

export const updateUser = async (req, res) => {
  try {
    const userId = req.auth.payload.sub;
    const userData = req.body;

    // Remove id and timestamps from profile data
    const profileData = userData.profile ? {
      firstName: userData.profile.firstName,
      lastName: userData.profile.lastName,
      avatarUrl: userData.profile.avatarUrl,
      bio: userData.profile.bio,
      gender: userData.profile.gender,
      phone: userData.profile.phone,
      country: userData.profile.country,
      city: userData.profile.city
    } : {};
    
    const updatedUser = await prisma.user.update({
      where: { auth0Id: userId },
      data: {
        profile: {
          upsert: {
            create: profileData,
            update: profileData
          }
        },
        education: {
          deleteMany: {},
          create: userData.education?.map(edu => ({
            institutionName: edu.institutionName,
            degree: edu.degree,
            fieldOfStudy: edu.fieldOfStudy,
            graduationYear: edu.graduationYear ? parseInt(edu.graduationYear) : null
          })) || []
        },
        experience: {
          deleteMany: {},
          create: userData.experience?.map(exp => ({
            company: exp.company,
            position: exp.position,
            startDate: exp.startDate ? new Date(exp.startDate) : null,
            endDate: exp.endDate ? new Date(exp.endDate) : null
          })) || []
        },
        skills: {
          deleteMany: {},
          create: userData.skills?.map(skill => ({
            skillName: skill.skillName,
            expertiseLevel: skill.expertiseLevel
          })) || []
        },
        socialProfiles: {
          deleteMany: {},
          create: userData.socialProfiles?.map(social => ({
            platform: social.platform,
            url: social.url
          })) || []
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
    console.log(updatedUser)
    res.json(updatedUser);
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
}; 