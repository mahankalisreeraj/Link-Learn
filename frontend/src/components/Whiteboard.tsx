import React, { useEffect, useRef } from 'react';
import { Canvas } from 'fabric';


const Whiteboard: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const fabricCanvasRef = useRef<Canvas | null>(null);

    useEffect(() => {
        if (!canvasRef.current || !containerRef.current) return;

        // Initialize Canvas
        const canvas = new Canvas(canvasRef.current, {
            isDrawingMode: true,
            height: containerRef.current.offsetHeight,
            width: containerRef.current.offsetWidth,
            backgroundColor: '#ffffff'
        });


        // Default Brush
        if (canvas.freeDrawingBrush) {
            canvas.freeDrawingBrush.width = 5;
            canvas.freeDrawingBrush.color = '#000000';
        }

        fabricCanvasRef.current = canvas;

        // Resize Handler
        const handleResize = () => {
            if (containerRef.current && fabricCanvasRef.current) {
                fabricCanvasRef.current.setDimensions({
                    width: containerRef.current.offsetWidth,
                    height: containerRef.current.offsetHeight
                });
            }
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            canvas.dispose();
        };
    }, []);

    return (
        <div className="w-full h-full bg-slate-50 relative shadow-inner rounded-xl overflow-hidden" ref={containerRef}>
            <canvas ref={canvasRef} />

            {/* Simple Tools Overlay (Placeholder) */}
            <div className="absolute top-4 left-4 bg-white p-2 rounded-lg shadow-md flex gap-2 border border-slate-200">
                <div className="w-4 h-4 bg-black rounded-full cursor-pointer hover:scale-110" onClick={() => { if (fabricCanvasRef.current?.freeDrawingBrush) fabricCanvasRef.current.freeDrawingBrush.color = '#000000'; }}></div>
                <div className="w-4 h-4 bg-red-500 rounded-full cursor-pointer hover:scale-110" onClick={() => { if (fabricCanvasRef.current?.freeDrawingBrush) fabricCanvasRef.current.freeDrawingBrush.color = '#ef4444'; }}></div>
                <div className="w-4 h-4 bg-blue-500 rounded-full cursor-pointer hover:scale-110" onClick={() => { if (fabricCanvasRef.current?.freeDrawingBrush) fabricCanvasRef.current.freeDrawingBrush.color = '#3b82f6'; }}></div>
            </div>
        </div>
    );
};

export default Whiteboard;
