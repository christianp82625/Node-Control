/**
 * Created by aldo on 1/16/14.
 */
exports.config = {
  seleniumAddress: 'http://localhost:4444/wd/hub',

  // Do not start a Selenium Standalone sever - only run this using chrome.
//  seleniumServerJar: 'node_modules/protractor/selenium/selenium-server-standalone-2.39.0.jar',
  chromeOnly: true,
  chromeDriver: './node_modules/protractor/selenium/chromedriver',

  specs: ['test/e2e/**/*.js'],

  baseUrl: 'https://localhost:3002',

  // Options to be passed to Jasmine-node.
  jasmineNodeOpts: {
    showColors: true, // Use colors in the command line report.
    defaultTimeoutInterval: 80000
  }
}