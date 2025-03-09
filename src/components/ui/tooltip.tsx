import React from 'react';
import { Tooltip as ReactTooltip } from 'react-tooltip';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
}

const Tooltip: React.FC<TooltipProps> = ({ content, children }) => {
  return (
    <ReactTooltip content={content}>
      {children}
    </ReactTooltip>
  );
};

export default Tooltip;