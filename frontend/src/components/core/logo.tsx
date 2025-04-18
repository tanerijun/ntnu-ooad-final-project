'use client';

import * as React from 'react';
import { type SVGProps } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { useColorScheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { NoSsr } from '@/components/core/no-ssr';

const HEIGHT = 32;

function LogoIcon(props: SVGProps<SVGSVGElement>): React.JSX.Element {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 48 48" {...props}>
      <path
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m17.473 5.357l2.517 2.518l-11.971 11.97L5.5 17.33zm21.411 15.71l2.517 2.517l-14.828 14.828l-2.517-2.517zm-15.74-2.823l2.517 2.517l-8.365 8.365l-2.517-2.517zm7.966 1.303l2.517 2.518L21.932 33.76l-2.517-2.517zm-11.644-6.888l2.518 2.517l-9.32 9.32l-2.517-2.518zM40.66 28.56l1.84 14.08l-13.81-2.11zm-2.74 13.36l3.86-3.87"
      />
    </svg>
  );
}

export interface LogoProps {
  color?: 'dark' | 'light';
  emblem?: boolean;
  height?: number;
  width?: number;
}

export function Logo({ color = 'dark', emblem, height = HEIGHT }: LogoProps): React.JSX.Element {
  const iconColor = color === 'light' ? '#fff' : '#000';

  if (emblem) {
    return <LogoIcon style={{ color: iconColor, fontSize: height }} />;
  }

  return (
    <Stack direction="row" spacing={1} alignItems="center">
      <LogoIcon
        style={{
          color: iconColor,
          fontSize: height,
        }}
      />
      <Typography
        variant="h6"
        sx={{
          fontSize: height * 0.75,
          fontWeight: 700,
          color: iconColor,
          letterSpacing: '0.05em',
        }}
      >
        OOAD
      </Typography>
    </Stack>
  );
}

export interface DynamicLogoProps {
  colorDark?: 'dark' | 'light';
  colorLight?: 'dark' | 'light';
  emblem?: boolean;
  height?: number;
  width?: number;
}

export function DynamicLogo({
  colorDark = 'light',
  colorLight = 'dark',
  height = HEIGHT,
  ...props
}: DynamicLogoProps): React.JSX.Element {
  const { colorScheme } = useColorScheme();
  const color = colorScheme === 'dark' ? colorDark : colorLight;

  return (
    <NoSsr fallback={<Box sx={{ height: `${height}px` }} />}>
      <Logo color={color} height={height} {...props} />
    </NoSsr>
  );
}
