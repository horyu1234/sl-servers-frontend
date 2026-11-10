import { useEffect, useRef, useState } from 'react';

/**
 * Local state for an input whose value is committed elsewhere, such as the URL. Typing only
 * commits after a pause, or at once on `flush`, so each keystroke doesn't reload the list.
 *
 * `source` is the committed value and `sourceKey` a string form of it. When the key changes from
 * outside, such as a chip being cleared, the draft drops what it holds and follows.
 *
 * `normalize` tidies the draft as it is committed, so the field shows what was applied even when
 * that leaves the committed value as it was, such as `05` for a minimum that is already 5.
 */
export function useDraft<D>(
  source: D,
  sourceKey: string,
  commit: (draft: D) => void,
  delayMs: number,
  normalize: (draft: D) => D = (draft) => draft,
) {
  const [draft, setDraft] = useState(source);
  const dirty = useRef(false);
  const commitRef = useRef(commit);
  const normalizeRef = useRef(normalize);

  useEffect(() => {
    commitRef.current = commit;
    normalizeRef.current = normalize;
  });

  useEffect(() => {
    dirty.current = false;
    setDraft(source);
    // Only a new committed value should reset the draft, not a new object for the same value.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sourceKey]);

  const apply = (current: D) => {
    dirty.current = false;
    const next = normalizeRef.current(current);
    setDraft(next);
    commitRef.current(next);
  };

  useEffect(() => {
    if (!dirty.current) return undefined;
    const id = setTimeout(() => apply(draft), delayMs);
    return () => clearTimeout(id);
    // apply only reads refs, so it doesn't need to be a dependency.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft, delayMs]);

  const update = (next: D) => {
    dirty.current = true;
    setDraft(next);
  };

  const flush = () => {
    if (dirty.current) apply(draft);
  };

  return { draft, update, flush };
}
