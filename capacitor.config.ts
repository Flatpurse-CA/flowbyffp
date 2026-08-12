import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.flatpurse.flow',
  appName: 'Flow',
  webDir: 'public',
  // The iOS shell loads the real production site instead of a bundled static
  // copy — flow.flatpurse.com is a full Next.js app (server actions, API
  // routes, webhooks) that a static `cap copy` export would break.
  server: {
    url: 'https://flow.flatpurse.com',
    cleartext: false,
  },
};

export default config;
