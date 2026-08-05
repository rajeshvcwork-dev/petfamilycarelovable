import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.lmnharvest.petfamilycare',
  appName: 'Pet Family Care',

  server: {
    url: 'https://petfamily.vip',
    cleartext: false
  },

  android: {
    allowMixedContent: false
  }
};

export default config;