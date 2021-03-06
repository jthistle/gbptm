export const PREFERENCES_KEY = 'preferences';
const { REACT_APP_BUNDLE_BRANDING } = process.env;

export default {
  viewport: {
    mobile: 567,
  },
  analyticsId:
    process.env.NODE_ENV === 'production' ? 'UA-52513593-1' : 'UA-111111111-1',
  nearestRadius: 20000, // meters
  nearestListLimit: 5,
  initialZoom: 16,
  minZoom: 12,
  maxZoom: 18,
  editMinZoom: 16,
  allowAddEditLoo: true,
  showBackButtons: false,
  fallbackLocation: {
    // Trafalgar Square. Because.
    lat: 51.507351,
    lng: -0.127758,
  },
  getStage() {
    if (process.env.NODE_ENV === 'production') {
      if (window.location.hostname === 'www.toiletmap.org.uk') {
        return 'production';
      }

      return 'staging';
    }

    return process.env.NODE_ENV;
  },
  getSettings(namespace) {
    return JSON.parse(localStorage.getItem(namespace) || '{}');
  },
  getSetting(namespace, key, defaultVal) {
    const val = this.getSettings(namespace)[key];

    return val === undefined ? defaultVal : val;
  },
  setSetting(namespace, key, val) {
    var settings = this.getSettings(namespace);
    settings[key] = val;
    localStorage.setItem(namespace, JSON.stringify(settings));
  },
  setSettings(namespace, obj = {}) {
    localStorage.setItem(
      namespace,
      JSON.stringify({
        ...this.getSettings(namespace),
        ...obj,
      })
    );
  },
  shouldShowSponsor() {
    if (REACT_APP_BUNDLE_BRANDING === 'false') {
      return false;
    }
    return true;
  },
};
