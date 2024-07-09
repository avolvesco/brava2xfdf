/* eslint-disable camelcase */
const lineTypeMap = {
  normal: 'ClosedArrow',
  circle: 'Circle',
  diamond: 'Diamond',
  line: 'OpenArrow',
  barbed: 'OpenArrow',
  slash: 'OpenArrow',
};
export const lineTypeProxy = new window.Proxy(lineTypeMap, {
  get: (obj, lineType) => {
    if (lineType in obj) {
      return obj[lineType];
    }
    console.warn(`Unknown type ${lineType}`);
    return 'OpenArrow';
  },
});

const textGroupTypeMap = {
  highlightpolygon: 'highlight',
  polyline: 'strikeout',
  invispoly: 'underline',
};

export const textGroupTypeProxy = new window.Proxy(textGroupTypeMap, {
  get: (obj, textGroupType) => {
    if (textGroupType in obj) {
      return obj[textGroupType];
    }
    console.warn(`Unknown type ${textGroupType}`);
    return null;
  },
});

export const getImageDimensions = (imageSrc) => {
  return new Promise((resolve, reject) => {
    const image = new window.Image();
    image.onload = () => {
      const { width, height } = image;
      resolve({
        width,
        height,
      });
    };
    image.onerror = () => {
      reject(new Error('Failed to load image'));
    };
    image.src = imageSrc;
  });
};

const decToHex = (num) => {
  if (Number.isNaN(parseInt(num, 10))) {
    return '00';
  }
  const hex = Number(num).toString(16);
  if (hex.length < 2) {
    return `0${hex}`;
  }
  return hex;
};

export const rgbToHex = (r, g, b) => {
  const red = decToHex(r);
  const green = decToHex(g);
  const blue = decToHex(b);
  return red + green + blue;
};

export const toXmlDate = (date) => {
  const pad = (str) => {
    if (str.length < 2) {
      return `0${str}`;
    }
    return str;
  };

  let dateStr = 'D:';
  dateStr += date.getFullYear().toString();
  dateStr += pad((date.getMonth() + 1).toString());
  dateStr += pad(date.getDate().toString());
  dateStr += pad(date.getHours().toString());
  dateStr += pad(date.getMinutes().toString());
  dateStr += pad(date.getSeconds().toString());

  let offset = date.getTimezoneOffset();
  if (offset === 0) {
    dateStr += "Z00'00'";
  } else {
    if (offset < 0) {
      dateStr += '+';
      offset *= -1;
    } else {
      dateStr += '-';
    }

    const hOffset = parseInt(offset / 60, 10);
    const mOffset = offset % 60;
    dateStr += `${pad(hOffset.toString())}'`;
    dateStr += `${pad(mOffset.toString())}'`;
  }
  return dateStr;
};

/* Old code, not being used
const guidGenerator = () => {
  const S4 = () => {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
  };
  return (`${S4()+S4()}-${S4()}-${S4()}-${S4()}-${S4()}${S4()}${S4()}`);
};
*/

export const setXfdfAttributesBare = (attributes, elementNode) => {
  Object.keys(attributes).forEach((attributeKey) => {
    const attributeValue = attributes[attributeKey];
    elementNode.setAttribute(attributeKey, attributeValue);
  });
};

const getLineWidth = (isImage, xfdf_node, linewidthAttr, wvHeight) => {
  // Special case:
  // If the document is an image then the resulting width for annotations needs to be a lot smaller
  // and is a fuction of the height of the page.
  // This is true even if the document was converted to xod.
  // TODO: Add test document

  // TODO: This does not depend on height because dividing both heights just makes it a constant.
  // Look into really tall images and really short images
  let width = 0;
  if (linewidthAttr) {
    const linestyleAttrValue = parseFloat(linewidthAttr.value, 10);
	if (xfdf_node.nodeName === "polygon") {
	  width = (linestyleAttrValue * 10 * 0.5).toFixed(1);
    } else if (isImage) {
      width = (linestyleAttrValue * 10) / (700 / wvHeight);
    } else {
      width = linestyleAttrValue * (wvHeight / 64.8096192384);
    }
  }

  // Some files have ridiculously tiny linewidth, making the annotations invisible.
  // So, we make the smallest width be 1.
  if (width <= 1) {
    width = 1;
  }
  return width;
};

const getInteriorColor = (color, drawstyleAttr) => {
  let interiorColor = {};

  if (!color || !drawstyleAttr) {
    return interiorColor;
  }

  if (drawstyleAttr.value === 'solid') {
    interiorColor = { 'interior-color': color };
  }

  if (drawstyleAttr.value === 'highlight') {
    interiorColor = { 'interior-color': color, opacity: 0.5 };
  }

  return interiorColor;
};

const getDashStyle = (linestyleAttr, drawstyleAttr, width) => {
  let dashStyle = {};
  if (!linestyleAttr || !drawstyleAttr) {
    return dashStyle;
  }
  const factor = (width || 1);

  switch (linestyleAttr.value) {
    case 'dash':
      dashStyle = { style: 'dash', dashes: `${10 * factor},${4 * factor}` };
      break;
    case 'dashdot':
      dashStyle = { style: 'dash', dashes: `${10 * factor},${3 * factor},${3 * factor},${3 * factor},${10 * factor},${3 * factor},${3 * factor},${3 * factor}` };
      break;
    case 'dot':
      dashStyle = { style: 'dash', dashes: `${4 * factor},${2 * factor}` };
      break;
    default:
      dashStyle = {};
  }

  return dashStyle;
};

const getCreationTime = (creationtimeAttr) => {
	
  const pad = (str) => {
    if (str.length < 2) {
      return `0${str}`;
    }
    return str;
  };
    
  let dateC = new Date(creationtimeAttr.nodeValue * 1000);

  let monthC = (dateC.getMonth() + 1) + "";
  if (monthC.toString().length === 1) monthC = "0" + monthC;
  else  monthC +="";
	
  let dayC = dateC.getDate()+"";
  if (dayC.toString().length === 1) dayC = "0" + dayC;
  let hourC = dateC.getHours()+"";
  if (hourC.toString().length === 1) hourC = "0" + hourC;
  let minC = dateC.getMinutes()+"";
  if (minC.toString().length === 1) minC = "0" + minC;
  let secC = dateC.getSeconds()+"";
  if (secC.toString().length === 1) secC = "0" + secC;
  let creationdateFormated = "D:" + dateC.getFullYear() + monthC + dayC + hourC + minC + secC;// + "-08'00'";
    
  let offset = dateC.getTimezoneOffset();
  if (offset === 0) {
    creationdateFormated += "+00'00'";
  } else {
    if (offset < 0) {
      creationdateFormated += '+';
      offset *= -1;
    } else {
      creationdateFormated += '-';
    }

    const hOffset = parseInt(offset / 60, 10);
    const mOffset = offset % 60;
    creationdateFormated += `${pad(hOffset.toString())}'`;
    creationdateFormated += `${pad(mOffset.toString())}'`;
  }
  
  return creationdateFormated;
}

export const setXfdfAttributes = (extraAttributes, br_attributes, xfdf_node, context = {}) => {
  const {
    primaryAnnotationId, groupId = '', isImage, wvHeight,
  } = context;

  const {
    guid: guidAttr,
	time: timeAttr,
    color: colorAttr,
    linewidth: linewidthAttr,
    drawstyle: drawstyleAttr,
    linestyle: linestyleAttr,
 } = br_attributes;

  //if creationtime doesn't exist, use the time attribute
  var creationtimeAttr = br_attributes.creationtime;  
  if (!creationtimeAttr && timeAttr) creationtimeAttr = timeAttr;
    
  const width = getLineWidth(isImage, xfdf_node, linewidthAttr, wvHeight);
  const color = colorAttr && `#${rgbToHex(...colorAttr.value.split('|'))}`;
  const interiorColor = getInteriorColor(color, drawstyleAttr);
  const datetime = getCreationTime(timeAttr);
  const createtime = getCreationTime(creationtimeAttr); //toXmlDate(new Date(parseInt(creationtimeAttr.value, 10)));
  setXfdfAttributesBare({
    // We need groupId for a group because guid is not unique for groups
    name: groupId ? `${groupId}-${guidAttr.value}` : `${guidAttr.value}`,
    // didn't work because of not being unique in brava. lol.
    // But I can't remember what file caused it.
    // ....waiting on someone else to have this problem.
    // name: guidGenerator(),
    date: datetime,
    creationdate: createtime,
    ...(width && { width }),
    ...(extraAttributes.color !== null && color && { color }),
    ...interiorColor,
  }, xfdf_node);

  if (!drawstyleAttr || (drawstyleAttr.value !== 'solid' && drawstyleAttr.value !== 'highlight' && drawstyleAttr.value !== 'hide')) {
    const dashStyle = getDashStyle(linestyleAttr, drawstyleAttr, width);

    setXfdfAttributesBare(
      dashStyle,
      xfdf_node,
    );
  }

  if (drawstyleAttr && drawstyleAttr.value === 'hide') {
    setXfdfAttributesBare({
      'interior-color': `#${rgbToHex(255, 255, 255)}`,
      width: 0,
    }, xfdf_node);
  }

  setXfdfAttributesBare(extraAttributes, xfdf_node);
  if (primaryAnnotationId && primaryAnnotationId !== guidAttr.value) {
    // This for grouping this annotation to a group because they are in a group in brava
    // I added this for a ticket. Maybe Hexagon?
    setXfdfAttributesBare({
      replyType: 'group',
      inreplyto: `${groupId}-${primaryAnnotationId}`,
    }, xfdf_node);
  }

  if (extraAttributes.style === 'cloudy') {
    // intensity of a cloud depends on the linewidth attribute defined in brava
    const intensity = width ? Math.round((width * (1.5 / 0.3)) / 10) || 1 : 2;
    setXfdfAttributesBare({
      intensity,
    }, xfdf_node);
  }
};

// used for brava 'Text' because they have TextColor and color. If we use the other one then
// the background color will always be set.
export const setXfdfAttributes2 = (extraAttributes, br_attributes, xfdf_node, context = {}) => {
  const { primaryAnnotationId, groupId = '' } = context;

  const {
    guid: guidAttr,
    time: timeAttr,
  } = br_attributes;

  //if creationtime doesn't exist, use the time attribute  
  var creationtimeAttr = br_attributes.creationtime;  
  if (!creationtimeAttr && timeAttr) creationtimeAttr = timeAttr;
  
  const datetime = getCreationTime(timeAttr);
  const createtime = getCreationTime(creationtimeAttr); //toXmlDate(new Date(parseInt(creationtimeAttr.value, 10)));
  setXfdfAttributesBare({
    // We need groupId for a group because guid is not unique for groups
    name: groupId ? `${groupId}-${guidAttr.value}` : `${guidAttr.value}`,
    date: datetime,
    creationdate: createtime,
  }, xfdf_node);
  setXfdfAttributesBare(extraAttributes, xfdf_node);

  if (primaryAnnotationId && primaryAnnotationId !== guidAttr.value) {
    // This for grouping this annotation to a group because they are in a group in brava
    // I added this for a ticket. Maybe Hexagon?
    setXfdfAttributesBare({
      replyType: 'group',
      inreplyto: `${groupId}-${primaryAnnotationId}`,
    }, xfdf_node);
  }
};

export const assert = (isConditionMet, message) => {
  if (!isConditionMet) {
    throw new Error(message);
  }
};

export const getAttributeValue = (br_annot, key) => {
  const attr = br_annot.attributes[key];
  return attr.value;
};

export const mod = (v, n) => {
  return ((v % n) + n) % n;
};

export const getRotationRadFromMatrix = (matrix = []) => {
  // https://math.stackexchange.com/questions/13150/extracting-rotation-scale-values-from-2d-transformation-matrix
  // This returns the counter-clockwise rotation.
  const m_a = matrix[0] || 1;
  const m_c = matrix[2] || 0;
  return Math.atan2(-m_c, m_a);
};

// 360 - because of different direction between brava and wv?
export const getNearestRotationDegreeFromRad = (rad) => {
  return mod((Math.round(2 * (rad / Math.PI)) * 90), 360);
};

export const changeDegreeRotationDirection = (rotationDegree) => {
  return mod((360 - rotationDegree), 360);
};

export const multiplyMatrices = (m1 = [], m2 = []) => {
  // 1 0 0 // a b h // a b h
  // 0 1 0 // c d v // c d v
  // 0 0 1 // 0 0 1 // 0 0 1

  // 11 = a1*a2 + b1*c2
  // 12 = a1*b2 + b1*d2
  // 13 = a1*h2 + b1*v2 + h1
  // 21 = c1*a2 + d1*c2
  // 22 = c1*b2 + d1*d2
  // 23 = c1*h2 + d1*v2 + v1

  const [a1 = 1, b1 = 0, c1 = 0, d1 = 1, h1 = 0, v1 = 0] = m1;
  const [a2 = 1, b2 = 0, c2 = 0, d2 = 1, h2 = 0, v2 = 0] = m2;
  return [
    a1 * a2 + b1 * c2,
    a1 * b2 + b1 * d2,
    c1 * a2 + d1 * c2,
    c1 * b2 + d1 * d2,
    a1 * h2 + b1 * v2 + h1,
    c1 * h2 + d1 * v2 + v1,
  ];
};
