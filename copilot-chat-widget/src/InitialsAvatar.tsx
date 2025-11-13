import { Avatar } from '@fluentui/react-components';
import React from 'react';


interface InitialsAvatarProps {
  name: string;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

function getRandomColor() {
  const colors = [
    "anchor",
"brand",
"neutral",
"colorful",
"dark-red",
"cranberry",
"red",
"pumpkin",
"peach",
"marigold",
"gold",
"brass",
"brown",
"forest",
"seafoam",
"dark-green",
"light-teal",
"teal",
"steel",
"blue",
"royal-blue",
"cornflower",
"navy",
"lavender",
"purple",
"grape",
"lilac",
"pink",
"magenta",
"plum",
"beige",
"mink",
"platinum"
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

export const InitialsAvatar: React.FC<InitialsAvatarProps> = ({ name }) => {
  const initials = getInitials(name);
  const color = React.useMemo(() => getRandomColor(), [name]);
//   return <Avatar name={name} initials={initials} style={{ backgroundColor: color + ' !important' }} />;
  return <Avatar aria-label="Guest" initials={initials} badge={{status: "busy"}} color={color as any} />
};
