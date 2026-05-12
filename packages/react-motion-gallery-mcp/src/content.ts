export function textContent(text: string) {
  return {
    content: [
      {
        type: "text" as const,
        text,
      },
    ],
  };
}

export function jsonContent(value: unknown) {
  return textContent(JSON.stringify(value, null, 2));
}
