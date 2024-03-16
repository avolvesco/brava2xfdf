//converting but not perfectly

// run "parcel build xrlToXfdf.js --no-source-maps"
// and modify it by adding window.xrlToXfdf to export function
import {
  find,
  chunk,
  orderBy,
  forEach,
  filter,
  every,
  some,
  minBy,
} from 'lodash';

import {
  mod,
  lineTypeProxy,
  getImageDimensions,
  rgbToHex,
  setXfdfAttributes,
  setXfdfAttributes2,
  setXfdfAttributesBare,
  assert,
  getAttributeValue,
  getRotationRadFromMatrix,
  getNearestRotationDegreeFromRad,
  multiplyMatrices,
} from './utils';

const getConvertedPoint = ({ x, y }, { pageConversion = { x: 1, y: 1 }, matrix = [] }) => {
  // a b h
  // c d v

  const shiftX = 0;
  const shiftY = 0;
  // Identity Matrix is 1|0|0|1|0|0
  const [m_a = 1, m_b = 0, m_c = 0, m_d = 1, t_x = 0, t_y = 0] = matrix;

  const convertedX = (((m_a * x) + (m_c * y) + t_x) / pageConversion.x) + shiftX;
  const convertedY = (((m_b * x) + (m_d * y) + t_y) / pageConversion.y) + shiftY;
  return { x: convertedX, y: convertedY };
};

const applyMatrixToPoints = ({
  points: unConvertedPoints,
  pageConversion,
  matrix,
  isText = false,
  CDLInfo = {},
  oldVersionFix = true,
}) => {
  let rotationDegree = getNearestRotationDegreeFromRad(getRotationRadFromMatrix(matrix));
  let points = [];
  unConvertedPoints.forEach((unConvertedPoint) => {
    const _unConvertedPoint = { ...unConvertedPoint };

    const { x, y } = getConvertedPoint(
      _unConvertedPoint,
      {
        pageConversion,
        matrix,
      },
    );
    points.push({ x, y });
  });

  const xPoints = points.map((point) => point.x);
  const yPoints = points.map((point) => point.y);
  let minX = Math.min(...xPoints);
  let maxX = Math.max(...xPoints);
  let minY = Math.min(...yPoints);
  let maxY = Math.max(...yPoints);

  const {
    v1 = {}, v2 = {}, v3 = {}, v4 = {},
  } = CDLInfo;
  const isOldVersion = v1.textContent === '5' && v2.textContent === '3' && v3.textContent === '0' && v4.textContent === '99';

  if (!isText || !oldVersionFix || !isOldVersion) {
    return {
      points,
      rectPoints: {
        minX,
        minY,
        maxX,
        maxY,
      },
      rotationDegree,
    };
  }

  const diffY = (maxY - minY);
  let shiftX = 0;
  let shiftY = 0;

  shiftY += diffY;
  if (unConvertedPoints.length === 4) {
    const context = {
      pageConversion,
      matrix,
    };
    const uP1x = unConvertedPoints[0].x;
    const uP2x = unConvertedPoints[1].x;
    const point1 = getConvertedPoint(unConvertedPoints[0], context);
    const point4 = getConvertedPoint(unConvertedPoints[3], context);
    if (uP1x > uP2x) {
      shiftY = -(point1.y - point4.y);
      rotationDegree = 180;
    }
  }

  if (rotationDegree === 90 || rotationDegree === 270) {
    [shiftX, shiftY] = [shiftY, shiftX];
  }

  minX -= shiftX;
  maxX -= shiftX;
  minY -= shiftY;
  maxY -= shiftY;

  points = points.map((point) => {
    return {
      x: point.x - shiftX,
      y: point.y - shiftY,
    };
  });

  return {
    points,
    rectPoints: {
      minX,
      minY,
      maxX,
      maxY,
    },
    rotationDegree,
  };
};

const getConvertedPoints = (unConvertedPoints, {
  pageConversion,
  pageRotationMatrix,
  matrix,
  isText = false,
  CDLInfo = {},
}) => {
  const { points, rotationDegree } = applyMatrixToPoints({
    points: unConvertedPoints,
    // This is so we don't actually apply the conversion for the first matrix.
    // Otherwise we would apply conversion twice when we apply the rotation
    // matrix
    pageConversion: { ...pageConversion, x: 1, y: 1 },
    matrix,
    isText,
    CDLInfo,
  });

  const obj = applyMatrixToPoints({
    points,
    pageConversion,
    matrix: pageRotationMatrix,
    isText,
    CDLInfo,
    oldVersionFix: false,
  });

  obj.rotationDegree = mod((obj.rotationDegree + rotationDegree), 360);
  return obj;
};

const getConvertedPointsFromNode = (br_node, context) => {
  const br_points = br_node.getElementsByTagName('Point');

  const { bravaPage, DriverInfo } = context;
  const { left, bottom } = bravaPage;

  const isCADFile = DriverInfo.toLowerCase() === 'dwg2dl' || DriverInfo.toLowerCase() === 'dgn2dl';

  const unConvertedPoints = [];
  forEach(br_points, (br_point) => {
    const [br_xNode] = br_point.getElementsByTagName('x');
    const [br_yNode] = br_point.getElementsByTagName('y');

    const x = parseFloat(br_xNode.textContent, 10) - (isCADFile ? left : 0);
    const y = parseFloat(br_yNode.textContent, 10) - (isCADFile ? bottom : 0);

    unConvertedPoints.push({
      x,
      y,
    });
  });
  return getConvertedPoints(unConvertedPoints, context);
};

const createNodeWithVertices = async (
  context,
  br_node,
  outType,
  style = {},
) => {
  const { pageIndex, outXfdfDoc, authorName } = context;

  const { points, rectPoints } = getConvertedPointsFromNode(br_node, context);

  const [firstPoint] = points;
  let verticesContent = '';
  forEach(points, ({ x, y }) => {
    verticesContent += `${x},${y};`;
  });
  // Needed for cloud
  if (firstPoint && outType === 'polygon') {
    verticesContent += `${firstPoint.x},${firstPoint.y};`;
  }
  // remove last semicolon
  verticesContent = verticesContent.slice(0, -1);
  const {
    minX,
    minY,
    maxX,
    maxY,
  } = rectPoints;

  const timeAttr = br_node.getAttribute("time")
  const creationTimeAttr = br_node.getAttribute("creationtime");
  if (!creationTimeAttr && timeAttr) {
    br_node.setAttribute("creationtime", br_node.getAttribute("time")); // Replace with appropriate default
  }

  const creationtime = br_node.attributes.creationtime
  const time = br_node.attributes.time.nodeValue;

  // Get the creation and modified date
  let creationdateFormated = "";
  let dateFormated = "";

  // creationtime is a Unix timestamp
  let dateC = new Date(creationtime * 1000);

  let monthC = dateC.getMonth();
  if (monthC.toString().length === 1)
    monthC = "0" + monthC;

  creationdateFormated = "D:" + dateC.getFullYear() + monthC + dateC.getDay() + dateC.getHours() + dateC.getMinutes() + dateC.getSeconds() + "-08'00'";

  // time is a Unix timestamp
  let date = new Date(time * 1000);

  let month = date.getMonth();
  if (month.toString().length === 1)
    month = "0" + month;

  dateFormated = "D:" + date.getFullYear() + month + date.getDay() + date.getHours() + date.getMinutes() + date.getSeconds() + "-08'00'";


  const xfdf_node = outXfdfDoc.createElement(outType);
  setXfdfAttributes(
    {
      page: pageIndex,
      title: authorName,
      rect: `${minX},${minY},${maxX},${maxY}`,
      ...style,
      creationdate: creationdateFormated,
      date: dateFormated
    },
    br_node.attributes,
    xfdf_node,
    context,
  );

  const xfdf_verticesNode = outXfdfDoc.createElement('vertices');
  xfdf_verticesNode.appendChild(outXfdfDoc.createTextNode(verticesContent));
  xfdf_node.appendChild(xfdf_verticesNode);
  return xfdf_node;
};

const createEllipse = async (context, br_ellipseNode) => {
  const {
    pageIndex, outXfdfDoc, authorName, matrix,
  } = context;

  const [br_matrixNode] = br_ellipseNode.getElementsByTagName('Matrix');
  const ellipseMatrix = br_matrixNode.textContent.split('|').map((n) => parseFloat(n, 10));
  const { rectPoints, rotationDegree } = getConvertedPointsFromNode(br_ellipseNode, {
    ...context,
    // This is for grouping.
    matrix: multiplyMatrices(matrix, ellipseMatrix),
  });

  const {
    minX,
    minY,
    maxX,
    maxY,
  } = rectPoints;

  const diffY = maxY - minY;
  const diffX = maxX - minX;

  const creationtime = br_ellipseNode.attributes.creationtime.nodeValue;
  const time = br_ellipseNode.attributes.time.nodeValue;

  // Get the creation and modified date
  let creationdateFormated = "";
  let dateFormated = "";

  // creationtime is a Unix timestamp
  let dateC = new Date(creationtime * 1000);

  let monthC = dateC.getMonth();
  if (monthC.toString().length === 1)
    monthC = "0" + monthC;

  creationdateFormated = "D:" + dateC.getFullYear() + monthC + dateC.getDay() + dateC.getHours() + dateC.getMinutes() + dateC.getSeconds() + "-08'00'";

  // time is a Unix timestamp
  let date = new Date(time * 1000);

  let month = date.getMonth();
  if (month.toString().length === 1)
    month = "0" + month;

  dateFormated = "D:" + date.getFullYear() + month + date.getDay() + date.getHours() + date.getMinutes() + date.getSeconds() + "-08'00'";

  //Calculate the correct rect for the circle based on the page rotation
  var size = { minX: minX, minY: minY, maxX: maxX, maxY: maxY };
  switch (context.pageRotationDegree) {
	case 90:
	  size.maxX = size.maxX + diffX;
	  break;
	case 270:
	  size.minX = size.minX - diffX;
	  break;
	case 180:
	  size.maxY = size.maxY + diffY;
	  break;
	default:
	  size.minY = size.minY - diffY;
	  break;
   }
	
  const xfdf_circleNode = outXfdfDoc.createElement('circle');
  setXfdfAttributes(
    {
      page: pageIndex,
      title: authorName,
      rect: `${size.minX},${(size.minY)},${size.maxX},${size.maxY}`,
    },
    br_ellipseNode.attributes,
    xfdf_circleNode,
    context,
  );
  return xfdf_circleNode;
};

const createLine = async (context, br_line, headType = '') => {
  const { pageIndex, outXfdfDoc, authorName } = context;

  const { points, rectPoints } = getConvertedPointsFromNode(br_line, context);

  const {
    minX,
    minY,
    maxX,
    maxY,
  } = rectPoints;
  const [p1, p2] = points;

  const timeAttr = br_line.getAttribute("time")
  const creationTimeAttr = br_line.getAttribute("creationtime");
  if (!creationTimeAttr && timeAttr) {
    br_line.setAttribute("creationtime", br_line.getAttribute("time")); // Replace with appropriate default
  }

  const xfdf_line = outXfdfDoc.createElement('line');
  setXfdfAttributes(
    {
      page: pageIndex,
      title: authorName,
    },
    br_line.attributes,
    xfdf_line,
    context,
  );

  xfdf_line.setAttribute('start', `${p1.x},${p1.y}`);
  xfdf_line.setAttribute('end', `${p2.x},${p2.y}`);
  // Not necessary. WV does not seem to care about rect. It uses start and end instead.
  xfdf_line.setAttribute('rect', `${minX},${minY},${maxX},${maxY}`);
  if (headType) {
    xfdf_line.setAttribute('head', headType);
  } else {
    const { arrowtype1: arrowType1Attr, arrowtype2: arrowType2Attr } = br_line.attributes;
    const arrowType1 = arrowType1Attr && arrowType1Attr.value;
    const arrowType2 = arrowType2Attr && arrowType2Attr.value;
    if (arrowType1) {
      xfdf_line.setAttribute('head', lineTypeProxy[arrowType1]);
    }
    if (arrowType2) {
      xfdf_line.setAttribute('tail', lineTypeProxy[arrowType2]);
    }
  }
  return xfdf_line;
};

const createFreeTextNode = async (context, br_text) => {
  const {
    pageIndex,
    pageConversion,
    outXfdfDoc,
    authorName,
    bravaHeight,
    isImage,
    wvHeight,
    outputScale,
    textAlignment,
    matrix,
    DriverInfo,
  } = context;

  // Check if there are any Matrix elements
  const matrixNodes = br_text.getElementsByTagName('Matrix');

  let textMatrix;

  if (matrixNodes.length === 0) {
    // Create a new Matrix element with default value and append to br_text
    const defaultMatrix = document.createElement('Matrix');
    defaultMatrix.textContent = '1|0|0|1|0|0';
    br_text.appendChild(defaultMatrix);

    // Use the default Matrix value
    textMatrix = [1, 0, 0, 1, 0, 0];
  } else {
    // Use the existing Matrix value
    const br_matrixNode = matrixNodes[0]; // Get the first (and presumably only) Matrix node
    textMatrix = br_matrixNode.textContent.split('|').map((n) => parseFloat(n, 10));
  }

  const { rectPoints, rotationDegree } = getConvertedPointsFromNode(br_text, {
    ...context,
    // This is for grouping
    matrix: multiplyMatrices(matrix, textMatrix),
    isText: true,
  });

  let {
    minX,
    minY,
    maxX,
    maxY,
  } = rectPoints;

  const boundingBoxHeight = maxY - minY;
  const boundingBoxWidth = maxX - minX;
  const imageFontSizeMagicFactor = 1 / (700 / wvHeight);
  // Empirically calculated Font size factor
  const FONTSIZE_MAGIC_NUM2 = (68 / 1.06556) * imageFontSizeMagicFactor;
  const FONTSIZE_MAGIC_NUM = (wvHeight / 10.37354);

  const {
    color: colorAttr,
    secondarycolor: secondaryColorAttr,
    font: fontAttr,
    fontsize: fontsizeAttr,
    opaque: opaqueAttr,
  } = br_text.attributes;
  const xfdf_freetext = outXfdfDoc.createElement('freetext');

  //adding creationtime logic
  const timeAttr = br_text.getAttribute("time")
  const creationTimeAttr = br_text.getAttribute("creationtime");
  if (!creationTimeAttr && timeAttr) {
    br_text.setAttribute("creationtime", br_text.getAttribute("time")); // Replace with appropriate default
  }
  let fontVal = fontsizeAttr.value;

  const thresholds = [
    { limit: 0.005, multiplier: 0.5 },
    { limit: 0.01, multiplier: 0.575 },
    { limit: 0.015, multiplier: 0.6 },
    { limit: 0.02, multiplier: 0.275 },
    { limit: 0.025, multiplier: 0.3 },
    { limit: 0.035, multiplier: 0.3375 },
    { limit: 0.05, multiplier: 0.375 },
    { limit: 0.07, multiplier: 0.4 },
    { limit: 0.09, multiplier: 0.45 },
    { limit: 0.125, multiplier: 0.5 },
    { limit: 0.15, multiplier: 0.525 },
    { limit: 0.2, multiplier: 0.55 },
    { limit: 0.3, multiplier: 0.6 },
    { limit: 0.4, multiplier: 0.65 },
    { limit: 0.5, multiplier: 0.675 },
    { limit: 0.6, multiplier: 0.7 },
    { limit: 0.8, multiplier: 0.725 },
    { limit: 1, multiplier: 0.75 }
  ];

  let adjustedFontSize = fontVal;

  //Uses the font size limits and multipliers to adjust the font size based on arbitrary values to make the fonts the right size
  //the check for boundingBoxHeight of 40 is to prevent the font from behaving weirdly when the bounding box is too big
  for (let threshold of thresholds) {
    if (fontVal < threshold.limit) {
      adjustedFontSize = (boundingBoxWidth < 40) && (boundingBoxHeight < 40) ? (fontVal * boundingBoxHeight) * threshold.multiplier : fontVal;
      break;
    }
  }

  let FontSize = isImage ? adjustedFontSize * FONTSIZE_MAGIC_NUM2 : adjustedFontSize * FONTSIZE_MAGIC_NUM;
  if (outputScale) {
    FontSize *= outputScale;
  }

  const isCADFile = DriverInfo.toLowerCase() === 'dwg2dl' || DriverInfo.toLowerCase() === 'dgn2dl';
  // For cad files having a really small fontsize.
  if (isCADFile) {
    FontSize *= 150;
  }

  let copyAttributes = {
    page: pageIndex,
    title: authorName,
    rect: `${minX},${minY},${maxX},${maxY}`,
    subject: 'FreeText',
    TextColor: `#${rgbToHex(...colorAttr.value.split('|'))}`,
    FontSize,
    width: "0", // border always applied. So, set it to zero by default.
    rotation: rotationDegree,
  };

  if (opaqueAttr.value === 'secondarycolor') {
    copyAttributes = {
      ...copyAttributes,
      color: `#${rgbToHex(...secondaryColorAttr.value.split('|'))}`,
      // Special case: If document is an image.
      // Then the width of free text is a factor of bravaHeight
      // Test file: png.png and png.xrl

      // TODO: This does not depend on height
      // because dividing both heights just makes it a constant.
      // Look into really tall images and really short images
      width: `${isImage ? 1 / (pageConversion.y * (700 / bravaHeight)) : 1}`,
    };
  } else if (opaqueAttr.value === 'hide') {
    copyAttributes = {
      ...copyAttributes,
      color: `#${rgbToHex(255, 255, 255)}`,
    };
  }

  setXfdfAttributes2(
    copyAttributes,
    br_text.attributes,
    xfdf_freetext,
    context,
  );

  const br_textLines = br_text.getElementsByTagName('TextLine');
  let textContent = '';
  forEach(br_textLines, (br_textLine) => {
    textContent = (textContent && `${textContent}\n${br_textLine.textContent}`) || br_textLine.textContent;
  });
  const xfdf_contentsNode = outXfdfDoc.createElement('contents');
  xfdf_contentsNode.textContent = textContent;
  const xfdf_defaultappearanceNode = outXfdfDoc.createElement('defaultappearance');
  let defaultAppearanceText = '';
  colorAttr.value.split('|').forEach((v) => {
    defaultAppearanceText = `${defaultAppearanceText}${(parseInt(v, 10) / 255)} `;
  });
  defaultAppearanceText += 'rg';
  xfdf_defaultappearanceNode.textContent = defaultAppearanceText;
  const xfdf_defaultstyleNode = outXfdfDoc.createElement('defaultstyle');

  switch (textAlignment) {
    case 'L':
      xfdf_defaultstyleNode.textContent = `font: '${fontAttr.value}'; text-align: left;`;
      break;
    case 'R':
      xfdf_defaultstyleNode.textContent = `font: '${fontAttr.value}'; text-align: right;`;
      break;
    default:
      xfdf_defaultstyleNode.textContent = `font: '${fontAttr.value}'; text-align: center;`;
      break;
  }

  xfdf_freetext.appendChild(xfdf_contentsNode);
  xfdf_freetext.appendChild(xfdf_defaultappearanceNode);
  xfdf_freetext.appendChild(xfdf_defaultstyleNode);

  return xfdf_freetext;
};

var conversation_global;

const createChangemarkReply = async (context, br_raster) => {
  //read in XRL attributes
  const { pageIndex, outXfdfDoc } = context;

  const creationtime = br_raster.attributes.creationtime.nodeValue;
  const time = br_raster.attributes.time.nodeValue;

  const br_reply = find(br_raster.childNodes, { nodeName: 'Reply' });
  const br_replyAuthor = find(br_raster.childNodes, { nodeName: 'ReplyAuthor' });
  const br_stateOverride = find(br_raster.childNodes, { nodeName: 'StateOverride' });
  const br_categoryOverride = find(br_raster.childNodes, { nodeName: 'CategoryOverride' });

  // Get the creation and modified date
  let creationdateFormated = "";
  let dateFormated = "";

  // creationtime is a Unix timestamp
  let dateC = new Date(creationtime * 1000);

  let monthC = dateC.getMonth();
  if (monthC.toString().length === 1)
    monthC = "0" + monthC;

  creationdateFormated = "D:" + dateC.getFullYear() + monthC + dateC.getDay() + dateC.getHours() + dateC.getMinutes() + dateC.getSeconds() + "-08'00'";

  // time is a Unix timestamp
  let date = new Date(time * 1000);

  let month = date.getMonth();
  if (month.toString().length === 1)
    month = "0" + month;

  dateFormated = "D:" + date.getFullYear() + month + date.getDay() + date.getHours() + date.getMinutes() + date.getSeconds() + "-08'00'";

  const xfdf_text = outXfdfDoc.createElement('text');

  setXfdfAttributes(
    {
      page: pageIndex,
      color: '#FFFF00',
      flags: 'print,nozoom,norotate',
      title: br_replyAuthor.textContent,
      subject: br_reply.textContent,
      icon: 'Comment',
      inreplyto: conversation_global,
      creationDate: creationdateFormated,
      date: dateFormated
    },
    br_raster.attributes,
    xfdf_text,
    context,
  );
  const xfdf_contents = outXfdfDoc.createElement('contents');
  xfdf_contents.textContent = br_reply.textContent + "\n" + br_categoryOverride.textContent + ", " + br_stateOverride.textContent;
  xfdf_text.appendChild(xfdf_contents);
  return xfdf_text;

}


const createSignature = async (context, br_signature, instance) => {
  const { pageIndex, outXfdfDoc, authorName } = context;

  const { rectPoints } = getConvertedPointsFromNode(br_signature, context);

  const {
    minX,
    minY,
    maxX,
    maxY,
  } = rectPoints;

  const br_image = find(br_signature.childNodes, { nodeName: 'image' });
  const xfdf_stampNode = outXfdfDoc.createElement('stamp');

  if (br_image === undefined) {
    console.warn("No signature image data found.");
    return;
  }

  let imageData;
  if (br_image !== undefined && br_image.textContent !== undefined) {
    imageData = br_image.textContent;
  }

  //const imageData = br_image.textContent;
  const { width: imageWidth, height: imageHeight } = await getImageDimensions(imageData);
  const tX = maxX - minX;
  const tY = maxY - minY;
  const scaleFactorOY = tY / imageHeight;
  const scaleFactorOX = tX / imageWidth;

  const scaleFactorMax = Math.max(scaleFactorOX, scaleFactorOY);

  const scaleFactorX = scaleFactorMax / scaleFactorOX;
  const scaleFactorY = scaleFactorMax / scaleFactorOY;

  const tOX = tX / scaleFactorY;
  const tOY = tY / scaleFactorX;

  const diffX = tX - tOX;
  const diffY = tY - tOY;

  const creationtime = br_signature.attributes.creationtime.nodeValue;
  const time = br_signature.attributes.time.nodeValue;

  // Get the creation and modified date
  let creationdateFormated = "";
  let dateFormated = "";

  // creationtime is a Unix timestamp
  let dateC = new Date(creationtime * 1000);

  let monthC = dateC.getMonth();
  if (monthC.toString().length === 1)
    monthC = "0" + monthC;

  creationdateFormated = "D:" + dateC.getFullYear() + monthC + dateC.getDay() + dateC.getHours() + dateC.getMinutes() + dateC.getSeconds() + "-08'00'";

  // time is a Unix timestamp
  let date = new Date(time * 1000);

  let month = date.getMonth();
  if (month.toString().length === 1)
    month = "0" + month;

  dateFormated = "D:" + date.getFullYear() + month + date.getDay() + date.getHours() + date.getMinutes() + date.getSeconds() + "-08'00'";

  setXfdfAttributes(
    {
      page: pageIndex,
      rect: `${minX + (diffX / 2)},${minY + (diffY / 2)},${maxX - (diffX / 2)},${maxY - (diffY / 2)}`,
      title: authorName,
      subject: 'Stamp',
      creationDate: creationdateFormated,
      date: dateFormated
    },
    br_signature.attributes,
    xfdf_stampNode,
    context,
  );
  const xfdf_imageDataNode = outXfdfDoc.createElement('imagedata');

  xfdf_imageDataNode.textContent = `${imageData}`;

  xfdf_stampNode.appendChild(xfdf_imageDataNode);
  return xfdf_stampNode;
};

const createStampNode = async (context, br_raster, isChangeView = false, ocgLayers) => {
  const { pageIndex, outXfdfDoc, inXrlDoc, authorName } = context;

  if (isChangeView === false) {
    const br_idTextNode = find(br_raster.childNodes, { nodeType: Node.TEXT_NODE });
    const br_foundImageNode = inXrlDoc.querySelector(`Image[guid="${br_idTextNode.textContent.replace(/^\s+|\s+$/g, '')}"]`);
    const [br_matrixNode] = br_raster.getElementsByTagName('Matrix');

    const imageMatrix = br_matrixNode.textContent.split('|').map(n => parseFloat(n, 10));
    const imageData = `data:${'image/png'};base64,${br_foundImageNode.textContent.replace(/=+$/, '')}`;
    const { width: imageWidth, height: imageHeight } = await getImageDimensions(imageData);

    const points = [
      { x: 0, y: 0 }, // bottom-left point
      { x: imageWidth, y: imageHeight }, // top-right point
    ];
    const { rectPoints, rotationDegree } = getConvertedPoints(points, {
      ...context,
      // This is for grouping.
      matrix: multiplyMatrices(context.matrix, imageMatrix),
    });

    const {
      minX,
      minY,
      maxX,
      maxY,
    } = rectPoints;

    const timeAttr = br_raster.getAttribute("time")
    const creationTimeAttr = br_raster.getAttribute("creationtime");
    if (!creationTimeAttr && timeAttr) {
      br_raster.setAttribute("creationtime", br_raster.getAttribute("time")); // Replace with appropriate default
    }

    const creationtime = br_raster.attributes.creationtime.nodeValue;
    const time = br_raster.attributes.time.nodeValue;

    // Get the creation and modified date
    let creationdateFormated = "";
    let dateFormated = "";

    // creationtime is a Unix timestamp
    let dateC = new Date(creationtime * 1000);

    let monthC = dateC.getMonth();
    if (monthC.toString().length === 1)
      monthC = "0" + monthC;

    creationdateFormated = "D:" + dateC.getFullYear() + monthC + dateC.getDay() + dateC.getHours() + dateC.getMinutes() + dateC.getSeconds() + "-08'00'";

    // time is a Unix timestamp
    let date = new Date(time * 1000);

    let month = date.getMonth();
    if (month.toString().length === 1)
      month = "0" + month;

    dateFormated = "D:" + date.getFullYear() + month + date.getDay() + date.getHours() + date.getMinutes() + date.getSeconds() + "-08'00'";

    const xfdf_stampNode = outXfdfDoc.createElement('stamp');

    setXfdfAttributes(
      {
        page: pageIndex,
        rect: `${minX},${minY},${maxX},${maxY}`,
        title: authorName,
        subject: 'Stamp',
        rotation: rotationDegree,
        creationDate: creationdateFormated,
        date: dateFormated,
      },
      br_raster.attributes,
      xfdf_stampNode,
      context,
    );
    const xfdf_imageDataNode = outXfdfDoc.createElement('imagedata');
    // TODO: Get encoding?
    xfdf_imageDataNode.textContent = imageData;
    xfdf_stampNode.appendChild(xfdf_imageDataNode);

    return xfdf_stampNode;

  } else {
    // br_node here is br_raster
    const { points, rectPoints } = getConvertedPointsFromNode(/*br_node*/ br_raster, context);

    const pageZoomNode = br_raster.getElementsByTagName('ScaleFactor');
    let pageZoom;
    if (pageZoomNode[0] !== undefined)
      pageZoom = parseFloat(pageZoomNode[0].innerHTML) * 10.0;
    else
      pageZoom = 100;

    let {
      minX,
      minY,
      maxX,
      maxY,
    } = rectPoints;

    // Get the OCG layers
    const viewstate = find(br_raster.childNodes, { nodeName: 'Viewstate' });

    // viewstate
    // LayerTable -> LayerCount
    const layerTable = find(viewstate.childNodes, { nodeName: 'LayerTable' });

    // LayerBlock is an integer that needs to be
    // converted to binary and a bitmask applied
    // to find out which OCG layer is turned on or off
    const layerBlock = find(layerTable.childNodes, { nodeName: 'LayerBlock' });
    let ocgValue = parseInt(layerBlock.innerHTML);
    let ocgBit = (ocgValue >>> 0).toString(2);

    let ocgLayerArray = [];
    for (let i = ocgBit.length - 1; i > ocgBit.length - layerTable.attributes.LayerCount.value - 2; i--) {
      if (ocgBit[i] === '1')
        ocgLayerArray.push(true);
      else if (ocgBit[i] === '0')
        ocgLayerArray.push(false);
    }


    // Get the title and creation time from the original Brava markup.
    const br_title = br_raster.getElementsByTagName('Title');
    let title;
    if (br_title[0] !== undefined) {
      title = br_title[0].textContent;
    }
    else {
      title = 'My ChangeMark';
      console.warn(`ChangeMark on page ${pageIndex} does not have a title, using default title.`);
    }
    // eslint-disable-next-line no-param-reassign
    const creationtime = br_raster.attributes.creationtime.nodeValue;
    const time = br_raster.attributes.time.nodeValue;

    // Get the creation and modified date
    let creationdateFormated = "";
    let dateFormated = "";

    // creationtime is a Unix timestamp
    let dateC = new Date(creationtime * 1000);

    let monthC = dateC.getMonth();
    if (monthC.toString().length === 1)
      monthC = "0" + monthC;

    creationdateFormated = "D:" + dateC.getFullYear() + monthC + dateC.getDay() + dateC.getHours() + dateC.getMinutes() + dateC.getSeconds() + "-08'00'";

    // time is a Unix timestamp
    let date = new Date(time * 1000);

    let month = date.getMonth();
    if (month.toString().length === 1)
      month = "0" + month;

    dateFormated = "D:" + date.getFullYear() + month + date.getDay() + date.getHours() + date.getMinutes() + date.getSeconds() + "-08'00'";

    const xfdf_stampNode = outXfdfDoc.createElement('stamp');
    setXfdfAttributes(
      {
        page: pageIndex,
        rect: `${minX},${minY},${maxX},${maxY}`,
        //title: "ChangeView " + authorName,
        name: (Math.random() + 1).toString(36).substring(7),
        title: authorName,
        subject: 'Stamp',
        //isChangeView: ocgLayerArray,
        //rotation: rotationDegree,
        //pagePosition: `${minX},${minY},${maxX},${maxY}`,
        ocgLayers: ocgLayerArray,
        creationdate: creationdateFormated,
        date: dateFormated
      },
      br_raster.attributes,
      xfdf_stampNode,
      context,
    );

    const xfdf_imageDataNode = outXfdfDoc.createElement('imagedata');
    // TODO: Get encoding?
    //xfdf_imageDataNode.textContent = imageData;
    // xfdf_imageDataNode.textContent = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iMjAiIGZpbGw9InJnYigwLCAwLCAwKSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4gPGc+IDxwYXRoIGlkPSJzdmdfMSIgZD0ibTEzLjM5MTYxLDAuNDYxNTRjLTEuMTAzLDAgLTIsMC44OTcgLTIsMmwwLDEyYzAsMS4xMDMgMC44OTcsMiAyLDJsMy41ODYsMGwzLjQxNCwzLjQxNGwzLjQxNCwtMy40MTRsMy41ODYsMGMxLjEwMywwIDIsLTAuODk3IDIsLTJsMCwtMTJjMCwtMS4xMDMgLTAuODk3LC0yIC0yLC0ybC0xNCwwem0xNCwxNGwtNC40MTQsMGwtMi41ODYsMi41ODZsLTIuNTg2LC0yLjU4NmwtNC40MTQsMGwwLC0xMmwxNCwwbDAsMTJ6Ii8+IDxwYXRoIGlkPSJzdmdfMiIgZD0ibTE5LjM5MTYxLDQuNDYxNTRsMiwwbDAsNmwtMiwwbDAsLTZ6bTAsN2wyLDBsMCwybC0yLDBsMCwtMnoiLz4gPC9nPjwvc3ZnPg==';
    xfdf_stampNode.appendChild(xfdf_imageDataNode);

    const trnCustomData = outXfdfDoc.createElement('trn-custom-data');

    // loop through and add all OCG layers to the annotation
    let ocgLayersObjectArray = [];
    //for(let i = 0; i < ocgLayerArray.length; i++){

    // If the file was saved in brava, chances are high
    // the layers are grouped into a new parent layer.
    // use ocgLayers[0] instead of ocgLayers
    // TODO: Handle nested OCG layers

    /*if(ocgLayers[0] !== undefined){
      if(ocgLayers[0].children !== undefined){
        if(ocgLayers[0].children.length > 0){
          ocgLayers = ocgLayers[0].children;
        }
      }
    }

    for(let i = 0; i < ocgLayers.length; i++){
      let ocgLayer = {
        name: ocgLayers[i].name,
        obj: ocgLayers[i].obj,
        visible: ocgLayerArray[i]
      }
      ocgLayersObjectArray.push(ocgLayer);
    }*/

    // Start the function createOcgLayersObjectArray with ocgLayers array, and initial indices i and j both set to 0
    createOcgLayersObjectArray(ocgLayers, 0, 0);

    let i = 0;
    let j = 0;
    // Declare createOcgLayersObjectArray, taking three parameters: ocgLayers (expected to be an array), and two indices i and j
    function createOcgLayersObjectArray(ocgLayers, i, j) {


      // Check if ocgLayers has length
      if (ocgLayers.length) {
        // If ocgLayers has no length, return immediately
        if (ocgLayers.length === 0)
          return;

        // If the index i is equal or larger than the length of ocgLayers, return immediately
        if (i >= ocgLayers.length)
          return;
      }

      /*if(ocgLayers.length > 0)
        console.log("createOcgLayersObjectArray " + ocgLayers[i].name + " " +  i);
      else{
        console.log("no name");
        return;
      }*/

      // Check if ocgLayers exists
      if (!ocgLayers)
        return;

      // Check if the element at index i of ocgLayers exists
      if (!ocgLayers[i])
        return;

      // Check if the element at index i of ocgLayers has a property 'name'
      if (ocgLayers[i].name) {
        /*let ocgLayer = {
          name: ocgLayers[i].name,
          obj: ocgLayers[i].obj,
          visible: ocgLayerArray[j]
        }*/

        // If the element at index i of ocgLayers has a property 'obj'
        if (ocgLayers[i].obj) {
          // Set the 'visible' property of the element at index i of ocgLayers to the element at index j of ocgLayerArray
          ocgLayers[i].visible = ocgLayerArray[j];
          // Increment j by 1
          j++;
        }

        //Push ocgLayer to ocgLayersObjectArray
        ocgLayersObjectArray.push(ocgLayers[i]);
      }

      // Check if the element at index i of ocgLayers has a property 'children'
      if (ocgLayers[i].children) {
        // If it does, recursively call createOcgLayersObjectArray with the 'children' of the element at index i of ocgLayers, with new index for i set to 0, and the current value of j
        createOcgLayersObjectArray(ocgLayers[i].children, 0, j);
      }

      // Recursively call createOcgLayersObjectArray with ocgLayers, with i incremented by 1, and the current value of j
      createOcgLayersObjectArray(ocgLayers, ++i, j);
    }

    // Also add additional everything else from the XRL to the
    // annotation (customData field) even though it won't be displayed
    // in the WebViewer.
    const br_state = find(br_raster.childNodes, { nodeName: 'State' });
    const state = br_state.textContent;

    const br_state_color = find(br_raster.childNodes, { nodeName: 'StateColor' });
    const stateColor = br_state_color.textContent;

    const br_category = find(br_raster.childNodes, { nodeName: 'Category' });
    const category = br_category.textContent;


    const id = br_raster.attributes.id.nodeValue;
    const guid = br_raster.attributes.guid.nodeValue;
    const color = br_raster.attributes.color.nodeValue;
    const hyperlink = br_raster.attributes.hyperlink.nodeValue;
    const comment = br_raster.attributes.comment.nodeValue;

    // Add everything to the custom view of the annotation.
    trnCustomData.setAttribute('bytes', '{"ImageData": "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iMjAiIGZpbGw9InJnYigwLCAwLCAwKSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4gPGc+IDxwYXRoIGlkPSJzdmdfMSIgZD0ibTEzLjM5MTYxLDAuNDYxNTRjLTEuMTAzLDAgLTIsMC44OTcgLTIsMmwwLDEyYzAsMS4xMDMgMC44OTcsMiAyLDJsMy41ODYsMGwzLjQxNCwzLjQxNGwzLjQxNCwtMy40MTRsMy41ODYsMGMxLjEwMywwIDIsLTAuODk3IDIsLTJsMCwtMTJjMCwtMS4xMDMgLTAuODk3LC0yIC0yLC0ybC0xNCwwem0xNCwxNGwtNC40MTQsMGwtMi41ODYsMi41ODZsLTIuNTg2LC0yLjU4NmwtNC40MTQsMGwwLC0xMmwxNCwwbDAsMTJ6Ii8+IDxwYXRoIGlkPSJzdmdfMiIgZD0ibTE5LjM5MTYxLDQuNDYxNTRsMiwwbDAsNmwtMiwwbDAsLTZ6bTAsN2wyLDBsMCwybC0yLDBsMCwtMnoiLz4gPC9nPjwvc3ZnPg==","pagePosition":"[0,0,910,781]", "pageZoom":"' + pageZoom + '","offset" : 0, "PageNumber":"' + pageIndex + '", "isChangeView": "true", "ocgLayerArray" : "' + ocgLayers + ', ", "trn-viewstate" : {"layers" : ' + JSON.stringify(ocgLayers) + ', "rotation" : 0, "zoom" : ' + pageZoom + '}, "state" : "' + state + '", "stateColor" : "' + stateColor + '", "category" : "' + category + '", "author" : "' + authorName + '", "id" : "' + id + '", "creationtime" : "' + creationtime + '", "time" : "' + time + '", "guid" : "' + guid + '", "color" : "' + color + '", "hyperlink" : "' + hyperlink + '", "comment" : "' + comment + '"}');
    xfdf_stampNode.appendChild(trnCustomData);

    // Also add the original comment from Brava to the XFDF.
    const xfdf_contents = outXfdfDoc.createElement('contents');
    const br_comment = find(br_raster.childNodes, { nodeName: 'Comment' });
    xfdf_contents.textContent = br_comment.textContent;
    xfdf_stampNode.appendChild(xfdf_contents);
    conversation_global = xfdf_stampNode.attributes.name.textContent;
    return xfdf_stampNode;
  }
};

const createHighlight = async (context, br_highlight) => {
  const { pageIndex, outXfdfDoc, authorName } = context;

  const { points, rectPoints } = getConvertedPointsFromNode(br_highlight, context);

  const {
    minX,
    minY,
    maxX,
    maxY,
  } = rectPoints;

  let coords = '';
  forEach(chunk(points, 4), (fourPoints) => {
    assert(fourPoints.length === 4, `Invalid number of points. Expected 4 got ${fourPoints.length}`);
    const orderedFourPoints = orderBy(fourPoints, ['y', 'x'], ['desc', 'asc']);
    let subCoordsStr = '';
    forEach(orderedFourPoints, ({ x, y }) => {
      subCoordsStr = (subCoordsStr && `${subCoordsStr},${x},${y}`) || `${x},${y}`;
    });
    coords = (coords && `${coords},${subCoordsStr}`) || subCoordsStr;
  });

  const creationtime = br_highlight.attributes.creationtime.nodeValue;
  const time = br_highlight.attributes.time.nodeValue;

  // Get the creation and modified date
  let creationdateFormated = "";
  let dateFormated = "";

  // creationtime is a Unix timestamp
  let dateC = new Date(creationtime * 1000);

  let monthC = dateC.getMonth();
  if (monthC.toString().length === 1)
    monthC = "0" + monthC;

  creationdateFormated = "D:" + dateC.getFullYear() + monthC + dateC.getDay() + dateC.getHours() + dateC.getMinutes() + dateC.getSeconds() + "-08'00'";

  // time is a Unix timestamp
  let date = new Date(time * 1000);

  let month = date.getMonth();
  if (month.toString().length === 1)
    month = "0" + month;

  dateFormated = "D:" + date.getFullYear() + month + date.getDay() + date.getHours() + date.getMinutes() + date.getSeconds() + "-08'00'";

  const xfdf_highlight = outXfdfDoc.createElement('highlight');
  setXfdfAttributes(
    {
      page: pageIndex,
      rect: `${minX},${minY},${maxX},${maxY}`,
      coords,
      subject: 'Highlight',
      title: authorName,
      opacity: 0.5,
      creationDate: creationdateFormated,
      date: dateFormated
    },
    br_highlight.attributes,
    xfdf_highlight,
    context,
  );
  return xfdf_highlight;
};

const createGeometryGroup = async (context, br_geometryGroup) => {
  const { pageIndex, outXfdfDoc, authorName } = context;
  const { points, rectPoints } = getConvertedPointsFromNode(br_geometryGroup, context);
  const {
    minX,
    minY,
    maxX,
    maxY,
  } = rectPoints;

  const geometryDataArr = [];
  const br_geometryArr = br_geometryGroup.getElementsByTagName('Geometry');
  let i = 0;
  forEach(br_geometryArr, (br_geometry) => {
    const [br_type] = br_geometry.getElementsByTagName('Type');
    const [br_pointCount] = br_geometry.getElementsByTagName('PointCount');
    const nPoints = parseInt(br_pointCount.textContent, 10);
    assert(nPoints > 0, `Invalid number for value <PointCount>: ${nPoints}. Unable to continue this annotation.`);
    const subPoints = points.slice(i, i + nPoints);
    assert(subPoints.length >= nPoints, `Not enough <Point> nodes available. Expected at least ${nPoints}. Unable to continue this annotation.`);
    geometryDataArr.push({
      type: br_type.textContent,
      points: subPoints,
    });
    i += nPoints;
  });

  const createTextOverlayNode = ({ nodeName, subject, geometryFilterType }) => {
    const xfdf_textOverlay = outXfdfDoc.createElement(nodeName);
    const filteredGeometryArr = filter(geometryDataArr, { type: geometryFilterType });
    // Coords are a groups of four points per text line
    let coords = '';
    forEach(filteredGeometryArr, ({ points: fourPoints }) => {
      assert(fourPoints.length === 4, `Invalid number of points for node with type ${geometryFilterType}. Expected 4, got ${fourPoints.length}`);
      const orderedFourPoints = orderBy(fourPoints, ['y', 'x'], ['desc', 'asc']);
      let subCoordsStr = '';
      forEach(orderedFourPoints, ({ x, y }) => {
        subCoordsStr = (subCoordsStr && `${subCoordsStr},${x},${y}`) || `${x},${y}`;
      });
      coords = (coords && `${coords},${subCoordsStr}`) || subCoordsStr;
    });

    setXfdfAttributes(
      {
        page: pageIndex,
        rect: `${minX},${minY},${maxX},${maxY}`,
        title: authorName,
        coords,
        subject,
        ...(nodeName === 'highlight' && { opacity: 0.5 }),
      },
      br_geometryGroup.attributes,
      xfdf_textOverlay,
      context,
    );
    return xfdf_textOverlay;
  };

  // Assumption: if there is a single highlightpolygon then assume
  // this is a highlight
  if (some(geometryDataArr, { type: 'highlightpolygon' })) {
    return createTextOverlayNode({
      nodeName: 'highlight',
      subject: 'Highlight',
      geometryFilterType: 'highlightpolygon',
    });
  }

  // TODO: Add test for ink
  // Assumption: if there are only polylines then make an ink
  if (every(geometryDataArr, { type: 'polyline' })) {
    const xfdf_ink = outXfdfDoc.createElement('ink');
    const xfdf_inklist = outXfdfDoc.createElement('inklist');
    xfdf_ink.appendChild(xfdf_inklist);

    forEach(geometryDataArr, ({ points: geometryPoints }) => {
      const xfdf_gesture = outXfdfDoc.createElement('gesture');
      let gestureContent = '';
      forEach(geometryPoints, ({ x, y }) => {
        gestureContent += `${x},${y};`;
      });
      // removes last semicolon
      gestureContent = gestureContent.slice(0, -1);
      xfdf_gesture.textContent = gestureContent;
      xfdf_inklist.appendChild(xfdf_gesture);
    });

    setXfdfAttributes(
      {
        page: pageIndex,
        rect: `${minX},${minY},${maxX},${maxY}`,
        title: authorName,
        flags: 'print',
        subject: 'annotation.freeHand',
      },
      br_geometryGroup.attributes,
      xfdf_ink,
      context,
    );
    return xfdf_ink;
  }

  // Assumption: if there is at least single polyline then assume
  // this is an underline or strikethrough
  if (some(geometryDataArr, { type: 'polyline' })) {
    const [polyLineGeometry1, invispolyGeometry1] = geometryDataArr;
    if (minBy(invispolyGeometry1.points, 'y').y === minBy(polyLineGeometry1.points, 'y').y) {
      return createTextOverlayNode({
        nodeName: 'underline',
        subject: 'Underline',
        geometryFilterType: 'invispoly',
      });
    }
    return createTextOverlayNode({
      nodeName: 'strikeout',
      subject: 'Strikeout',
      geometryFilterType: 'invispoly',
    });
  }
  throw new Error(`Unknown geometry group: ${geometryDataArr}`);
};

const createRedact = async (context, br_blockout) => {
  const { pageIndex, outXfdfDoc, authorName } = context;
  const { points, rectPoints } = getConvertedPointsFromNode(br_blockout, context);

  let verticesContent = '';
  forEach(points, ({ x, y }) => {
    verticesContent += `${x},${y};`;
  });
  // remove last semicolon
  verticesContent = verticesContent.slice(0, -1);

  const {
    minX,
    minY,
    maxX,
    maxY,
  } = rectPoints;

  const xfdf_redact = outXfdfDoc.createElement('polygon');
  setXfdfAttributes(
    {
      page: pageIndex,
      // Not necessary. WV does not seem to care about rect. It uses vertices content instead.
      rect: `${minX},${minY},${maxX},${maxY}`,
      title: authorName,
      flags: 'print',
      subject: 'Redact',
      opacity: '0.5',
      'interior-color': '#000000',
    },
    br_blockout.attributes,
    xfdf_redact,
    context,
  );

  const xfdf_verticesNode = outXfdfDoc.createElement('vertices');
  xfdf_verticesNode.appendChild(outXfdfDoc.createTextNode(verticesContent));
  xfdf_redact.appendChild(xfdf_verticesNode);
  return xfdf_redact;
};

const createLink = async (context, br_annot) => {
  const { pageIndex, outXfdfDoc } = context;

  const { rectPoints } = getConvertedPointsFromNode(br_annot, context);
  const {
    minX,
    minY,
    maxX,
    maxY,
  } = rectPoints;

  const xfdf_link = outXfdfDoc.createElement('link');

  setXfdfAttributesBare(
    {
      page: pageIndex,
      rect: `${minX},${minY},${maxX},${maxY}`,
      color: '#000000',
      width: '0',
      style: 'solid',
    },
    xfdf_link,
  );
  const xfdf_OnActivation = outXfdfDoc.createElement('OnActivation');
  const xfdf_Action = outXfdfDoc.createElement('Action');
  xfdf_Action.setAttribute('Trigger', 'U');
  const xfdf_URI = outXfdfDoc.createElement('URI');
  xfdf_URI.setAttribute('Name', br_annot.attributes.hyperlink.value);
  xfdf_Action.appendChild(xfdf_URI);
  xfdf_OnActivation.appendChild(xfdf_Action);
  xfdf_link.appendChild(xfdf_OnActivation);
  return xfdf_link;
};

const addBookmark = (bookmarks, pageIndex, br_bookmark) => {
  let title = 'My bookmark';
  const br_title = find(br_bookmark.childNodes, { nodeName: 'Title' });
  if (br_title) {
    title = br_title.textContent;
  } else {
    console.warn(`bookmark on page ${pageIndex} does not have a title, using default title.`);
  }
  // eslint-disable-next-line no-param-reassign
  bookmarks[pageIndex] = title;
};

const processAnnot = (br_annot, context, topContext, bookmarks) => {
  const nodePromises = [];

  let nodePromise;
  const { pageIndex } = topContext;

  if (br_annot.nodeName === 'Group') {
    const br_elements = br_annot.getElementsByTagName('Elements')[0];
    const [br_matrixNode] = br_annot.getElementsByTagName('Matrix');
    const { attributes } = br_annot;
    const groupId = attributes && attributes.guid && attributes.guid.value;

    let { matrix } = context;
    if (br_matrixNode) {
      const groupMatrix = br_matrixNode.textContent.split('|').map((n) => parseFloat(n, 10));
      matrix = multiplyMatrices(context.matrix, groupMatrix);
    }

    const br_annot_attr = br_annot.attributes['name'];

    const authorName = (br_annot_attr == null) ? context.authorName : br_annot_attr.value;

    nodePromises.push(...processNodes(br_elements.childNodes, {
      groupId,
      matrix,
      isGroup: true,
    }, { authorName, ...topContext }, bookmarks));
  } else if (br_annot.nodeName === 'Text') {
    nodePromise = createFreeTextNode(context, br_annot);
  } else if (br_annot.nodeName === 'Raster') {
    nodePromise = createStampNode(context, br_annot);
  } else if (br_annot.nodeName === 'Line') {
    nodePromise = createLine(context, br_annot);
  } else if (br_annot.nodeName === 'ArrowLine') {
    nodePromise = createLine(context, br_annot, 'OpenArrow');
  } else if (br_annot.nodeName === 'ByzantineArrowLine') {
    nodePromise = createLine(context, br_annot);
  } else if (br_annot.nodeName === 'Ellipse') {
    nodePromise = createEllipse(context, br_annot);
  } else if (br_annot.nodeName === 'Polyline' || br_annot.nodeName === 'NonEditPolyline') {
    nodePromise = createNodeWithVertices(context, br_annot, 'polyline');
  } else if (br_annot.nodeName === 'Polygon' || br_annot.nodeName === 'NonEditPolygon') {
    nodePromise = createNodeWithVertices(context, br_annot, 'polygon');
  } else if (br_annot.nodeName === 'Cloud') {
    nodePromise = createNodeWithVertices(context, br_annot, 'polygon', { style: 'cloudy' });
  } else if (br_annot.nodeName === 'NonEditSquigle' || br_annot.nodeName === 'Squigle') {
    nodePromise = createNodeWithVertices(context, br_annot, 'polyline');
  } else if (br_annot.nodeName === 'GeometryGroup') {
    nodePromise = createGeometryGroup(context, br_annot);
  } else if (br_annot.nodeName === 'Highlight') {
    nodePromise = createHighlight(context, br_annot);
  } else if (br_annot.nodeName === 'Signature') {
    nodePromise = createSignature(context, br_annot);
  } else if (br_annot.nodeName === 'Changemark') {
    // This was changed to create ChangeView annotations.
    nodePromise = createStampNode(context, br_annot, true, ocgLayersGlobal);
  } else if (br_annot.nodeName === 'ChangemarkReply') {
    nodePromise = createChangemarkReply(context, br_annot);
  } else if (br_annot.nodeName === 'Blockout') {
    nodePromise = createRedact(context, br_annot);
  } else if (br_annot.nodeName === 'Bookmark') {
    addBookmark(bookmarks, pageIndex, br_annot);
  } else {
    console.warn(`Unknown node: ${br_annot.nodeName}. Skipping`);
  }

  if (nodePromise) {
    nodePromise = nodePromise.catch((error) => {
      console.error(`Encountered error when trying to convert node: ${br_annot.nodeName}\n`, error);
      return null;
    });
    nodePromises.push(nodePromise);
  }

  return nodePromises;
};

const processNodes = (br_annots, groupContext = {}, topContext = {}, bookmarks = {}) => {
  // Ignore #text.
  // That is whitespace that can't be stripped out because it could be around text.
  const filtered_br_annots = filter(br_annots, (o) => o.nodeName !== '#text');
  const [first_br_annot] = filtered_br_annots;
  const { isGroup } = groupContext;
  const {
    pageRotationDegree, authorName, bravaHeight, bravaWidth, pageIndex,
  } = topContext;

  let primaryAnnotationId;
  if (isGroup && first_br_annot) {
    const { attributes } = first_br_annot;
    primaryAnnotationId = attributes && attributes.guid && attributes.guid.value;
  }

  // counterclockwise
  const rotationMatrices = {
    0: [1, 0, 0, 1, 0, 0],
    90: [0, 1, -1, 0, bravaHeight, 0], // 270 degrees
    180: [-1, 0, 0, -1, bravaHeight, bravaWidth], // 180 degrees
    270: [0, -1, 1, 0, 0, bravaWidth], // 90 degrees
  };

  const rotationMatricesProxy = new window.Proxy(rotationMatrices, {
    get: (obj, degree) => {
      if (degree in obj) {
        return obj[degree];
      }
      console.warn(`Page Index ${pageIndex}: Unknown page rotation degrees (${degree}). Defaulting to using identity matrix`);
      return [1, 0, 0, 1, 0, 0];
    },
  });

  const context = {
    ...topContext,
    authorName,
    ...groupContext, // has group matrix
    primaryAnnotationId,
    pageRotationMatrix: rotationMatricesProxy[pageRotationDegree],
  };
  const nodePromises = [];

  // pre-process links
  forEach(filtered_br_annots, (br_annot) => {
    let nodePromise;

    if (br_annot.attributes.hyperlink && br_annot.attributes.hyperlink.value) {
      nodePromise = createLink(context, br_annot);
    }

    if (nodePromise) {
      nodePromise = nodePromise.catch((error) => {
        console.error(`Encountered error when trying to convert node: ${br_annot.nodeName}\n`, error);
        return null;
      });
      nodePromises.push(nodePromise);
    }
  });

  forEach(filtered_br_annots, (filtered_br_annot) => {
    nodePromises.push(...processAnnot(filtered_br_annot, context, topContext, bookmarks));
  });

  return nodePromises;
};

var ocgLayersGlobal = null;

//webScaler option added to scale fonts through use of optional parameter
//adding freeTextJustification option to specify alignment of text in free text annots. Values can be R or L, default being C for Center
const xrlToXfdf = async (inputXrlStr, pageInfos, extension, freeTextJustification = "C", webScaler = 1) => {
  // Not a great way to set the OCG layers, but since
  // the code was refactored, used this way of setting it.
  ocgLayersGlobal = pageInfos[0].ocgLayers;


  const isImage = ['png', 'jpg', 'jpeg', 'bmp', 'gif'].includes(extension);
  const baseXfdfStr = '<xfdf xmlns="http://ns.adobe.com/xfdf/" xml:space="preserve"><pdf-info xmlns="http://www.pdftron.com/pdfinfo" version="2" /></xfdf>';
  const parser = new DOMParser();
  const minifiedInput = inputXrlStr.replace(/^\s+|\s+$/g, '');
  const inXrlDoc = parser.parseFromString(minifiedInput, 'application/xml');
  const parseErrors = inXrlDoc.getElementsByTagName('parsererror');
  let outputScale = webScaler;
  let textAlignment = freeTextJustification;

  if (parseErrors.length > 0) {
    throw new Error('xrl parse error');
  }

  const outXfdfDoc = parser.parseFromString(baseXfdfStr, 'application/xml');
  const xfdf_rootNode = outXfdfDoc.getElementsByTagName('xfdf')[0];
  const xfdf_annotsNode = outXfdfDoc.createElement('annots');
  xfdf_rootNode.appendChild(xfdf_annotsNode);

  const br_CDLInfo = inXrlDoc.getElementsByTagName('CDLInfo')[0];
  const CDLInfo = br_CDLInfo.attributes;
  const DriverInfo = br_CDLInfo.getElementsByTagName('DriverInfo')[0];
  const br_pageList = inXrlDoc.getElementsByTagName('PageList')[0];
  const br_pageListNodes = (br_pageList && br_pageList.childNodes) || [];
  const br_pages = filter(br_pageListNodes, { nodeName: 'Page' });
  const nodePromises = [];
  const bookmarks = {};


  const pageInfoZero = pageInfos[0];
  if (!pageInfoZero) {
    console.error(`No page info available`);
  }

  br_pages.forEach((br_pageNode) => {
    const {
      index: indexAttr,
      right: rightAttr,
      top: topAttr,
      left: leftAttr,
      bottom: bottomAttr,
    } = br_pageNode.attributes;

    const pageIndex = parseInt(indexAttr.value, 10);
    const right = parseFloat(rightAttr.value, 10);
    const top = parseFloat(topAttr.value, 10);
    const left = parseFloat(leftAttr.value, 10);
    const bottom = parseFloat(bottomAttr.value, 10);

    const pageInfo = pageInfos[pageIndex];
    if (!pageInfo) {
      console.warn(`No page info available for page: ${pageIndex}. Using page info for first page.`);
    }
    const { width, height, pageRotationDegree = 0 } = pageInfo || pageInfoZero;

    if (!width || !height) {
      console.error(`Unexpected page info { width: ${width}, height: ${height} } for page: ${pageIndex}.`);
      return;
    }

    const bravaWidth = right - left;
    const bravaHeight = top - bottom;
    const pageConversion = { x: bravaWidth / width, y: bravaHeight / height, pageIndex };

    const br_authorList = br_pageNode.getElementsByTagName('AuthorList')[0];
    const br_authors = br_authorList.getElementsByTagName('Author');

    const topContext = {
      isImage,
      pageIndex,
      wvWidth: width,
      wvHeight: height,
      outputScale,
      textAlignment,
      bravaWidth,
      bravaHeight,
      pageConversion,
      outXfdfDoc,
      inXrlDoc,
      CDLInfo,
      DriverInfo: DriverInfo && DriverInfo.textContent,
      bravaPage: {
        left, bottom, right, top,
      },
      matrix: [1, 0, 0, 1, 0, 0], // identity matrix
      pageRotationDegree,
    };

    forEach(br_authors, (br_author) => {
      const authorName = getAttributeValue(br_author, 'name');
      const br_annots = br_author.childNodes;
      nodePromises.push(...processNodes(br_annots, {}, { authorName, ...topContext }, bookmarks));
    });
  });

  const xfdf_nodes = await Promise.all(nodePromises);
  forEach(xfdf_nodes, (xfdf_node) => {
    xfdf_node && xfdf_annotsNode.appendChild(xfdf_node);
  });
  const oSerializer = new XMLSerializer();
  return {
    xfdf: oSerializer.serializeToString(outXfdfDoc),
    bookmarks: JSON.stringify(bookmarks),
  };
};

window.xrlToXfdf = xrlToXfdf;
export default xrlToXfdf;
