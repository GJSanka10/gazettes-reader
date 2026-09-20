/** A Material Symbol used next to text that already carries the meaning —
 *  never as the sole carrier of information (spec §55). Always aria-hidden. */
export function Icon({ name, className = "" }: { name: string; className?: string }) {
  return (
    <span aria-hidden="true" className={`material-symbols-outlined ${className}`}>
      {name}
    </span>
  );
}
