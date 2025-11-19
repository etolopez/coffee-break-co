import React from 'react';
import QRCode from 'react-qr-code';

interface QRCodeDisplayProps {
  /**
   * The data to encode in the QR code (usually a URL)
   */
  value: string;
  
  /**
   * Size of the QR code in pixels (default: 200)
   */
  size?: number;
  
  /**
   * Background color (default: white)
   */
  bgColor?: string;
  
  /**
   * Foreground color (default: black)
   */
  fgColor?: string;
  
  /**
   * Error correction level (default: 'L')
   */
  level?: 'L' | 'M' | 'Q' | 'H';
  
  /**
   * Additional CSS classes
   */
  className?: string;
  
  /**
   * Whether to show a border around the QR code
   */
  showBorder?: boolean;
}

/**
 * A reusable QR code component that generates actual scannable QR codes
 * Uses react-qr-code library for high-quality QR code generation
 */
export const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({
  value,
  size = 200,
  bgColor = '#FFFFFF',
  fgColor = '#000000',
  level = 'L',
  className = '',
  showBorder = true
}) => {
  return (
    <div className={`inline-block ${showBorder ? 'p-4 bg-white rounded-xl shadow-lg border border-gray-200' : ''} ${className}`}>
      <QRCode
        value={value}
        size={size}
        bgColor={bgColor}
        fgColor={fgColor}
        level={level}
        style={{ height: 'auto', maxWidth: '100%', width: '100%' }}
      />
    </div>
  );
};

export default QRCodeDisplay;
