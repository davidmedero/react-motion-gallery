export function DefaultCounterText({ index, count }: { index: number; count: number }) {
  return (
    <span>
      {index + 1} / {count}
    </span>
  );
}