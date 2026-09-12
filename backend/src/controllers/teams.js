import prisma from '../config/database.js';
import crypto from 'crypto';


/**
 * Get all teams for current user
 */
export const getTeams = async (req, res) => {
  try {
    const teams = await prisma.team.findMany({
      where: {
        members: {
          some: {
            userId: req.auth.payload.sub
          }
        }
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                email: true
              }
            }
          }
        },
        event: true
      }
    });
    res.json(teams);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch teams' });
  }
};

/**
 * Create new team
 */
export const createTeam = async (req, res) => {
  try {
    const { eventId, name } = req.body;
    const userId = req.auth.payload.sub;

    // Generate a random hash code
    const hashCode = crypto.randomBytes(4).toString('hex').toUpperCase();

    const team = await prisma.team.create({
      data: {
        name,
        eventId: parseInt(eventId),
        hashCode,
        members: {
          create: {
            userId: userId,
            role: 'LEADER'
          }
        }
      },
      include: {
        members: true
      }
    });

    res.status(201).json(team);
  } catch (error) {
    console.error('Error creating team:', error);
    res.status(500).json({ error: 'Failed to create team' });
  }
};


export const joinTeam = async (req, res) => {
  try {
    const { eventId, hashCode } = req.body;
    const userId = req.auth.payload.sub;

    const team = await prisma.team.findFirst({
      where: {
        eventId: parseInt(eventId),
        hashCode: hashCode
      }
    });

    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    const member = await prisma.teamMember.create({
      data: {
        teamId: team.id,
        userId: userId,
        role: 'MEMBER'
      }
    });

    res.status(201).json(member);
  } catch (error) {
    console.error('Error joining team:', error);
    res.status(500).json({ error: 'Failed to join team' });
  }
};