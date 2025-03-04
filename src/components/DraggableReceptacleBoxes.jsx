import { useState, useRef, useEffect } from 'react';

const useDraggableReceptacleBoxes = () => {
  const BOX_WIDTH = 30;
  const BOX_HEIGHT = 30;
  const BOX_SPACING = 10;
  const INITIAL_X = 205;
  const INITIAL_Y = 370;
  
  // Rectangle boundary constraints
  const BOUNDARY = {
    x: 150,
    y: 150,
    width: 500,
    height: 300
  };
  
  // Initialize with one default box
  const [receptacleBoxes, setReceptacleBoxes] = useState([
    {
      id: Date.now(),
      x: INITIAL_X,
      y: INITIAL_Y,
      width: BOX_WIDTH,
      height: BOX_HEIGHT
    }
  ]);
  
  const [boxCount, setBoxCount] = useState(1);
  const [activeBoxId, setActiveBoxId] = useState(null);
  const [startPoint, setStartPoint] = useState({ x: 0, y: 0 });
  const [startBoxPosition, setStartBoxPosition] = useState({ x: 0, y: 0 });
  
  const svgRef = useRef(null);
  const MIN_BOXES = 1;
  const MAX_BOXES = 10;

  // Increment box count
  const incrementBoxCount = () => {
    if (boxCount < MAX_BOXES) {
      const newCount = boxCount + 1;
      setBoxCount(newCount);
      
      // Calculate position for the new box
      const rowCount = Math.floor((newCount - 1) / 10);
      const colCount = (newCount - 1) % 10;
      
      // Calculate initial position (ensure it's within boundaries)
      let x = INITIAL_X + (colCount * (BOX_WIDTH + BOX_SPACING));
      let y = INITIAL_Y + (rowCount * (BOX_HEIGHT + BOX_SPACING));
      
      // Constrain to boundary if needed
      x = Math.max(BOUNDARY.x, Math.min(BOUNDARY.x + BOUNDARY.width - BOX_WIDTH, x));
      y = Math.max(BOUNDARY.y, Math.min(BOUNDARY.y + BOUNDARY.height - BOX_HEIGHT, y));
      
      const newBox = {
        id: Date.now(),
        x: x,
        y: y,
        width: BOX_WIDTH,
        height: BOX_HEIGHT
      };
      
      setReceptacleBoxes(prevBoxes => [...prevBoxes, newBox]);
    }
  };

  // Decrement box count
  const decrementBoxCount = () => {
    if (boxCount > MIN_BOXES) {
      const newCount = boxCount - 1;
      setBoxCount(newCount);
      
      // Remove the last box
      setReceptacleBoxes(prevBoxes => prevBoxes.slice(0, newCount));
    }
  };

  // Convert client coordinates to SVG coordinates
  const clientToSVGCoordinates = (clientX, clientY) => {
    if (!svgRef.current) return { x: 0, y: 0 };
    
    const ctm = svgRef.current.getScreenCTM();
    if (!ctm) return { x: 0, y: 0 };
    
    const svgPoint = svgRef.current.createSVGPoint();
    svgPoint.x = clientX;
    svgPoint.y = clientY;
    
    const point = svgPoint.matrixTransform(ctm.inverse());
    return { x: point.x, y: point.y };
  };

  // Constrain position to stay within boundaries
  const constrainToBoundary = (x, y) => {
    return {
      x: Math.max(BOUNDARY.x, Math.min(BOUNDARY.x + BOUNDARY.width - BOX_WIDTH, x)),
      y: Math.max(BOUNDARY.y, Math.min(BOUNDARY.y + BOUNDARY.height - BOX_HEIGHT, y))
    };
  };

  // Start dragging
  const startDrag = (event, id) => {
    event.preventDefault();
    
    if (!svgRef.current) return;
    
    const box = receptacleBoxes.find(box => box.id === id);
    if (!box) return;
    
    const point = clientToSVGCoordinates(event.clientX, event.clientY);
    
    setActiveBoxId(id);
    setStartPoint({ x: point.x, y: point.y });
    setStartBoxPosition({ x: box.x, y: box.y });
  };

  // Use useEffect to manage drag events
  useEffect(() => {
    if (activeBoxId === null) return;
    
    const handleDrag = (event) => {
      const currentPoint = clientToSVGCoordinates(event.clientX, event.clientY);
      const deltaX = currentPoint.x - startPoint.x;
      const deltaY = currentPoint.y - startPoint.y;
      
      setReceptacleBoxes(prevBoxes => 
        prevBoxes.map(box => {
          if (box.id === activeBoxId) {
            // Calculate new position
            const newX = startBoxPosition.x + deltaX;
            const newY = startBoxPosition.y + deltaY;
            
            // Constrain to boundary
            const constrained = constrainToBoundary(newX, newY);
            
            return {
              ...box,
              x: constrained.x,
              y: constrained.y
            };
          }
          return box;
        })
      );
    };
    
    const endDrag = () => {
      setActiveBoxId(null);
    };
    
    // Add event listeners
    document.addEventListener('mousemove', handleDrag);
    document.addEventListener('mouseup', endDrag);
    
    // Clean up
    return () => {
      document.removeEventListener('mousemove', handleDrag);
      document.removeEventListener('mouseup', endDrag);
    };
  }, [activeBoxId, startPoint, startBoxPosition]);

  return {
    svgRef,
    receptacleBoxes,
    boxCount,
    incrementBoxCount,
    decrementBoxCount,
    startDrag,
    MIN_BOXES,
    MAX_BOXES
  };
};

export default useDraggableReceptacleBoxes;