export const AUTH_COOKIE_NAME = "liftlytics_session";

type AuthUser = {
  username: string;
  password: string;
};

function getConfiguredUsers(): AuthUser[] {
  const users: AuthUser[] = [];

  if (process.env.BASIC_AUTH_USERNAME && process.env.BASIC_AUTH_PASSWORD) {
    users.push({
      username: process.env.BASIC_AUTH_USERNAME,
      password: process.env.BASIC_AUTH_PASSWORD
    });
  }

  if (process.env.BASIC_AUTH_USERNAME_2 && process.env.BASIC_AUTH_PASSWORD_2) {
    users.push({
      username: process.env.BASIC_AUTH_USERNAME_2,
      password: process.env.BASIC_AUTH_PASSWORD_2
    });
  }

  return users;
}

function createAuthToken(username: string, password: string) {
  return btoa(`${username}:${password}`);
}

export function authIsConfigured() {
  return getConfiguredUsers().length > 0;
}

export function getExpectedAuthTokens() {
  return getConfiguredUsers().map((user) => createAuthToken(user.username, user.password));
}

export function credentialsAreValid(username: string, password: string) {
  return getConfiguredUsers().some((user) => user.username === username && user.password === password);
}

export function createSessionToken(username: string, password: string) {
  if (!credentialsAreValid(username, password)) {
    return null;
  }

  return createAuthToken(username, password);
}
