import React from 'react';
import { Svg, Line, Rect, Circle, Path, G, Text } from '@react-pdf/renderer';

const convertSVGToComponents = (svgString) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgString, 'image/svg+xml');
  const svg = doc.documentElement;

  const convertElement = (element) => {
    switch (element.tagName.toLowerCase()) {
      case 'rect':
        return (
          <Rect
            key={element.id || Math.random()}
            x={element.getAttribute('x')}
            y={element.getAttribute('y')}
            width={element.getAttribute('width')}
            height={element.getAttribute('height')}
            fill={element.getAttribute('fill') || 'none'}
            stroke={element.getAttribute('stroke')}
            strokeWidth={element.getAttribute('stroke-width')}
            opacity={element.getAttribute('opacity')}
          />
        );
      
      case 'line':
        return (
          <Line
            key={element.id || Math.random()}
            x1={element.getAttribute('x1')}
            y1={element.getAttribute('y1')}
            x2={element.getAttribute('x2')}
            y2={element.getAttribute('y2')}
            stroke={element.getAttribute('stroke')}
            strokeWidth={element.getAttribute('stroke-width')}
            strokeDasharray={element.getAttribute('stroke-dasharray')}
            opacity={element.getAttribute('opacity')}
          />
        );
      
      case 'circle':
        return (
          <Circle
            key={element.id || Math.random()}
            cx={element.getAttribute('cx')}
            cy={element.getAttribute('cy')}
            r={element.getAttribute('r')}
            fill={element.getAttribute('fill')}
            stroke={element.getAttribute('stroke')}
            opacity={element.getAttribute('opacity')}
          />
        );
      
      case 'path':
        return (
          <Path
            key={element.id || Math.random()}
            d={element.getAttribute('d')}
            fill={element.getAttribute('fill')}
            stroke={element.getAttribute('stroke')}
            strokeWidth={element.getAttribute('stroke-width')}
            strokeDasharray={element.getAttribute('stroke-dasharray')}
            opacity={element.getAttribute('opacity')}
          />
        );
      
      case 'text':
        // Skip measurement text as it will be handled in a separate layer
        if (/^\d+(\.\d+)?$/.test(element.textContent.trim())) {
          return null;
        }
        
        return (
          <Text
            key={element.id || Math.random()}
            x={element.getAttribute('x')}
            y={element.getAttribute('y')}
            style={{
              fontSize: parseInt(element.getAttribute('font-size') || 10),
              fontFamily: element.getAttribute('font-family') || 'Helvetica',
              textAnchor: element.getAttribute('text-anchor') || 'start',
              transform: element.getAttribute('transform'),
            }}
            selectable={true}
          >
            {element.textContent}
          </Text>
        );
      
      case 'g':
        const transform = element.getAttribute('transform');
        const children = Array.from(element.children)
          .map(child => convertElement(child))
          .filter(Boolean); // Remove null elements
        
        return children.length > 0 ? (
          <G
            key={element.id || Math.random()}
            transform={transform}
            opacity={element.getAttribute('opacity')}
          >
            {children}
          </G>
        ) : null;
      
      default:
        return null;
    }
  };

  // Filter out null elements
  const elements = Array.from(svg.children)
    .map(child => convertElement(child))
    .filter(Boolean);

  return (
    <Svg
      viewBox={svg.getAttribute('viewBox')}
      width="100%"
      height="100%"
      preserveAspectRatio="xMidYMid meet"
    >
      {elements}
    </Svg>
  );
};

export default convertSVGToComponents; 