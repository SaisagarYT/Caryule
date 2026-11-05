import React from 'react';

interface WebCanvasProps {
  url: string;
}

export const WebCanvas: React.FC<WebCanvasProps> = ({ url }) => {
  return (
    <div className="w-full h-full relative bg-white">
      <iframe
        src={url}
        className="w-full h-full border-none"
        title="Browser Viewport"
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
      />
    </div>
  );
};

export default WebCanvas;
