// canvas2svg.js - A library to convert Canvas to SVG
// Based on https://github.com/gliffy/canvas2svg

function C2S(width, height) {
  // Create the SVG document
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', width);
  svg.setAttribute('height', height);
  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
  
  // Create the context
  const ctx = {
    _svg: svg,
    _defs: document.createElementNS('http://www.w3.org/2000/svg', 'defs'),
    _stack: [],
    _group: svg,
    _transform: [1, 0, 0, 1, 0, 0],
    _fillStyle: '#000000',
    _strokeStyle: '#000000',
    _lineWidth: 1,
    _lineCap: 'butt',
    _lineJoin: 'miter',
    _miterLimit: 10,
    _globalAlpha: 1,
    _font: '10px sans-serif',
    _textAlign: 'start',
    _textBaseline: 'alphabetic',
    _shadowColor: 'rgba(0, 0, 0, 0)',
    _shadowBlur: 0,
    _shadowOffsetX: 0,
    _shadowOffsetY: 0,
    _filter: null
  };

  // Add defs to SVG
  svg.appendChild(ctx._defs);

  // Save context
  ctx.save = function() {
    const state = {
      transform: ctx._transform.slice(),
      fillStyle: ctx._fillStyle,
      strokeStyle: ctx._strokeStyle,
      lineWidth: ctx._lineWidth,
      lineCap: ctx._lineCap,
      lineJoin: ctx._lineJoin,
      miterLimit: ctx._miterLimit,
      globalAlpha: ctx._globalAlpha,
      font: ctx._font,
      textAlign: ctx._textAlign,
      textBaseline: ctx._textBaseline,
      shadowColor: ctx._shadowColor,
      shadowBlur: ctx._shadowBlur,
      shadowOffsetX: ctx._shadowOffsetX,
      shadowOffsetY: ctx._shadowOffsetY,
      filter: ctx._filter
    };
    ctx._stack.push(state);
  };

  // Restore context
  ctx.restore = function() {
    if (ctx._stack.length === 0) return;
    const state = ctx._stack.pop();
    ctx._transform = state.transform;
    ctx._fillStyle = state.fillStyle;
    ctx._strokeStyle = state.strokeStyle;
    ctx._lineWidth = state.lineWidth;
    ctx._lineCap = state.lineCap;
    ctx._lineJoin = state.lineJoin;
    ctx._miterLimit = state.miterLimit;
    ctx._globalAlpha = state.globalAlpha;
    ctx._font = state.font;
    ctx._textAlign = state.textAlign;
    ctx._textBaseline = state.textBaseline;
    ctx._shadowColor = state.shadowColor;
    ctx._shadowBlur = state.shadowBlur;
    ctx._shadowOffsetX = state.shadowOffsetX;
    ctx._shadowOffsetY = state.shadowOffsetY;
    ctx._filter = state.filter;
  };

  // Get SVG element
  ctx.getSvg = function() {
    return ctx._svg;
  };

  // Add element to current group
  ctx._addElement = function(element) {
    ctx._group.appendChild(element);
    return element;
  };

  // Create path element
  ctx.beginPath = function() {
    ctx._path = '';
  };

  // Close path
  ctx.closePath = function() {
    ctx._path += 'Z';
  };

  // Move to point
  ctx.moveTo = function(x, y) {
    ctx._path += `M${x},${y}`;
  };

  // Line to point
  ctx.lineTo = function(x, y) {
    ctx._path += `L${x},${y}`;
  };

  // Quadratic curve
  ctx.quadraticCurveTo = function(cpx, cpy, x, y) {
    ctx._path += `Q${cpx},${cpy} ${x},${y}`;
  };

  // Bezier curve
  ctx.bezierCurveTo = function(cp1x, cp1y, cp2x, cp2y, x, y) {
    ctx._path += `C${cp1x},${cp1y} ${cp2x},${cp2y} ${x},${y}`;
  };

  // Arc
  ctx.arc = function(x, y, radius, startAngle, endAngle, anticlockwise) {
    const start = {
      x: x + radius * Math.cos(startAngle),
      y: y + radius * Math.sin(startAngle)
    };
    const end = {
      x: x + radius * Math.cos(endAngle),
      y: y + radius * Math.sin(endAngle)
    };
    const largeArc = Math.abs(endAngle - startAngle) > Math.PI;
    const sweep = anticlockwise ? 0 : 1;
    ctx._path += `M${start.x},${start.y}A${radius},${radius} 0 ${largeArc},${sweep} ${end.x},${end.y}`;
  };

  // Fill path
  ctx.fill = function() {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', ctx._path);
    path.setAttribute('fill', ctx._fillStyle);
    path.setAttribute('fill-opacity', ctx._globalAlpha);
    ctx._addElement(path);
  };

  // Stroke path
  ctx.stroke = function() {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', ctx._path);
    path.setAttribute('stroke', ctx._strokeStyle);
    path.setAttribute('stroke-width', ctx._lineWidth);
    path.setAttribute('stroke-linecap', ctx._lineCap);
    path.setAttribute('stroke-linejoin', ctx._lineJoin);
    path.setAttribute('stroke-miterlimit', ctx._miterLimit);
    path.setAttribute('stroke-opacity', ctx._globalAlpha);
    ctx._addElement(path);
  };

  // Fill text
  ctx.fillText = function(text, x, y) {
    const textElement = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    textElement.setAttribute('x', x);
    textElement.setAttribute('y', y);
    textElement.setAttribute('fill', ctx._fillStyle);
    textElement.setAttribute('font-family', ctx._font.split(' ')[1]);
    textElement.setAttribute('font-size', ctx._font.split(' ')[0]);
    textElement.setAttribute('text-anchor', ctx._textAlign);
    textElement.setAttribute('dominant-baseline', ctx._textBaseline);
    textElement.setAttribute('fill-opacity', ctx._globalAlpha);
    textElement.textContent = text;
    ctx._addElement(textElement);
  };

  // Stroke text
  ctx.strokeText = function(text, x, y) {
    const textElement = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    textElement.setAttribute('x', x);
    textElement.setAttribute('y', y);
    textElement.setAttribute('stroke', ctx._strokeStyle);
    textElement.setAttribute('stroke-width', ctx._lineWidth);
    textElement.setAttribute('font-family', ctx._font.split(' ')[1]);
    textElement.setAttribute('font-size', ctx._font.split(' ')[0]);
    textElement.setAttribute('text-anchor', ctx._textAlign);
    textElement.setAttribute('dominant-baseline', ctx._textBaseline);
    textElement.setAttribute('stroke-opacity', ctx._globalAlpha);
    textElement.textContent = text;
    ctx._addElement(textElement);
  };

  return ctx;
}

export default C2S; 