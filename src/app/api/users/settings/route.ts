import { NextRequest } from 'next/server';
import { and, eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { userSettings } from '@/lib/schema';
import { errorResponse, successResponse, validateRequestBody } from '@/lib/request-validation';
import { withApiTrace } from '@/lib/api-trace';
import { userSettingsUpdateSchema } from '@/lib/validations';

type NotificationPrefs = {
  emailNotifications: boolean;
  pushNotifications: boolean;
  messageNotifications: boolean;
  mentionNotifications: boolean;
};

type PrivacyPrefs = {
  profileVisibility: 'public' | 'private';
  showEmail: boolean;
  showActivity: boolean;
};

type ProfileExtras = {
  bio: string;
  location: string;
  website: string;
};

const DEFAULT_NOTIFICATIONS: NotificationPrefs = {
  emailNotifications: true,
  pushNotifications: true,
  messageNotifications: true,
  mentionNotifications: true,
};

const DEFAULT_PRIVACY: PrivacyPrefs = {
  profileVisibility: 'public',
  showEmail: false,
  showActivity: true,
};

const DEFAULT_PROFILE_EXTRAS: ProfileExtras = {
  bio: '',
  location: '',
  website: '',
};

async function getSetting<T>(userId: number, key: string): Promise<T | null> {
  const [record] = await db
    .select({ value: userSettings.value })
    .from(userSettings)
    .where(and(eq(userSettings.userId, userId), eq(userSettings.key, key)))
    .limit(1);

  return (record?.value as T | undefined) ?? null;
}

function normalizeNotifications(input: unknown): NotificationPrefs {
  const source = input && typeof input === 'object' ? (input as Partial<NotificationPrefs>) : {};
  return {
    emailNotifications: source.emailNotifications ?? DEFAULT_NOTIFICATIONS.emailNotifications,
    pushNotifications: source.pushNotifications ?? DEFAULT_NOTIFICATIONS.pushNotifications,
    messageNotifications: source.messageNotifications ?? DEFAULT_NOTIFICATIONS.messageNotifications,
    mentionNotifications: source.mentionNotifications ?? DEFAULT_NOTIFICATIONS.mentionNotifications,
  };
}

function normalizePrivacy(input: unknown): PrivacyPrefs {
  const source = input && typeof input === 'object' ? (input as Partial<PrivacyPrefs>) : {};
  return {
    profileVisibility: source.profileVisibility === 'private' ? 'private' : 'public',
    showEmail: source.showEmail ?? DEFAULT_PRIVACY.showEmail,
    showActivity: source.showActivity ?? DEFAULT_PRIVACY.showActivity,
  };
}

function normalizeProfile(input: unknown): ProfileExtras {
  const source = input && typeof input === 'object' ? (input as Partial<ProfileExtras>) : {};
  return {
    bio: source.bio ?? DEFAULT_PROFILE_EXTRAS.bio,
    location: source.location ?? DEFAULT_PROFILE_EXTRAS.location,
    website: source.website ?? DEFAULT_PROFILE_EXTRAS.website,
  };
}

async function upsertSetting(userId: number, key: string, value: unknown): Promise<void> {
  const [existing] = await db
    .select({ id: userSettings.id })
    .from(userSettings)
    .where(and(eq(userSettings.userId, userId), eq(userSettings.key, key)))
    .limit(1);

  if (existing?.id) {
    await db
      .update(userSettings)
      .set({ value })
      .where(eq(userSettings.id, existing.id));
    return;
  }

  await db.insert(userSettings).values({ userId, key, value });
}

/**
 * GET /api/users/settings
 * Get persisted user settings for notifications/privacy/profile extras
 */
const getSettingsHandler = async () => {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return errorResponse('Unauthorized', 401);
    }

    const userId = Number.parseInt(session.user.id, 10);
    if (!Number.isInteger(userId) || userId <= 0) {
      return errorResponse('Invalid user session', 400);
    }

    const notifications = normalizeNotifications(
      await getSetting<NotificationPrefs>(userId, 'notification_preferences')
    );
    const privacy = normalizePrivacy(await getSetting<PrivacyPrefs>(userId, 'privacy_settings'));
    const profile = normalizeProfile(await getSetting<ProfileExtras>(userId, 'profile_extras'));

    return successResponse({ notifications, privacy, profile });
  } catch (error) {
    console.error('Error fetching user settings:', error);
    return errorResponse('Internal server error', 500);
  }
};

export const GET = withApiTrace('/api/users/settings', async (_request, _context) =>
  getSettingsHandler()
);

/**
 * PUT /api/users/settings
 * Persist user settings for notifications/privacy/profile extras
 */
const putSettingsHandler = async (request: NextRequest) => {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return errorResponse('Unauthorized', 401);
    }

    const userId = Number.parseInt(session.user.id, 10);
    if (!Number.isInteger(userId) || userId <= 0) {
      return errorResponse('Invalid user session', 400);
    }

    const validation = await validateRequestBody(request, userSettingsUpdateSchema);
    if (!validation.success) {
      return validation.response;
    }

    const body = validation.data as {
      notifications?: Partial<NotificationPrefs>;
      privacy?: Partial<PrivacyPrefs>;
      profile?: Partial<ProfileExtras>;
    };

    if (body.notifications) {
      const existing = await getSetting<NotificationPrefs>(userId, 'notification_preferences');
      await upsertSetting(userId, 'notification_preferences', {
        ...normalizeNotifications(existing),
        ...body.notifications,
      });
    }

    if (body.privacy) {
      const existing = await getSetting<PrivacyPrefs>(userId, 'privacy_settings');
      await upsertSetting(userId, 'privacy_settings', {
        ...normalizePrivacy(existing),
        ...body.privacy,
      });
    }

    if (body.profile) {
      const existing = await getSetting<ProfileExtras>(userId, 'profile_extras');
      await upsertSetting(userId, 'profile_extras', {
        ...normalizeProfile(existing),
        ...body.profile,
      });
    }

    return successResponse({ ok: true });
  } catch (error) {
    console.error('Error saving user settings:', error);
    return errorResponse('Internal server error', 500);
  }
};

export const PUT = withApiTrace('/api/users/settings', async (request, _context) =>
  putSettingsHandler(request)
);
