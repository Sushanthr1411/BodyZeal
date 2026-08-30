import { useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

type AnimatedNumberProps = {
  value: number;
  format?: (value: number) => string;
};

export default function AnimatedNumber({ value, format }: AnimatedNumberProps) {
  const motionValue = useMotionValue(0);
  const spring = useSpring(motionValue, { stiffness: 140, damping: 22, mass: 0.6 });
  const display = useTransform(spring, (latest) => {
    const rounded = Math.round(latest);
    return format ? format(rounded) : rounded.toLocaleString();
  });

  useEffect(() => {
    motionValue.set(value);
  }, [value, motionValue]);

  return <motion.span>{display}</motion.span>;
}
