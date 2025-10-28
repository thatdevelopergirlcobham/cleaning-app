// utils/stringUtils.ts
export const getInitials = (name: string): string => {
  if (!name) return 'U';
  return name
    .split(' ')
    .map(part => part[0]?.toUpperCase() || '')
    .join('')
    .substring(0, 2);
};