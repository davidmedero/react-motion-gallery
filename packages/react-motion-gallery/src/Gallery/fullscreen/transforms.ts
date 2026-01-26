export type WrappedTransformArgs = {
  length: number;
  sign: number;
};

export function createWrappedTransform({ length, sign }: WrappedTransformArgs) {
  return (index: number) => {
    const originalCount = length - 2;
    if (index === 0) return `translateX(${-100 * sign}%)`;
    if (index === length - 1) return `translateX(${originalCount * 100 * sign}%)`;
    return `translateX(${(index - 1) * 100 * sign}%)`;
  };
}

export function createSingleTransform() {
  return () => `translateX(0%)`;
}