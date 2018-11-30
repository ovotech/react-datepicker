const Jasmine = require('jasmine');
const Enzyme = require('enzyme');
const Adapter = require('enzyme-adapter-react-16');
const { MockBrowser, MockStorage } = require('mock-browser').mocks;
const jsdom = require('jsdom');
const { SpecReporter } = require('jasmine-spec-reporter');

const { JSDOM } = jsdom;
const jasmineInstance = new Jasmine();
Enzyme.configure({ adapter: new Adapter() });

jasmineInstance.loadConfigFile('spec/support/jasmine.json');
jasmineInstance.configureDefaultReporter({
  showColors: false
});
jasmineInstance.clearReporters();
jasmineInstance.addReporter(new SpecReporter({
  spec: {
    displayPending: true
  }
}));

// Mock window / document
// We have to include JSDOM rather than relying on MockBrowser because the PR that fixed
// being able to pass a URL to document wasn't done in the best way :(
// https://github.com/darrylwest/mock-browser/pull/7/files
const doc = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
  url: 'https://example.test/'
});

global.spies = {
  scrollIntoView: jasmine.createSpy('scrollIntoView')
};

doc.window.ga = () => {};

doc.window.HTMLElement.prototype.scrollIntoView = global.spies.scrollIntoView;
doc.window.HTMLCanvasElement.prototype.getContext = () => ({
  fillRect: () => {},
  clearRect: () => {},
  getImageData: (x, y, w, h) => ({
    data: new Array(w * h * 4)
  }),
  putImageData: () => {},
  createImageData: () => [],
  setTransform: () => {},
  drawImage: () => {},
  save: () => {},
  fillText: () => {},
  restore: () => {},
  beginPath: () => {},
  moveTo: () => {},
  lineTo: () => {},
  closePath: () => {},
  stroke: () => {},
  translate: () => {},
  scale: () => {},
  rotate: () => {},
  arc: () => {},
  fill: () => {},
  measureText: () => ({
    width: 0
  }),
  transform: () => {},
  rect: () => {},
  clip: () => {}
});

const mockBrowser = new MockBrowser({
  window: doc.window
});
global.window = mockBrowser.getWindow();
global.document = mockBrowser.getDocument();
global.localStorage = new MockStorage();
global.navigator = {
  userAgent: 'node.js'
};

process.env.NODE_ENV = 'test';

jasmineInstance.execute();
