import { cn } from '@/lib/utils';
import { ComponentProps } from 'react';

type BackgroundGradientProps = ComponentProps<'div'> & {
  // Additional props can be added here
};

export function BackgroundGradient({
  className,
  children,
  ...props
}: BackgroundGradientProps) {
  return (
    <div className={cn('relative overflow-hidden', className)} {...props}>
      <div className="absolute -z-10 h-full w-full" aria-hidden="true">
        <div className="bg-primary/20 animate-blob absolute top-[20%] left-[20%] h-[50vh] w-[30vw] rounded-full blur-[150px]" />
        <div className="animate-blob animation-delay-2000 absolute top-[10%] right-[25%] h-[40vh] w-[40vw] rounded-full bg-indigo-300/20 blur-[150px]" />
        <div className="animate-blob animation-delay-4000 absolute right-[10%] bottom-[10%] h-[60vh] w-[25vw] rounded-full bg-blue-400/20 blur-[150px]" />
        <div className="animate-blob animation-delay-6000 absolute bottom-[20%] left-[15%] h-[50vh] w-[25vw] rounded-full bg-sky-300/20 blur-[150px]" />
      </div>
      {children}
    </div>
  );
}
