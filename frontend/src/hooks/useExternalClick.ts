"use client";
import { Maybe } from '@/types';
import { RefObject, useEffect } from 'react';

export default function useExternalClick(ref: RefObject<Maybe<HTMLElement>>, callback: () => void): void {
  const onClick = (event: MouseEvent) => {
    if (!ref?.current?.contains(event.target as Node)) {
      callback();
    }
  };

  useEffect(() => {
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  });
}
