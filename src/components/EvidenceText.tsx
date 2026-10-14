export default function EvidenceText({ text, phrase }: { text: string; phrase?: string }) {
  const start = phrase ? text.toLowerCase().indexOf(phrase.toLowerCase()) : -1;
  if (!phrase || start < 0) return <>{text}</>;
  return <>{text.slice(0, start)}<mark>{text.slice(start, start + phrase.length)}</mark>{text.slice(start + phrase.length)}</>;
}
