import { IconType } from 'react-icons';
import { ComponentWithAs } from '@chakra-ui/react';

declare module 'react-icons' {
  interface IconType extends ComponentWithAs<any, any> {}
} 