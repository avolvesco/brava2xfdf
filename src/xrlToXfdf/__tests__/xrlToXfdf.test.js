import puppeteer from 'puppeteer';
import jimp from 'jimp';
import '../xrlToXfdf'; // So that jest recognizes changes in those files.

const baseTestServerUrl = 'http://localhost:3006';
const baseTestFilesPath = 'tests';
const screenshotsPath = 'src/xrlToXfdf/__tests__/screenshots';
const basePath = `${screenshotsPath}/base`;
const currentPath = `${screenshotsPath}/current`;
const diffPath = `${screenshotsPath}/diff`;

const util = require('util');
const exec = util.promisify(require('child_process').exec);

let browser;
let page;
beforeAll(async () => {
  jest.setTimeout(30000);
  browser = await puppeteer.launch();
  page = await browser.newPage();
  await page.setViewport({
    width: 800,
    height: 600,
  });
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on("pageerror", (err) => {
    console.log('----------------------------');
    console.error(err);
    console.log('----------------------------');
  });
  return exec(`rm -rf ${currentPath}/* && rm -rf ${diffPath}/*`);
});

afterAll(async () => {
  await browser.close();
});

const afterPageComplete = async () => {
  await page.waitForFunction('window.docViewer !== undefined');
  return page.evaluate(async () => {
    return new Promise((resolve) => {
      window.docViewer.on('pageComplete', () => {
        resolve();
      });
    });
  });
};

const afterImportAndDraw = async () => {
  return page.evaluate(async () => {
    return new Promise((resolve) => {
      window.addEventListener(
        'import',
        async () => {
          await window.docViewer.getAnnotationManager().drawAnnotations(1);
          resolve();
        },
        false,
      );
    });
  });
};

const convertAndCompareImage = async (docName, markupName, imageName, generateBase) => {
  await page.goto(`${baseTestServerUrl}/?doc=${baseTestFilesPath}/${docName}&markup=${baseTestFilesPath}/${markupName}`);
  await Promise.all([
    afterPageComplete(),
    afterImportAndDraw(),
  ]);

  if (generateBase) {
    await page.screenshot({ path: `${basePath}/${imageName}`, type: 'png' });
  } else {
    await page.screenshot({ path: `${currentPath}/${imageName}`, type: 'png' });
    const currentScreenshot = await jimp.read(`${currentPath}/${imageName}`);
    const baseScreenshot = await jimp.read(`${basePath}/${imageName}`);
    const diff = jimp.diff(currentScreenshot, baseScreenshot);
    if (diff.percent >= 0.00001) {
      await diff.image.writeAsync(`${diffPath}/${imageName}`);
      throw new Error('Images are different');
    }
  }
};

const generateBase = false;
test('Image-jpg-load', () => convertAndCompareImage('jpeg.jpeg', 'jpeg.xrl', 'Image-jpg-load.png', generateBase));
test('Image-png-load', () => convertAndCompareImage('png.png', 'png.xrl', 'Image-png-load.png', generateBase));
test('allmarkups', () => convertAndCompareImage('allmarkups.pdf', 'allmarkups.xrl', 'allmarkups.png', generateBase));
test('rotation', () => convertAndCompareImage('rotation.pdf', 'rotation.xrl', 'rotation.xrl.png', generateBase));
test('Rotation with rotation text', () => convertAndCompareImage('rotation/p.pdf', 'rotation/p.xrl', 'p.png', generateBase));
test('Text to freetext', () => convertAndCompareImage('pdf-for-tests.pdf', 'Text.xrl', 'Text-to-freetext.png', generateBase));
test('Image to stamp', () => convertAndCompareImage('pdf-for-tests.pdf', 'Image.xrl', 'Image-to-stamp.png', generateBase));
test('Lines', () => convertAndCompareImage('pdf-for-tests.pdf', 'Lines.xrl', 'Lines.png', generateBase));
test('Polygons', () => convertAndCompareImage('pdf-for-tests.pdf', 'Polygons.xrl', 'Polygons.png', generateBase));
test('Polylines', () => convertAndCompareImage('pdf-for-tests.pdf', 'Polylines.xrl', 'Polylines.png', generateBase));
test('Ellipse', () => convertAndCompareImage('pdf-for-tests.pdf', 'Ellipse.xrl', 'Ellipse.png', generateBase));
test('Highlight', () => convertAndCompareImage('pdf-for-tests.pdf', 'Highlight.xrl', 'Highlight.png', generateBase));
test('Strikeout', () => convertAndCompareImage('pdf-for-tests.pdf', 'Strikeout.xrl', 'Strikeout.png', generateBase));
test('Underline', () => convertAndCompareImage('pdf-for-tests.pdf', 'Underline.xrl', 'Underline.png', generateBase));
test('Cloud', () => convertAndCompareImage('pdf-for-tests.pdf', 'Cloud.xrl', 'Cloud.png', generateBase));
test('Changemark to Text', () => convertAndCompareImage('pdf-for-tests.pdf', 'Changemark.xrl', 'Changemark.png', generateBase));
test('SignatureX', () => convertAndCompareImage('pdf-for-tests.pdf', 'SignatureX.xrl', 'SignatureX.png', generateBase));
test('SignatureY', () => convertAndCompareImage('pdf-for-tests.pdf', 'SignatureY.xrl', 'SignatureY.png', generateBase));
