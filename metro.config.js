const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');
const exclusionList = require('metro-config/src/defaults/exclusionList');

// ---------------------------------------------------------------------------
// Watch-mode timeout fix for `react-native bundle` on Windows
// ---------------------------------------------------------------------------
// Metro's createFileMap() defaults to watch=true when ci.isCI is false (i.e.
// running locally, not on a CI server). The RN gradle plugin's
// createBundleReleaseJsAndAssets task invokes `react-native bundle` without
// passing --watch false, so Metro starts its file watcher.
//
// On Windows without @parcel/watcher (not installed) or sane (not installed),
// Metro falls back to the FallbackWatcher, which recursively walks EVERY
// directory and calls fs.watch() on each one. With ~30K files in node_modules
// alone, this exceeds Metro's 240s watch-start timeout and crashes with:
//   "Failed to start watch mode"
//   "Cannot read properties of undefined (reading 'end')"
//
// The blockList below helps with crawling, but the FallbackWatcher still
// walks node_modules because ignorePatternForWatch (derived from blockList)
// does NOT include the node_modules exclusion that ignoreForCrawl has.
//
// Fix: when the `bundle` command is detected in argv, set CI=true so
// ci-info reports isCI=true, which makes createFileMap set watch=false
// (one-time crawl only, no persistent watcher). The dev server
// (`react-native start`) is unaffected because its argv contains 'start'.
//
// This runs BEFORE ci-info is loaded (ci-info is first required by
// createFileMap.js, which is loaded after metro.config.js), so the env var
// is set in time for ci.isCI to pick it up.
if (process.argv.slice(2).includes('bundle')) {
  if (!process.env.CI) {
    process.env.CI = 'true';
  }
}

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * Additional Windows hardening:
 *  - disabling watchman (not installed here), and
 *  - blocking the heavy build/output folders from being crawled & watched.
 *
 * NOTE: patterns use forward slashes only. metro's exclusionList converts
 * each "/" to the platform path separator, so writing "[\\/]" here produces
 * an invalid regex on Windows.
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  resolver: {
    useWatchman: false,
    blockList: exclusionList([
      /.*\/android\/build\/.*/,
      /.*\/android\/app\/build\/.*/,
      /.*\/android\/\.cxx\/.*/,
      /.*\/android\/\.gradle\/.*/,
      /.*\/android\/\.kotlin\/.*/,
      /.*\/ios\/build\/.*/,
      /.*\/ios\/Pods\/.*/,
    ]),
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
