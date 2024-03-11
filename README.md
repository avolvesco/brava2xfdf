# xrlToXfdf

A node application to convert Brava markup files (xrl) to the xfdf format. Entry point is `node-xrlToXfdf.js`. It currently suppors .xod, .pdf and image files, along with the associated markup (.xrl) file.

## How to install

```
npm install
```

## How to build

```
npm run build
cd build
npm install
```

## How to run

### Option #1

For xod and pdf documents, the width and height of each page can automatically be retrieved.

```
node node-xrlToXfdf.js --document=sample.pdf --xrl=sample.xrl
```

```
node node-xrlToXfdf.js --document=sample.xod --xrl=sample.xrl
```

For other document types, the width and height cannot be automatically retrieved. You must provide the width, height.

```
node node-xrlToXfdf.js --xrl=sample.xrl --width=842 --height=595
```

----------

### Option #2 - WebViewer Server

Use WebViewer Server to automatically retrieve other documents' heights. See supported file formats here: https://www.pdftron.com/documentation/web/guides/file-format-support/

Guide on setting up your own WebViewer Server:
https://www.pdftron.com/documentation/web/guides/wv-server-deployment/

```
node node-xrlToXfdf.js --document=sample.pdf --xrl=sample.xrl --webViewerServerUrl=https://example.server.com
```

## Options

### Port number

If not set then it defaults to 8080
```
node node-xrlToXfdf.js --document=sample.pdf --port=3006
```

### Output xfdf file name

If not set then the default `out.xfdf` is used
```
node node-xrlToXfdf.js --document=sample.pdf --xrl=sample.xrl --outXfdf=out-file.xfdf
```

### Output bookmarks file name

If not set then the default `bookmarks.json` is used
```
node node-xrlToXfdf.js --document=sample.pdf --xrl=sample.xrl --outBookmarks=myBookmarks.json
```

### Changing Text Annotation Size

To manipulate the size of text annotations, the optional scale parameter is used.

```
node node-xrlToXfdf.js --document=sample.pdf --xrl=sample.xrl --scale=0.25
```

### Changing Text Annotation Alignment

To manipulate the alignment of text in freetext annotations, the optional alignment parameter is used. Argument options = L, R, or C for Left, Right, or Center. Note: Center is used by default.

```
node node-xrlToXfdf.js --document=sample.pdf --xrl=sample.xrl --alignment=L
```

### Running conversion in the browser

`xrlToXfdf.min.js` can be used directly used in the browser. It exposes a the function `xrlToXfdf(inputXrlString, pageInfos)` on the `window`.

`inputXrlString` is the contents of an .xrl markup file for annotations.

`pageInfos` is an array consisting of objects with the width, height and rotation of each page. Use the `getPageInfo` function on the document object to get the width and height. (https://www.pdftron.com/api/web/CoreControls.Document.html)

Use getPageRotation on the document object to get the page rotation in degrees.

The function will return a promise that resolves with the output xfdf string. Example:

```
window.xrlToXfdf('markup xrl content...', [{width: 595, height: 842, pageRotation: 0}, ...])
  .then(({ xfdf: xfdfString }) => {
    // do something here...
  });
```
