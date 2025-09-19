import React, { useState } from 'react';
import { Copy, Check, Eye, EyeOff } from 'lucide-react';

/**
 * Blockchain ID Badge Component
 * Displays Blockchain ID with copy functionality and visibility toggle
 */

const BlockchainIdBadge = ({ 
  blockchainId, 
  showFull = false, 
  copyable = true, 
  className = '',
  size = 'md' 
}) => {
  const [copied, setCopied] = useState(false);
  const [isVisible, setIsVisible] = useState(showFull);

  const handleCopy = async () => {
    if (!copyable || !blockchainId) return;
    
    try {
      await navigator.clipboard.writeText(blockchainId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy blockchain ID:', error);
    }
  };

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  const displayId = isVisible 
    ? blockchainId 
    : `${blockchainId?.slice(0, 4)}...${blockchainId?.slice(-4)}`;

  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2'
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  if (!blockchainId) {
    return (
      <span className={`inline-flex items-center bg-gray-100 text-gray-500 rounded-md font-mono ${sizeClasses[size]} ${className}`}>
        No ID
      </span>
    );
  }

  return (
    <div className={`inline-flex items-center bg-blue-50 text-blue-800 rounded-md font-mono border border-blue-200 ${sizeClasses[size]} ${className}`}>
      <span className="select-all">{displayId}</span>
      
      <div className="flex items-center ml-2 space-x-1">
        {!showFull && (
          <button
            onClick={toggleVisibility}
            className="text-blue-600 hover:text-blue-800 transition-colors"
            title={isVisible ? 'Hide full ID' : 'Show full ID'}
          >
            {isVisible ? (
              <EyeOff className={iconSizes[size]} />
            ) : (
              <Eye className={iconSizes[size]} />
            )}
          </button>
        )}
        
        {copyable && (
          <button
            onClick={handleCopy}
            className="text-blue-600 hover:text-blue-800 transition-colors"
            title="Copy to clipboard"
          >
            {copied ? (
              <Check className={`${iconSizes[size]} text-green-600`} />
            ) : (
              <Copy className={iconSizes[size]} />
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default BlockchainIdBadge;