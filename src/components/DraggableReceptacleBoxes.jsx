import { useState, useRef, useCallback } from 'react';

const useDraggableReceptacleBoxes = () => {
  const BOX_WIDTH = 30;
  const BOX_HEIGHT = 30;
  const BOX_SPACING = 10;
  const INITIAL_X = 205;
  const INITIAL_Y = 370;
  
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
  
  const [activeBoxId, setActiveBoxId] = useState(null);
  const [startPoint, setStartPoint] = useState({ x: 0, y: 0 });
  const [startBoxPosition, setStartBoxPosition] = useState({ x: 0, y: 0 });
  
  const svgRef = useRef(null);
  const MAX_BOXES = 10;

  // Add a new receptacle box
  const addReceptacleBox = useCallback(() => {
    if (receptacleBoxes.length < MAX_BOXES) {
      const newBoxIndex = receptacleBoxes.length;
      const rowCount = Math.floor(newBoxIndex / 10);
      const colCount = newBoxIndex % 10;
      
      const newBox = {
        id: Date.now(),
        x: INITIAL_X + (colCount * (BOX_WIDTH + BOX_SPACING)),
        y: INITIAL_Y + (rowCount * (BOX_HEIGHT + BOX_SPACING)),
        width: BOX_WIDTH,
        height: BOX_HEIGHT
      };
      
      setReceptacleBoxes(prevBoxes => [...prevBoxes, newBox]);
    }
  }, [receptacleBoxes.length]);

  // Remove a receptacle box
  const removeReceptacleBox = useCallback((id) => {
    // Don't remove if it's the last box
    if (receptacleBoxes.length <= 1) return;
    
    setReceptacleBoxes(prevBoxes => prevBoxes.filter(box => box.id !== id));
  }, [receptacleBoxes.length]);

  // Convert client coordinates to SVG coordinates
  const clientToSVGCoordinates = useCallback((clientX, clientY) => {
    if (!svgRef.current) return { x: 0, y: 0 };
    
    const ctm = svgRef.current.getScreenCTM();
    if (!ctm) return { x: 0, y: 0 };
    
    const svgPoint = svgRef.current.createSVGPoint();
    svgPoint.x = clientX;
    svgPoint.y = clientY;
    
    const point = svgPoint.matrixTransform(ctm.inverse());
    return { x: point.x, y: point.y };
  }, []);

  // Start dragging
  const startDrag = useCallback((event, id) => {
    event.preventDefault();
    
    if (!svgRef.current) return;
    
    const box = receptacleBoxes.find(box => box.id === id);
    if (!box) return;
    
    const point = clientToSVGCoordinates(event.clientX, event.clientY);
    
    setActiveBoxId(id);
    setStartPoint({ x: point.x, y: point.y });
    setStartBoxPosition({ x: box.x, y: box.y });
    
    document.addEventListener('mousemove', handleDrag);
    document.addEventListener('mouseup', endDrag);
  }, [receptacleBoxes, clientToSVGCoordinates]);

  // Handle drag
  const handleDrag = useCallback((event) => {
    if (!activeBoxId) return;
    
    const currentPoint = clientToSVGCoordinates(event.clientX, event.clientY);
    const deltaX = currentPoint.x - startPoint.x;
    const deltaY = currentPoint.y - startPoint.y;
    
    setReceptacleBoxes(prevBoxes => 
      prevBoxes.map(box => {
        if (box.id === activeBoxId) {
          return {
            ...box,
            x: startBoxPosition.x + deltaX,
            y: startBoxPosition.y + deltaY
          };
        }
        return box;
      })
    );
  }, [activeBoxId, startPoint, startBoxPosition, clientToSVGCoordinates]);

  // End dragging
  const endDrag = useCallback(() => {
    setActiveBoxId(null);
    document.removeEventListener('mousemove', handleDrag);
    document.removeEventListener('mouseup', endDrag);
  }, [handleDrag]);

  return {
    svgRef,
    receptacleBoxes,
    addReceptacleBox,
    removeReceptacleBox,
    startDrag,
    MAX_BOXES
  };
};

export default useDraggableReceptacleBoxes;