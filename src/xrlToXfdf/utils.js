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

const measureSystemMaps = {
	"english": [
		{
			"name": "1:1", //"Full Size (1:1)",
			"value": 1
		},
		{
			"name": "1:2", //"Half Size (1:2)",
			"value": 2
		},
		{
			"name": "3 in = 1 ft-in", //"3\"=1'-0\"",
			"precision": "8",
			"value": 4
		},
		{
			"name": "1.5 in = 1 ft-in", //"1 1/2\"=1'-0\"",
			"precision": "8",
			"value": 8
		},
		{
			"name": "1 in = 1 ft-in", //"1\"=1'-0\"",
			"precision": "8",
			"value": 12
		},
		{
			"name": "0.75 in = 1 ft-in", //"3/4\"=1'-0\"",
			"precision": "8",
			"value": 16
		},
		{
			"name": "0.5 in = 1 ft-in", //"1/2\"=1'-0\"",
			"precision": "8",
			"value": 24
		},
		{
			"name": "0.375 in = 1 ft-in", //"3/8\"=1'-0\"",
			"precision": "8",
			"value": 32
		},
		{
			"name": "0.25 in = 1 ft-in", //"1/4\"=1'-0\"",
			"precision": "8",
			"value": 48
		},
		{
			"name": "0.1875 in = 1 ft-in", //"3/16\"=1'-0\"",
			"precision": "16",
			"value": 64
		},
		{
			"name": "0.125 in = 1 ft-in",//"1/8\"=1'-0\"",
			"precision": "8",
			"value": 96
		},
		{
			"name": "0.09375 in = 1 ft-in", //"3/32\"=1'-0\"",
			"precision": "32",
			"value": 128
		},
		{
			"name": "0.0625 in = 1 ft-in", //"1/16\"=1'-0\"",
			"precision": "16",
			"value": 192
		},
		{
			"name": "1:10",
			"value": 10
		},
		{
			"name": "1:20",
			"value": 20
		},
		{
			"name": "1:25",
			"value": 25
		},
		{
			"name": "1:50",
			"value": 50
		},
		{
			"name": "1:100",
			"value": 100
		},
		{
			"name": "1:200",
			"value": 200
		}
	],
    "englishArch": [
		{
			"name": "1:1", //"Full Size (1:1)",
			"value": 1
		},
		{
			"name": "1:2", //"Half Size (1:2)",
			"value": 2
		},
		{
			"name": "3 in = 1 ft-in", //"3\"=1'-0\"",
			"precision": "8",
			"value": 4
		},
		{
			"name": "1.5 in = 1 ft-in", //"1 1/2\"=1'-0\"",
			"precision": "8",
			"value": 8
		},
		{
			"name": "1 in = 1 ft-in", //"1\"=1'-0\"",
			"precision": "8",
			"value": 12
		},
		{
			"name": "0.75 in = 1 ft-in", //"3/4\"=1'-0\"",
			"precision": "8",
			"value": 16
		},
		{
			"name": "0.5 in = 1 ft-in", //"1/2\"=1'-0\"",
			"precision": "8",
			"value": 24
		},
		{
			"name": "0.375 in = 1 ft-in", //"3/8\"=1'-0\"",
			"precision": "8",
			"value": 32
		},
		{
			"name": "0.25 in = 1 ft-in", //"1/4\"=1'-0\"",
			"precision": "8",
			"value": 48
		},
		{
			"name": "0.1875 in = 1 ft-in", //"3/16\"=1'-0\"",
			"precision": "16",
			"value": 64
		},
		{
			"name": "0.125 in = 1 ft-in", //"1/8\"=1'-0\"",
			"precision": "8",
			"value": 96
		},
		{
			"name": "0.09375 in = 1 ft-in", //"3/32\"=1'-0\"",
			"precision": "32",
			"value": 128
		},
		{
			"name": "0.0625 in = 1 ft-in", //"1/16\"=1'-0\"",
			"precision": "16",
			"value": 192
		},
		{
			"name": "1:10",
			"value": 10
		},
		{
			"name": "1:20",
			"value": 20
		},
		{
			"name": "1:25",
			"value": 25
		},
		{
			"name": "1:50",
			"value": 50
		},
		{
			"name": "1:100",
			"value": 100
		},
		{
			"name": "1:200",
			"value": 200
		}
	],
	"metric": [
		{
			"name": "1:1",
			"value": 1
		},
		{
			"name": "1:2",
			"value": 2
		},
		{
			"name": "1:5",
			"value": 5
		},
		{
			"name": "1:10",
			"value": 10
		},
		{
			"name": "1:20",
			"value": 20
		},
		{
			"name": "1:25",
			"value": 25
		},
		{
			"name": "1:50",
			"value": 50
		},
		{
			"name": "1:100",
			"value": 100
		},
		{
			"name": "1:200",
			"value": 200
		}
	],

	"unitConversion": {
		"cm": {
		  'mm': 0.1,
		  'cm': 1,
		  'm': 100,
		  'km': 100000,
		  'mi': 160394,
		  'in"': 2.54,
		  'in': 2.54,
		  'ft': 30.48,
		  'ft\'': 30.48,
		  'ft-in': 30.48,
		  'pt': 0.0352778,
		  'yd': 91.44,
		}, 
		"in": {
			'mm': 25.4,
			'cm': 2.54,
			'm': 0.0254,
			'km': 0.0000254,
			'mi': 0.000015782828282828283,
			'in': 1,
			'in"': 1,
			"ft": 0.08333333333333333,
			'ft\'': 0.08333333333333333,
			'ft-in': 0.08333333333333333,
			'pt': 71.99995464569786,
			'yd': 0.027777777777777776,
		}
	},
	
	"unitMap" :{
		"inches": "in",
		"feet": "ft",
		"yards": "yd",
		"miles": "mi",
		"mms": "mm",
		"cms": "cm",
		"meters": "m",
		"kms": "km",
		"in": "in",
		"ft": "ft",
		"yd": "yd",
		"mi": "mi",
		"mm": "mm",
		"cm": "cm",
		"m": "m",
		"km": "km"
	}
};

export const measureSystemProxy = new window.Proxy(measureSystemMaps, {
  get: (obj, measureSystem) => {
    if (measureSystem in obj) {
      return obj[measureSystem];
    }
    console.warn(`Unknown type ${measureSystem}`);
    return null;
  },
});

export const getAxisScaleFactor = (scaleName, bravaSystem, distance, bravaTargetUnit) => {
	var unitConversion = measureSystemMaps.unitConversion["cm"];//conversion from cm
	
	var scaleInfo = scaleName.split(/[= ]/).filter(a => a !== "");   
	var targetUnit = scaleInfo[3], sourceUnit = scaleInfo[1],
		baseUnit = bravaSystem == "metric"? "mm": "in";
	for(var i = 0, len = 2; i < len; i++)
	{	var index = i * 2;
		var value = parseFloat(scaleInfo[index + 0])
		var unit = scaleInfo[index + 1];
		if (unit !== baseUnit) {
			value = value * unitConversion[unit] / unitConversion[baseUnit];
			if(distance) unit = baseUnit;
		}	
		var destUnit = index == 0 ? sourceUnit: (targetUnit == "ft-in"? "in": targetUnit);
		if (distance && unit !== destUnit)
			value = value * unitConversion[unit] / unitConversion[destUnit];
			
		scaleInfo[index + 0] = value;
		scaleInfo[index + 1] = unit;		
	}

	return scaleInfo[2]/scaleInfo[0] * (unitConversion["pt"] / unitConversion[scaleInfo[distance?1:3]]);
}

export const getScaleFromRatio = (bravaSystem, bravaTargetUnit, ratioText) => {
	var targetUnit = measureSystemMaps.unitMap[bravaTargetUnit], sourceUnit = bravaSystem == "metric"? "mm": "in",
		srcScale = `1 ${sourceUnit}`, targetScale = srcScale, ratio = ratioText.split(":");
	if (ratio.length > 1) {
		const unitConversion = measureSystemMaps.unitConversion[bravaSystem == "metric"?"cm": "in"];
		var value = parseFloat(ratio[1]) > parseFloat(ratio[0])?
			(unitConversion[sourceUnit]/unitConversion[targetUnit])/parseFloat(ratio[1]):
			(unitConversion[sourceUnit]/unitConversion[targetUnit])*parseFloat(ratio[1]);
		if (bravaSystem !== "metric" && ["1:1", "1:2"].includes(ratioText)) {
			targetScale = `1 ${targetUnit}`;	
			srcScale = `${value} ${sourceUnit}`;
		} else {
			if (parseFloat(ratio[0]) > 1) srcScale = `${ratio[0]} ${sourceUnit}`;			
			targetScale = `${value} ${targetUnit}`;	
		}		
	}	
	return `${srcScale} = ${targetScale}`; 
}

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

export const toSvgTextContent = (line) => {
	//Use _ for empty lines so that we don't get a 0 for the height of getBBox of SVG text
	return line.trim() === ""? "_": line;
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
	if (isImage) {
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

  if ((xfdf_node.nodeName === "line" || xfdf_node.nodeName === "polyline") && linestyleAttr && linestyleAttr.value !== 'solid' ) { 
      //Consider linestyle attribute of the Brava markup during the conversion
	   if (linestyleAttr.value == "dot" || linestyleAttr.value == "dash" || linestyleAttr.value == "dashdot")
		  xfdf_node.setAttribute("style", "dash");
	  if (linestyleAttr.value == "dot") xfdf_node.setAttribute("dashes", "2,2");
	  if (linestyleAttr.value == "dash") xfdf_node.setAttribute("dashes", "4,4");
	  if (linestyleAttr.value == "dashdot") xfdf_node.setAttribute("dashes", "4,6,10,6");
  }
  
   if (linestyleAttr && (!drawstyleAttr || (drawstyleAttr.value !== 'solid' && drawstyleAttr.value !== 'highlight' && drawstyleAttr.value !== 'hide'))) {
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

export const multiplyMatrices = (m1, m2, m3, m4) => {

  //brava equivalent
  //xx = a1, xy = b1, yx = c1, yy = d1, dx = h1, dy = v1 
  var args = [];
  if (m1 !== undefined) args.push(m1);
  if (m2 !== undefined) args.push(m2);
  if (m3 !== undefined) args.push(m3)
  if (m4 !== undefined) args.push(m4)
	  ;
  const a0 = args[0][0], b0 = args[0][1], c0 = args[0][2], d0 = args[0][3], h0 = args[0][4], v0 = args[0][5];
  var m = [a0, b0, c0, d0, h0, v0];
  
  for (var l = 1, len = args.length; l < len; l++) {
	const a1 = m[0], b1 = m[1], c1 = m[2], d1 = m[3], h1 = m[4], v1 = m[5];
	const a2 = args[l][0], b2 = args[l][1], c2 = args[l][2], d2 = args[l][3], h2 = args[l][4], v2 = args[l][5];
	
	m[0] = a1 * a2 + b1 * c2;
	m[1] = a1 * b2 + b1 * d2;
	m[2] = c1 * a2 + d1 * c2;
	m[3] = c1 * b2 + d1 * d2;
	m[4] = a1 * h2 + b1 * v2 + h1;
	m[5] = c1 * h2 + d1 * v2 + v1;
  } 
  return m;
};


const translate = (x, y) => {
	//const a1 =  m[0], b1 =  m[1], c1 =  m[2], d1 =  m[3];	
	//return [a1, b1, c1, d1, x, y];
	return [1, 0, 0, 1, x, y];
};

const rotate = (angle) => {
	var a = Math.cos(angle);
	var b = Math.sin(angle);
	var	h1 = 0;
	var v1 = 0;
	
	return [ a, -b, b, a, h1, v1];
};

const scale = (scaleX, scaleY) => {	
	return [scaleX, 0, 0, scaleY, 0, 0];
};


const sandwich = (b, m, l) => {
	return multiplyMatrices(translate(m, l), b, translate(-m, -l));
}
	
const rotateAt = (angle, center) => {
	return sandwich(rotate(angle), center.x, center.y)
};

const scaleAt = (b, m, l, h) => {
	
	return sandwich(scale(b, m), l, h);
	
};

const multiplyRectangle = (m, rect) => {
	
	var h = multiplyPoint(m, rect.x, rect.y)
	  , g = multiplyPoint(m, rect.x, rect.y + rect.height)
	  , a = multiplyPoint(m, rect.x + rect.width, rect.y)
	  , f = multiplyPoint(m, rect.x + rect.width, rect.y + rect.height)
	  , minX = Math.min(h.x, g.x, a.x, f.x)
	  , minY = Math.min(h.y, g.y, a.y, f.y)
	  , maxX = Math.max(h.x, g.x, a.x, f.x)
	  , maxY = Math.max(h.y, g.y, a.y, f.y);
	  
	return  {
		x: minX,
		y: minY,
		width: maxX - minX,
		height: maxY - minY
	}
};

const multiplyPoint = (m, x, y) => {
	const a1 =  m[0], b1 =  m[1], c1 =  m[2], d1 =  m[3], h1 = m[4], v1 = m[5];	
	
	return {
		x: a1 * x + b1 * y + h1,
		y: c1* x + d1 * y + v1
	};
};

const getDistance = (pt1, pt2) => {
	    return Math.sqrt(Math.pow(Math.abs(pt2.x - pt1.x), 2) + Math.pow(Math.abs(pt2.y - pt1.y), 2))
                    
};

export const createSVGNode = (nodeType, attr) => {
	const namespace = "http://www.w3.org/2000/svg";
	var node = document.createElementNS(namespace, nodeType);
	if (nodeType == "svg")
		node.setAttribute("xmlns", namespace); 
	
	if (attr) {
		for (var name in attr) {
			node.setAttribute(name, attr[name]); 
		}
	}	 
	
	if (nodeType == "svg")
		document.body.appendChild(node);
	return node;
};

const getTransformFromMatrix = (tranformMatrix) => {

	return "matrix(" + tranformMatrix[0].toFixed(8) + "," + tranformMatrix[1].toFixed(8) + "," + 
		tranformMatrix[2].toFixed(8) + "," + tranformMatrix[3].toFixed(8) + "," + tranformMatrix[4].toFixed(8) + "," + tranformMatrix[5].toFixed(8) + ")";
}
	
export const isPuppeteer = () => {
	return navigator.userAgent.indexOf("HeadlessChrome") > -1;
}	

export const transformTextPoints = (context, topContext, textAttr, text, br_textGroup) => {
	const { 
		bravaHeight,
		bravaWidth,
		pageRotationDegree,
		matrix,  
	} = context;
	
	const {
		guid,
		fontface,
		fontsize,
		isBold,
		isItalic,
		isUnderline,
		bravaPoints,
		textMatrix,
		lines
	} = textAttr;
  
	var width = getDistance(bravaPoints[0], bravaPoints[1]);
	var	height = getDistance(bravaPoints[1], bravaPoints[2]);

	var naturalPageHeight = 1440;
	var naturalPageWidth = naturalPageHeight * bravaWidth / bravaHeight;
	
	const defaultFontSize = 13, fontMultiplier = bravaHeight * 0.1, strokeMultiplier = 1 / 60 * bravaHeight;
	var bravaFontSize = fontsize * fontMultiplier;
	
	const svgNode = createSVGNode("svg", {"width": bravaWidth, "height": bravaHeight, "style": "position: absolute; top: 0px; left: 0px; border:1px solid red;"});
		
	var pageMtx = multiplyMatrices(scale(naturalPageWidth / bravaWidth, naturalPageHeight / bravaHeight), translate(0, bravaHeight), scale(1, -1), translate(0, 0));
	
	var svgFirstGrpNode = createSVGNode("g", {
		"transform": getTransformFromMatrix(pageMtx)
	});
	svgNode.appendChild(svgFirstGrpNode);
	
	var svgGrpNode = createSVGNode("g");	
	if (br_textGroup !== null) {
		let bravaGroupMatrix = br_textGroup.querySelector('Matrix').textContent.split('|').map((n) => parseFloat(n, 10));
		var svgBravaGrpNode = createSVGNode("g", {
			"transform": getTransformFromMatrix(bravaGroupMatrix)
		});
		svgFirstGrpNode.appendChild(svgBravaGrpNode);
		svgBravaGrpNode.appendChild(svgGrpNode);
		
			
		let stampEls = br_textGroup.querySelectorAll('Elements Raster');
		for(var i = 0, len = stampEls.length; i < len; i++)
		{
			const imageMatrix = stampEls[i].querySelector('Matrix').textContent.split('|').map(n => parseFloat(n, 10)),
				br_idTextNode = Array.from(stampEls[i].childNodes).filter(a => a.nodeType === Node.TEXT_NODE), 
				imageId = br_idTextNode[0].textContent.replace(/^\s+|\s+$/g, ''),
				imageInfo = topContext.bravaImages[imageId];
			
			const imageEl = createSVGNode("image", {"fill-opacity": "0", "stroke": "none", "stroke-opacity":"0", "stroke-width":"1", "stroke-linecap": "butt", "stroke-linejoin": "miter", 		
				"stroke-miterlimit":"4", "x":"0", "y":"0", "width": imageInfo.imageWidth, "height": imageInfo.imageHeight, "preserveAspectRatio": "none", "href": imageInfo.imageData});
			svgGrpNode.appendChild(imageEl);
		}
			
	}
	else 		
		svgFirstGrpNode.appendChild(svgGrpNode);	
	
	const svgRectNode = createSVGNode("rect", {
		"fill":"rgb(255, 255, 255)", "fill-opacity":"1", "stroke":"rgb(255, 0, 0)", "stroke-opacity":"1", "stroke-width":"1", "stroke-linecap":"butt", 
		"stroke-linejoin":"miter", "stroke-miterlimit":"4",  "ry":"0", "rx":"0", "fill-rule":"evenodd", "stroke-dasharray":"none",
		 "dojoGfxStrokeStyle":"solid", "vector-effect":"non-scaling-stroke"
	});	
	svgGrpNode.appendChild(svgRectNode);
	
	//Determine the text group transformation	
	var angle = Math.atan2(bravaPoints[1].y - bravaPoints[0].y, bravaPoints[1].x - bravaPoints[0].x), 
		center = {
			x: (bravaPoints[0].x + bravaPoints[1].x) / 2,
			y: (bravaPoints[0].y + bravaPoints[1].y) / 2
		};
	
	var ptx =  bravaPoints[0].x;
	var pty =  bravaPoints[0].y;
	
	var mtx = rotateAt(-angle, center);
	var c = multiplyPoint(mtx, ptx, pty);
	mtx = rotateAt(angle, center);
	var groupMatrix = multiplyMatrices(mtx, translate(c.x, c.y));	
	svgGrpNode.setAttribute("transform", getTransformFromMatrix(groupMatrix));
	var textRotationDegrees = null;
	if (groupMatrix[1] !== 0 && groupMatrix[2] !== 0) 
	{		
		//Calculate the rotation of the text in degrees based on the skew in the matrix
		//and save the textRotationDegrees for further processing later when we calculate the font size
		var scalex = groupMatrix[0], skewy = groupMatrix[2],
		rScale = Math.sqrt(scalex * scalex + skewy * skewy);
		textRotationDegrees = context.pageRotationDegree - 
			Math.round(Math.atan2(groupMatrix[1], groupMatrix[0]) * (180 / Math.PI)); //get the angle in degrees	
	}
		
	//Calculate rect size of the text		
	let canvas = document.createElement('canvas');
	let ctx = canvas.getContext('2d');
	ctx.textBaseline = "top";
	ctx.textAlign = "left";
    ctx.font = bravaFontSize + "px '" + fontface + "'";	
	let charWidth = ctx.measureText("M").width;
    var n = 0.25 * charWidth;
	var m = 0.1 * charWidth;
	var lineWidth = width * (24 / (0.9 * bravaFontSize));
 
	
	const getBoundingBox = (origbbox, bravaFontSize, posY) => {
	
		var bboxWidth = origbbox.width,
			bboxHeight = origbbox.height;
		
		var origPt = { x:0, y:0 };
		var e = {
			ascentToSize: (origPt.y - origbbox.y) / defaultFontSize,
			descentToSize: (origbbox.y + bboxHeight - origPt.y) / defaultFontSize,
			widthToSize: bboxWidth / defaultFontSize,
			heightToSize: bboxHeight / defaultFontSize
		}

		var newHeight = e.heightToSize * bravaFontSize;
		return {
			x: origPt.x,
			y: posY - newHeight + e.descentToSize * bravaFontSize,
			width: e.widthToSize * bravaFontSize,
			height: newHeight
		};
		
	}		
  
	//Create a text element for the line of text using the default font size
	const createTextNode = (parentNode, line, posY) => {
		
		//Get the size of the text on default font-size
		var svgTxtNode = createSVGNode("text", {
			"fill":"rgb(255, 0, 0)", "fill-opacity":"1", "stroke":"none", "stroke-opacity":"0", "stroke-width":"1", "stroke-linecap":"butt", "stroke-linejoin":"miter", "xml:space": "preserve",
			"stroke-miterlimit":"4" ,"x":"0", "y": "0", "text-anchor":"start", "text-decoration": (isUnderline? "underline": "none"),
			"rotate":"0", "kerning":"auto", "text-rendering":"auto", "fill-rule":"evenodd", "font-style": (isItalic ? "italic":"none"),
			"font-variant":"normal", "font-weight": (isBold? "bold":"normal"),  "font-size": defaultFontSize, "font-family": fontface
		});
		svgTxtNode.textContent = toSvgTextContent(line);
		svgNode.appendChild(svgTxtNode);				
		var bbox = svgTxtNode.getBBox();
		svgNode.removeChild(svgTxtNode);
		
		//In puppeteer, the size of the text is a little bigger, so we add a scale factor to adjust the resulting size.
		var scaleFactor = isPuppeteer()? 0.98 : 1;
		bbox = {x: bbox.x, y: bbox.y, width: bbox.width, height: bbox.height};
		
		var bounds = getBoundingBox (bbox, bravaFontSize, posY),
			mtx1 = scaleAt(1, -1, 0, posY), mtx2 = translate(0, bounds.height);		
		var mtxTransform = multiplyMatrices(mtx1, mtx2);
		
		svgTxtNode.setAttribute("y", posY);		
		svgTxtNode.setAttribute("transform", getTransformFromMatrix( mtxTransform));
		svgTxtNode.setAttribute("font-size", bravaFontSize); // - (isPuppeteer()?  bravaFontSize * 0.56: 0));
		parentNode.appendChild(svgTxtNode);
		return { node: svgTxtNode, 
			bbox: {x: bounds.x, y: bounds.y, width: bounds.width, height: bounds.height},
			transform: mtxTransform		
		};
	};
	
	//Calculate the new bounding box of the text group after adding the lineShape node
	const calculateTextGroupRect = (lineShape, origBox) => {		
		var newBox = origBox == null? null: {
			x: origBox.x,
			y: origBox.y,
			endX: origBox.endX,
			endY: origBox.endY
		};
		var svgTxtNode = lineShape.node;
		
		var newRect = multiplyRectangle(lineShape.transform, lineShape.bbox);
		if (newBox === null)
			newBox = {
				x: newRect.x,
				y: newRect.y,
				endX: (newRect.x + newRect.width),
				endY: (newRect.y + newRect.height)
			};
		else {
			newBox.x = Math.min(newBox.x, newRect.x);
			newBox.y = Math.min(newBox.y, newRect.y);
			newBox.endX = Math.max(newBox.endX, newRect.x + newRect.width);
			newBox.endY = Math.max(newBox.endY, newRect.y + newRect.height); 
			
		}		
		
		return newBox;
	}
	
	var _calculateTransformedBoundingBox = (bbox, mtx) => {
		var points = [{
			x: 0,
			y: 0
		}, {
			x: bbox.width,
			y: 0
		}, {
			x: bbox.width,
			y: bbox.height
		}, {
			x: 0,
			y: bbox.height
		}];
				
		var minX = null, minY = null, maxX = null, maxY = null;
		for(var i = 0, len = points.length; i < len; i++)
		{
			//var newPoint = multiplyPoint(rectMtx, points[i].x, points[i].y);	
			var newPoint = multiplyPoint(mtx, points[i].x, points[i].y);	
			points[i].x = newPoint.x;	
			points[i].y = newPoint.y;// - (context.txtTranslateY ? context.txtTranslateY: 0);	
			if (minX == null || minX > points[i].x) minX = points[i].x;
			if (minY == null || minY > points[i].y) minY = points[i].y;
			if (maxX == null || maxX < points[i].x) maxX = points[i].x;
			if (maxY == null || maxY < points[i].y) maxY = points[i].y;
		}
	
		return { points: points, minX: minX, minY: minY, maxX: maxX, maxY: maxY };
	}
	
	//Determine the flow of text for each line and the bounding box of the entire text using logic in Brava HTML Viewer 
	var flowLines = [], lineShapes = [], k = false, lineHeight = 0, linePosY = 0, firstLineY = 0, origBox = null;
	
	var svgTextGrpNode = createSVGNode("g", {});
	svgGrpNode.appendChild(svgTextGrpNode)
	ctx.font = "24px '" + fontface + "'";
	try {
	for (var len = lines.length; len > 0; len--){
		var line = "";
		var words = lines.shift().split(/(\s+)/);
			
		if (1 === words.length && "" === words[0] && true === k)
			k = false;
		else {
			k = false;
			for (var c = words.length; c > 0;  c--) {
				var t = words.shift();
				
				let svgTxtNode = createSVGNode("text", {"font-size": "24px", "font-family": fontface, "xml:space": "preserve" }), txt = line + t;
				svgTxtNode.textContent = toSvgTextContent(txt);			
				svgNode.appendChild(svgTxtNode);
				var bbox = svgTxtNode.getBBox();
				svgNode.removeChild(svgTxtNode);
				let fitWidth = bbox.width <= lineWidth;
				//if (ctx.measureText(line + t).width * scaleFactor <= lineWidth)
				if (fitWidth)
				{
					line += t;
					if ("" === line && flowLines.length > 0 && "" === flowLines[flowLines.length - 1]) k = true;
				} else {					
					//Create a new text element for the line and append it to the SVG Node. Then get the appropriate bounds of the text element
					var shape = createTextNode(svgTextGrpNode, line, firstLineY - linePosY);	
					if (lineHeight === 0) lineHeight = shape.bbox.height;
					
					origBox = calculateTextGroupRect(shape, origBox);					
					lineShapes.push(shape);
					linePosY += 0.9 * lineHeight;
		
					flowLines.push(line);
					line = t + " ";
				} 
				
				if ( !fitWidth && 0 === words.length) line = t;
				
			}
					
			//Create a new text element for the line and append it to the SVG Node. Then get the appropriate bounds of the text element
			var shape = createTextNode(svgTextGrpNode, line, firstLineY - linePosY);	
			if (lineHeight === 0) lineHeight = shape.bbox.height;
			origBox = calculateTextGroupRect(shape, origBox);
			lineShapes.push(shape);
			linePosY += 0.9 * lineHeight;
		
			flowLines.push(line);						
		}
					
		if (origBox !== null) {
			origBox.width = origBox.endX - origBox.x;
			origBox.height = origBox.endY - origBox.y;
		}
	
		if (flowLines.length > 0 && 0 === flowLines[0].length) flowLines.shift();
	}	
	} catch(e)
	{
		console.log(e.stack);
	}
	
	//Transform the bounding box
	var rect = { x: -n - m, y: -m - height - n, width: 2 * n + width + 4 * m, height:  2 * m + height + m };
	var newBox = { x: 0, y: 0, width: width, height: height };
	
	var tfmRect = _calculateTransformedBoundingBox(origBox, groupMatrix); 		
	var newWidth = getDistance(tfmRect.points[0], tfmRect.points[1]);
	var newHeight = getDistance(tfmRect.points[1], tfmRect.points[2]);
	
	var mtx = groupMatrix;
	if (newWidth > rect.width || newHeight > rect.height)
	{		
		var w =  newWidth > rect.width? newWidth: width;
		var h = newHeight > rect.height? newHeight: height;	
		newBox = { x: 0, y: 0, width: w, height: h };
		rect = {
			x: -n - m,
			y: -m - h - n,
			width: 2 * n + w + 4 * m,
			height: 2 * m + h + m
		};
		
	} 
	else 
		mtx = multiplyMatrices(groupMatrix, translate(rect.x, rect.y));
	
	var tfmRect2 = _calculateTransformedBoundingBox(newBox, mtx);
	
	var origWidth = getDistance(bravaPoints[0], bravaPoints[1]);
	var origHeight = getDistance(bravaPoints[1], bravaPoints[2]);	
	newWidth = getDistance(tfmRect2.points[0], tfmRect2.points[1]);
	newHeight = getDistance(tfmRect2.points[1], tfmRect2.points[2]);
		
	//Set the size of the rect element of the SVG because this determines the rect of the freetext
	let newMtx = multiplyMatrices(textMatrix, groupMatrix);	
	svgRectNode.setAttribute("x", rect.x);
	svgRectNode.setAttribute("y", rect.y);	
	svgRectNode.setAttribute("width", rect.width);
	svgRectNode.setAttribute("height", rect.height);
	
	svgGrpNode.setAttribute("transform", getTransformFromMatrix(newMtx));
	svgNode.setAttribute("width", naturalPageWidth);
	svgNode.setAttribute("height", naturalPageHeight);
						
	var points = tfmRect2.points;
	var outsitePoints = tfmRect2.points.filter( pt => pt.y > bravaHeight);
		
	let bminX = null, bminY = null, bmaxX = null, bmaxY = null, longestText = null,
		txtHeight = 0, txtWidth = 0, svgBounds = svgNode.getBoundingClientRect(),
		svgGroupBounds = svgGrpNode.getBoundingClientRect(),
		svgTextBounds = svgTextGrpNode.getBoundingClientRect(); 
	
	for(var i = 0, len = lineShapes.length; i < len; i++)
	{
		let shape = lineShapes[i].node,
			bounds = shape.getBoundingClientRect(),
			left = bounds.left / svgBounds.width,
			right = bounds.right / svgBounds.width,
			top = bounds.top / svgBounds.height,
			bottom = bounds.bottom / svgBounds.height;
		if (bounds.height > txtHeight) txtHeight = bounds.height;	
		if (bounds.width > txtWidth) txtWidth = bounds.width;	
		
		
		//Convert the SVG coordinates to Brava Page coordinates
		left = (left * bravaWidth) - textMatrix[4];
		right = (right * bravaWidth) - textMatrix[4];
		top = bravaHeight - ((top * bravaHeight) + textMatrix[5]);
		bottom = bravaHeight - ((bottom* bravaHeight) + textMatrix[5]);
		let minX =  Math.min(left, right), maxX = Math.max(left, right),  minY = Math.min(top, bottom), maxY = Math.min(top, bottom);
		if (bminX == null || bminX > minX) bminX = minX;
		if (bminY == null || bminY > minY) bminY = minY;
		if (bmaxX == null || bmaxX < maxX) bmaxX = maxX;
		if (bmaxY == null || bmaxY < maxY) bmaxY = maxY;	
		
	}

	let newPoints = [{ x: bminX, y: bminY }, { x: bminX + origWidth, y: bminY }, { x: bminX + origWidth, y: bminY + origHeight }, { x: bminX, y:  bminY + origHeight }];
	
	var result = {}, groupWidth = svgTextBounds.width, groupHeight = svgTextBounds.height, groupLeft = svgTextBounds.left, groupTop = svgTextBounds.top,
		heightRatio = svgTextBounds.height/ svgTextBounds.width, textLineHeight = lineShapes[0].node.getBoundingClientRect().height;
	console.log("--------------");
	console.log("text: " + flowLines[0]+" annotationSize: "+ svgGroupBounds.width+"," + svgGroupBounds.height + " text Size:" + groupWidth + "," +groupHeight +
		" textWidthRatio: " + (groupWidth / svgGroupBounds.width) +" textHeightRatio:" + (groupHeight / svgGroupBounds.height) +
		" lineHeight: " + textLineHeight +" lines:" + lineShapes.length);

	result[guid] = { points: newPoints, textRotation: textRotationDegrees, textFlow: flowLines, 
		left: groupLeft, top: groupTop, width: svgGroupBounds.width, height: svgGroupBounds.height,
		pageWidth: svgBounds.width, pageHeight: svgBounds.height, textWidthRatio: Math.min(0.95, groupWidth / svgGroupBounds.width), 
		textHeightRatio: Math.min(0.95,  groupHeight / svgGroupBounds.height) };
	
	console.log( guid + ":" + JSON.stringify(points));
	svgNode.ownerDocument.body.removeChild(svgNode);	
	return result;
}
