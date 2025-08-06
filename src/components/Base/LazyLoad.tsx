'use client';

import type React from 'react';
import { useInView } from 'react-intersection-observer';

interface LazyLoadProps {
  className?: string;
  children: React.ReactNode;
  placeholder?: React.ReactNode;
}

const LazyLoad = ({
  className = 'w-full h-full',
  children,
  placeholder,
}: LazyLoadProps) => {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <div ref={ref} className={className}>
      {inView ? children : placeholder}
    </div>
  );
};

export default LazyLoad;
