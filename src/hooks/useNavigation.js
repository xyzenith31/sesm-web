import { useContext } from 'react';
import { NavigationContext } from '../context/NavigationContext';

export const useNavigation = () => {
  return useContext(NavigationContext);
};