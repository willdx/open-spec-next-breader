'use client';

import { useState, useRef, useCallback } from 'react';

interface DraggableDividerProps {
  onDrag?: (position: number) => void;
  isDragging?: boolean;
  setIsDragging?: (dragging: boolean) => void;
}

export default function DraggableDivider({
  onDrag,
  isDragging = false,
  setIsDragging
}: DraggableDividerProps) {
  const dividerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    if (setIsDragging) {
      setIsDragging(true);
    }

    const startX = e.clientX;
    const startWidth = e.currentTarget.parentElement?.offsetWidth || 0;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const newWidth = Math.max(200, Math.min(startWidth + deltaX, window.innerWidth - 300));

      if (onDrag) {
        onDrag(newWidth);
      }
    };

    const handleMouseUp = () => {
      if (setIsDragging) {
        setIsDragging(false);
      }
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [onDrag, setIsDragging]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    if (setIsDragging) {
      setIsDragging(true);
    }

    const startX = e.touches[0].clientX;
    const startWidth = e.currentTarget.parentElement?.offsetWidth || 0;

    const handleTouchMove = (moveEvent: TouchEvent) => {
      const deltaX = moveEvent.touches[0].clientX - startX;
      const newWidth = Math.max(200, Math.min(startWidth + deltaX, window.innerWidth - 300));

      if (onDrag) {
        onDrag(newWidth);
      }
    };

    const handleTouchEnd = () => {
      if (setIsDragging) {
        setIsDragging(false);
      }
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };

    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleTouchEnd);
  }, [onDrag, setIsDragging]);

  return (
    <div
      ref={dividerRef}
      className={`draggable-divider ${isDragging ? 'dragging' : ''} ${isHovered ? 'hovered' : ''}`}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        width: '6px',
        background: isDragging
          ? 'linear-gradient(to right, #e5e7eb, #d1d5db, #e5e7eb)'
          : isHovered
            ? 'linear-gradient(to right, #f3f4f6, #e5e7eb, #f3f4f6)'
            : '#f3f4f6',
        cursor: 'col-resize',
        position: 'relative',
        transition: isDragging ? 'none' : 'background-color 0.2s ease',
        userSelect: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      {/* 分割线指示器 */}
      <div
        style={{
          width: '2px',
          height: isHovered || isDragging ? '40px' : '24px',
          background: isDragging ? '#9ca3af' : '#d1d5db',
          borderRadius: '1px',
          transition: isDragging ? 'none' : 'all 0.2s ease',
          opacity: isHovered || isDragging ? 1 : 0.6
        }}
      />

      {/* 拖拽时的提示线 */}
      {isDragging && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            width: '1px',
            background: '#3b82f6',
            left: '50%',
            transform: 'translateX(-50%)',
            pointerEvents: 'none'
          }}
        />
      )}
    </div>
  );
}