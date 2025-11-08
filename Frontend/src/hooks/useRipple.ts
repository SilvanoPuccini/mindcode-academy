import { MouseEvent } from 'react';

export interface RippleProps {
  onMouseDown: (e: MouseEvent<HTMLElement>) => void;
}

export function useRipple(): RippleProps {
  const createRipple = (e: MouseEvent<HTMLElement>) => {
    const button = e.currentTarget;
    const ripple = document.createElement('span');
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;

    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    ripple.classList.add('ripple');

    // Remove existing ripples
    const existingRipple = button.querySelector('.ripple');
    if (existingRipple) {
      existingRipple.remove();
    }

    button.appendChild(ripple);

    // Remove ripple after animation completes
    setTimeout(() => {
      ripple.remove();
    }, 600);
  };

  return {
    onMouseDown: createRipple,
  };
}
