export const AUTH_COOKIE_NAME = "liftlytics_session";

type AuthUser = {
  username: string;
  password: string;
};

function getConfiguredUsers(): AuthUser[] {
  const users: AuthUser[] = [];
  const suffixes = ["", "_2", "_3", "_4"];

  for (const suffix of suffixes) {
    const username = process.env[`BASIC_AUTH_USERNAME${suffix}`];
    const password = process.env[`BASIC_AUTH_PASSWORD${suffix}`];

    if (username && password) {
      users.push({ username, password });
    }
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
