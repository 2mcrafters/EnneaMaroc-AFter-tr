const APP_HASH_PREFIX = "#/app";
const LOGIN_HASH_PREFIX = "#/login";

const ensureLeadingHash = (hash: string) => {
  if (!hash || hash === "" || hash === "#") {
    return "#/";
  }
  if (hash.startsWith("#/")) {
    return hash;
  }
  if (hash.startsWith("#")) {
    return `#/${hash.slice(1)}`;
  }
  return `#/${hash.replace(/^\//, "")}`;
};

export const isLoginHash = (hash: string) => {
  const normalized = ensureLeadingHash(hash);
  return normalized === LOGIN_HASH_PREFIX || normalized.startsWith(`${LOGIN_HASH_PREFIX}/`);
};

export const stripAppHashPrefix = (hash: string) => {
  const normalized = ensureLeadingHash(hash);

  if (normalized === APP_HASH_PREFIX || normalized === `${APP_HASH_PREFIX}/`) {
    return "#/";
  }

  if (normalized.startsWith(`${APP_HASH_PREFIX}/`)) {
    return `#/${normalized.slice((APP_HASH_PREFIX + "/").length)}`;
  }

  return normalized;
};

export const ensureAppHashPrefix = (hash: string) => {
  const normalized = ensureLeadingHash(hash);

  if (normalized === "#/" || isLoginHash(normalized)) {
    return normalized;
  }

  if (normalized.startsWith(APP_HASH_PREFIX)) {
    if (normalized === APP_HASH_PREFIX) {
      return `${APP_HASH_PREFIX}/`;
    }
    return normalized;
  }

  if (normalized.startsWith("#/")) {
    return `${APP_HASH_PREFIX}${normalized.slice(2)}`;
  }

  return `${APP_HASH_PREFIX}/${normalized.replace(/^#\/?/, "")}`;
};
