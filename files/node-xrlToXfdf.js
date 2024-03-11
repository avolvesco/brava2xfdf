const puppeteer = require('puppeteer');
const fs = require('fs');
const http = require('http');
const parseUrl = require('parseurl');
const send = require('send');
const path = require('path');
const argv = require('minimist')(process.argv.slice(2));

console.log("Parsed Arguments:", argv);

const inputXrlPath = argv.xrl;
const documentPath = argv.document;
const outXfdf = argv.outXfdf || 'out.xfdf';
const outBookmarks = argv.outBookmarks || 'bookmarks.json';
const providedWidth = argv.width;
const providedHeight = argv.height;
const providedScale = argv.scale;
const providedTextAlignment = argv.alignment;
const { webViewerServerUrl } = argv;

if (!inputXrlPath) {
  throw new Error('Missing input xrl path');
}

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  page.on('console', msg => console.log('PAGE LOG:', msg.text()));

  page.on("pageerror", (err) => {
    const theTempValue = err.toString();
    console.log('----------------------------');
    console.log(`Page error: ${theTempValue}`);
    console.log('----------------------------');
    browser.close();
    process.exit();
  });

  const inputXrlStr = await new Promise((resolve) => {
    fs.readFile(path.resolve(__dirname, inputXrlPath), (err, data) => {
      if (err) {
        throw err;
      }
      resolve(data.toString());
    });
  });

  const server = http.createServer((req, res) => {
    send(req, parseUrl(req).pathname, { root: __dirname, cacheControl: false })
      .pipe(res);
  });
  server.listen(8080);
  await page.goto('http://localhost:8080');

  const { xfdf: outputXfdf, bookmarks: outputBookmarks } = await page.evaluate(async (inputXrlStr, documentPath, providedWidth, providedHeight, providedTextAlignment, providedScale, webViewerServerUrl) => {
    console.log("inside page.evaluate ", providedTextAlignment);
    try {const { Core } = window.parent;
    Core.setWorkerPath('./lib/core');
    Core.disableEmbeddedJavaScript();

    const extension = (documentPath && documentPath.slice((documentPath.lastIndexOf(".") - 1 >>> 0) + 2)) || '';
    let doc;
    const isXod = extension === 'xod';
    let loadViewer = true;

    const response = await fetch(`./${documentPath}`);
    const blob = await response.blob();
    if (webViewerServerUrl && !isXod) {
      console.log("Running with webviewer server. Do not use for images (jpg/png). WebViewer server returns incorrect width and height for those types.");
      doc = await Core.createDocument(blob, { extension, pdftronServer: webViewerServerUrl });
    } else if (['xod', 'pdf', 'jpeg', 'jpg', 'png'].includes(extension)) {
      doc = await Core.createDocument(blob, { extension });
    } else {
      loadViewer = false;
    }

    if (loadViewer) {
      const pageCount = doc.getPageCount();
      // Get OCG layers
      const ocgLayers = await doc.getLayersArray();
      const pageInfos = [];
      for (let i = 1; i <= pageCount; i++) {
        let { width, height } = doc.getPageInfo(i);
        const pageRotationDegree = doc.getPageRotation(i);

        if (isXod) {
          [width, height] = [width * (3 / 4), height * (3 / 4)];
        }
        pageInfos.push({ width, height, pageRotationDegree, alignment: providedTextAlignment, scale: providedScale, ocgLayers });
      }

      return window.xrlToXfdf(inputXrlStr, pageInfos, extension, providedTextAlignment, providedScale);
    }

    if (!providedWidth || !providedHeight) {
      throw new Error(`Unknown file extension: ${extension}. Supported extensions: 'pdf', 'xod'. To load this file type, please provide the document's width and height. If you do not know them, then use WebViewer server url option found in the README.md.`);
    }

    return window.xrlToXfdf(inputXrlStr, [{ width: providedWidth, height: providedHeight, alignment: providedTextAlignment, scale: providedScale }], extension, providedTextAlignment, providedScale);
  } catch (e) {
    throw new Error(e);
  }
  }, inputXrlStr, documentPath, providedWidth, providedHeight, providedTextAlignment, providedScale, webViewerServerUrl);

  const xfdfFilepath = path.resolve(__dirname, outXfdf);
  await new Promise((resolve) => {
    fs.writeFile(xfdfFilepath, outputXfdf, (err) => {
      if (err) throw err;
      console.log(`The xfdf file ${xfdfFilepath} was succesfully saved!`);
      resolve();
    });
  });

  const bookmarksFilepath = path.resolve(__dirname, outBookmarks);
  await new Promise((resolve) => {
    fs.writeFile(bookmarksFilepath, outputBookmarks, (err) => {
      if (err) throw err;
      console.log(`The bookmarks file ${bookmarksFilepath} was succesfully saved!`);
      resolve();
    });
  });

  browser.close();
  process.exit();
})();
