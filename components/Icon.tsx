import React from 'react';
import { icons, IconName, IconData } from './icons';

// FIX: The errors indicate `className` and other properties are not found on IconProps despite extending SVGProps.
// Using an intersection type with React.ComponentProps<'svg'> is a more robust way to get all SVG attributes.
type IconProps = {
  name: IconName;
} & React.ComponentProps<'svg'>;

const Icon = ({ name, className, ...props }: IconProps) => {
  const iconData: IconData = icons[name];
  if (!iconData) {
    console.warn(`Icon "${name}" not found.`);
    return null;
  }

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox={iconData.viewBox || '0 0 24 24'}
      strokeWidth={iconData.strokeWidth || 1.5}
      stroke="currentColor"
      fillRule={iconData.fillRule}
      aria-hidden="true"
      className={className}
      {...props}
    >
      {iconData.path}
    </svg>
  );
};

export default Icon;