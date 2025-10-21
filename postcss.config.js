export default {
  plugins: {
    autoprefixer: {
      // Target browsers for autoprefixer
      overrideBrowserslist: [
        // Modern browsers
        'last 2 versions',
        // iOS Safari - important for your use case
        'iOS >= 12',
        'Safari >= 12',
        // Other mobile browsers
        'Android >= 6',
        'ChromeAndroid >= 64',
        // Desktop browsers
        'Chrome >= 64',
        'Firefox >= 60',
        'Edge >= 16',
        // Still support some older browsers
        '> 1%',
        'not dead'
      ]
    }
  }
}