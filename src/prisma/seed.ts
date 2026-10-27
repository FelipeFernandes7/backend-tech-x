let pendingSeed: Promise<void> | undefined;

async function runSeed(): Promise<void> {
  // Application users are created through POST /auth/register.
}

export function seed(): Promise<void> {
  pendingSeed ??= runSeed().catch((error: unknown) => {
    pendingSeed = undefined;
    throw error;
  });
  return pendingSeed;
}
