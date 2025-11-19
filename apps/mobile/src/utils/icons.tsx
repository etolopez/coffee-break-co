/**
 * Icon Utilities
 * Wrapper for icons to provide consistent icon usage across the app
 * Uses @expo/vector-icons for React Native compatibility
 */

import { Ionicons } from '@expo/vector-icons';
import { ComponentProps } from 'react';

type IconProps = ComponentProps<typeof Ionicons>;

/**
 * Icon component wrapper with consistent sizing
 */
export const Icon = ({ size = 24, ...props }: IconProps) => {
  return <Ionicons size={size} {...props} />;
};

/**
 * Predefined icon components for common use cases
 */
export const CoffeeIcon = (props: Omit<IconProps, 'name'>) => (
  <Icon name="cafe" {...props} />
);

export const HomeIcon = (props: Omit<IconProps, 'name'>) => (
  <Icon name="home" {...props} />
);

export const UsersIcon = (props: Omit<IconProps, 'name'>) => (
  <Icon name="people" {...props} />
);

export const QrCodeIcon = (props: Omit<IconProps, 'name'>) => (
  <Icon name="qr-code" {...props} />
);

export const MapPinIcon = (props: Omit<IconProps, 'name'>) => (
  <Icon name="location" {...props} />
);

export const StarIcon = (props: Omit<IconProps, 'name'>) => (
  <Icon name="star" {...props} />
);

export const AwardIcon = (props: Omit<IconProps, 'name'>) => (
  <Icon name="trophy" {...props} />
);

export const ArrowRightIcon = (props: Omit<IconProps, 'name'>) => (
  <Icon name="arrow-forward" {...props} />
);

export const SearchIcon = (props: Omit<IconProps, 'name'>) => (
  <Icon name="search" {...props} />
);

export const FilterIcon = (props: Omit<IconProps, 'name'>) => (
  <Icon name="filter" {...props} />
);

export const CameraIcon = (props: Omit<IconProps, 'name'>) => (
  <Icon name="camera" {...props} />
);

export const AlertCircleIcon = (props: Omit<IconProps, 'name'>) => (
  <Icon name="alert-circle" {...props} />
);
