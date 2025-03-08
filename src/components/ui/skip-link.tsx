import React from 'react';

interface SkipLinkProps {
  targetId: string;
  text?: string;
}

const SkipLink: React.FC<SkipLinkProps> = ({ 
  targetId, 
  text = "Saltar al contenido principal" 
}) => {
  return (
    <a
      href={`#${targetId}`}
      className="
        absolute 
        -translate-y-full 
        focus:translate-y-0 
        left-4 
        top-4 
        z-50 
        bg-blue-600 
        text-white 
        px-4 
        py-2 
        rounded 
        transition-transform 
        focus:outline-none 
        focus:ring-2 
        focus:ring-blue-500
      "
    >
      {text}
    </a>
  );
};

export default SkipLink;