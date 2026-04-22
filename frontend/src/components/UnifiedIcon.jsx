import React, { Suspense, lazy } from 'react';
import * as Iconsax from 'iconsax-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const Lottie = lazy(() => import('lottie-react'));

/**
 * UnifiedIcon component to handle multiple icon libraries and animations.
 * 
 * @param {string} lib - 'iconsax' | 'fa' | 'lordicon' | 'lottie'
 * @param {string} name - The name of the icon (e.g., 'Home2' for Iconsax, 'coffee' for FA)
 * @param {number} size - Icon size in pixels
 * @param {string} color - Icon color
 * @param {string} style - Iconsax style: 'Linear' | 'Bold' | 'Broken' | 'Outline' | 'TwoTone' | 'Bulk'
 * @param {string} trigger - Lordicon trigger: 'hover' | 'click' | 'loop' | 'morph'
 * @param {object} lottieData - JSON data for Lottie animation
 */
const UnifiedIcon = ({ 
  lib = 'iconsax', 
  name, 
  size = 24, 
  color = 'currentColor', 
  variant = 'Linear', 
  trigger = 'hover',
  lottieData,
  className = '',
  style = {}
}) => {
  if (lib === 'iconsax') {
    const IconComponent = Iconsax[name] || Iconsax.Forbidden;
    return <IconComponent size={size} color={color} variant={variant} className={className} style={style} />;
  }

  if (lib === 'fa') {
    return <FontAwesomeIcon icon={name} style={{ fontSize: size, color, ...style }} className={className} />;
  }

  if (lib === 'lordicon') {
    return (
      <lord-icon
        src={`https://cdn.lordicon.com/${name}.json`}
        trigger={trigger}
        colors={`primary:${color}`}
        style={{ width: size, height: size, ...style }}
        className={className}
      />
    );
  }

  if (lib === 'lottie' && lottieData) {
    return (
      <Suspense fallback={<div style={{ width: size, height: size }} />}>
        <div style={{ width: size, height: size, ...style }} className={className}>
          <Lottie animationData={lottieData} loop={false} />
        </div>
      </Suspense>
    );
  }

  return null;
};

export default UnifiedIcon;
