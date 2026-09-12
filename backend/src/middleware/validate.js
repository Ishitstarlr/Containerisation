import { z } from 'zod';

// Validation schemas
export const eventSchema = z.object({
  name: z.string().min(3).max(255),
  type: z.enum(['HACKATHON', 'GENERAL_EVENT']),
  mode: z.enum(['ONLINE', 'OFFLINE']),
  tagline: z.string().optional().nullable(),
  about: z.string().optional().nullable(),
  maxParticipants: z.number().positive().optional().nullable(),
  minTeamSize: z.number().positive().optional().nullable(),
  maxTeamSize: z.number().positive().optional().nullable(),

  eventTimeline: z.object({
    timezone: z.string(),
    applicationsStart: z.string().datetime(),
    applicationsEnd: z.string().datetime(),
    eventStart: z.string().datetime(),
    eventEnd: z.string().datetime(),
    rsvpDeadlineDays: z.number()
  }),

  eventLinks: z.object({
    websiteUrl: z.string().url().optional().nullable(),
    micrositeUrl: z.string().url().optional().nullable(),
    contactEmail: z.string().email(),
    codeOfConductUrl: z.string().url().optional().nullable()
  }),

  eventBranding: z.object({
    brandColor: z.string().optional().nullable(),
    coverImage: z.object({
      filePath: z.string().optional().nullable(),
      bucket: z.string().optional().nullable(),
      publicUrl: z.string().url().optional().nullable(),
    }).optional().nullable(),
    faviconImage: z.object({
      filePath: z.string().optional().nullable(),
      bucket: z.string().optional().nullable(),
      publicUrl: z.string().url().optional().nullable(),
    }).optional().nullable(),
    logoImage: z.object({
      filePath: z.string().optional().nullable(),
      bucket: z.string().optional().nullable(),
      publicUrl: z.string().url().optional().nullable(),
    }).optional().nullable()
  }).optional(),
  
  // If track description is given, track name is necessary
  // If prize details are given, prize name are necessary
  tracks: z.array(
    z.object({
      name: z.string().max(255).optional().nullable(),
      description: z.string().optional().nullable(),
      prizes: z.array(
        z.object({
          title: z.string().max(255).optional().nullable(),
          description: z.string().optional().nullable(),
          value: z.number().nonnegative().optional().nullable()
        }).refine((prize) => {
          if((prize.description?.trim() !== '' || (prize.value && prize.value != 0)) && (!prize.title || prize.title.trim() === '')) {
            return false;
          }
          return true;
        },{ message: "If prize details are provided, a valid title must also be provided." })
        .optional().nullable()
      ).optional().nullable()
    }).refine((track) => {
      const hasDescription = track.description && track.description.trim() !== '';
      return !(hasDescription && (!track.name || track.name.trim() === ''));
    },{ message: "If a track description is provided, a valid name must also be provided." })
    .optional().nullable()
  ).optional(),

  // If sponsor details are given, sponsor name must be filled
  sponsors: z.array(z.object({
    name: z.string().max(255).optional().nullable(),
    logoUrl: z.string().url().optional().nullable(),
    websiteUrl: z.string().url().optional().nullable()
    }).refine((sponsors) => {
      if ((sponsors.logoUrl?.trim() !== '' || sponsors.websiteUrl?.trim() !== '') && (!sponsors.name || sponsors.name.trim() === '')){
        return false;
      }
      return true;
    },{message : "Sponsor name must be provided"})
  ).optional(),

  // If event people detials are given, event person name must be mentioned
  eventPeople: z.array(z.object({
    name: z.string().min(3).max(255),
    role: z.string().max(255).optional().nullable(),
    bio: z.string().optional().nullable(),
    imageUrl: z.string().url().optional().nullable(),
    linkedinUrl: z.string().url().optional().nullable()
    }).refine((eventPeople) => {
      if ((eventPeople.bio?.trim() != '' || eventPeople.imageUrl?.trim() != '' || eventPeople.linkedinUrl?.trim() != '') && (!eventPeople.name || eventPeople.name.trim() === '')){
        return false;
      }
      return true;
    },{message : "Event person name must be provided"})
  ).optional(),
  applicationForm: z.object({
    educationRequired: z.boolean().optional(),
    experienceRequired: z.boolean().optional(),
    profilesRequired: z.boolean().optional(),
    contactRequired: z.boolean().optional(),
    tShirtSizeRequired: z.boolean().optional()
  }),
  customQuestions: z.array(
    z.object({
      questionText: z.string().min(1),
      questionType: z.enum(["ENUM", "NUMBER", "TEXT", "CHECKBOX"]),
      options: z.any().optional(),
      isRequired: z.boolean().default(false),
    })
  ).optional()
});

export const eventDraftSchema = z.object({
  name: z.string().min(3).max(255),
  type: z.enum(['HACKATHON', 'GENERAL_EVENT']),
  mode: z.enum(['ONLINE', 'OFFLINE']),
  tagline: z.string().optional().nullable(),
  about: z.string().optional().nullable(),
  maxParticipants: z.number().positive().optional().nullable(),
  minTeamSize: z.number().positive().optional().nullable(),
  maxTeamSize: z.number().positive().optional().nullable(),
  eventTimeline: z.object({
    timezone: z.string(),
    applicationsStart: z.string().datetime().nullable(),
    applicationsEnd: z.string().datetime().nullable(),
    eventStart: z.string().datetime().nullable(),
    eventEnd: z.string().datetime().nullable(),
    rsvpDeadlineDays: z.number().nullable()
  }),
  eventLinks: z.object({
    websiteUrl: z.string().url().optional().nullable(),
    micrositeUrl: z.string().url().optional().nullable(),
    contactEmail: z.string().email().optional().nullable(),
    codeOfConductUrl: z.string().url().optional().nullable()
  }).optional()
});

export const teamSchema = z.object({
  eventId: z.number(),
  name: z.string().min(3).max(255)
});

export const projectSchema = z.object({
  eventId: z.number(),
  teamId: z.number(),
  title: z.string().min(3).max(255),
  description: z.string(),
  githubUrl: z.string().url().optional(),
  demoUrl: z.string().url().optional()
});

// Validation middleware factory
export const validate = (schema) => async (req, res, next) => {
  try {
    await schema.parseAsync(req.body);
    next();
  } catch (error) {
    res.status(400).json({
      error: 'Validation failed',
      details: error.errors
    });
  }
}; 