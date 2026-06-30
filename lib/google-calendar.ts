import { google } from "googleapis";

const SCOPES = ["https://www.googleapis.com/auth/calendar.readonly", "https://www.googleapis.com/auth/calendar.events"];

export function getOAuth2Client() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/auth/google/callback`
  );
}

export function getAuthUrl() {
  const oauth2Client = getOAuth2Client();
  return oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
    prompt: "consent",
  });
}

export async function getCalendarClient(accessToken: string, refreshToken: string) {
  const oauth2Client = getOAuth2Client();
  oauth2Client.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken,
  });
  return google.calendar({ version: "v3", auth: oauth2Client });
}

export interface CalendarEvent {
  id: string;
  summary: string;
  start: string;
  end: string;
  description?: string;
}

export async function fetchCalendarEvents(
  accessToken: string,
  refreshToken: string,
  timeMin?: string,
  timeMax?: string
): Promise<CalendarEvent[]> {
  const calendar = await getCalendarClient(accessToken, refreshToken);

  const now = new Date();
  const defaultMin = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const defaultMax = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();

  const res = await calendar.events.list({
    calendarId: "primary",
    timeMin: timeMin || defaultMin,
    timeMax: timeMax || defaultMax,
    singleEvents: true,
    orderBy: "startTime",
    maxResults: 100,
  });

  return (res.data.items || []).map((event) => ({
    id: event.id || "",
    summary: event.summary || "Untitled",
    start: event.start?.dateTime || event.start?.date || "",
    end: event.end?.dateTime || event.end?.date || "",
    description: event.description || "",
  }));
}

export async function createCalendarEvent(
  accessToken: string,
  refreshToken: string,
  title: string,
  deadline: string,
  description?: string
) {
  const calendar = await getCalendarClient(accessToken, refreshToken);

  const deadlineDate = new Date(deadline);
  const endDate = new Date(deadlineDate.getTime() + 60 * 60 * 1000); // 1 hour

  const event = await calendar.events.insert({
    calendarId: "primary",
    requestBody: {
      summary: `[ProTrack] ${title}`,
      description: description || "Task from ProTrack",
      start: { dateTime: deadlineDate.toISOString() },
      end: { dateTime: endDate.toISOString() },
      reminders: {
        useDefault: false,
        overrides: [
          { method: "popup", minutes: 30 },
          { method: "popup", minutes: 60 },
        ],
      },
    },
  });

  return event.data;
}
