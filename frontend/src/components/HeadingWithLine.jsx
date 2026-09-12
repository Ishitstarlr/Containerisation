import React from 'react';

const HeadingWithLine = ({ text, subText, width = "100%" }) => {
  return (
    <div className="relative inline-block">
      <div className="text-center">
        {text}
      </div>
      <div className="relative mt-2" style={{ width }}>
        <div className="w-full h-[1px] bg-gray-200" 
          style={{
            backgroundImage: 'linear-gradient(to right, transparent, rgba(0,0,0,0.1) 25%, rgba(0,0,0,0.1) 75%, transparent)',
          }}
        />
        {subText && (
          <div className="text-gray-400 text-xs mt-1 text-center">{subText}</div>
        )}
      </div>
    </div>
  );
};

export default HeadingWithLine; 