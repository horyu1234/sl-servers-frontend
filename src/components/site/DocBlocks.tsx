import React from 'react';
import { LocaleLink } from '../shell/LocaleLink';
import { parseInline } from '../../site/docs/types';
import type { DocBlock } from '../../site/docs/types';

const LINK = 'text-primary underline-offset-2 hover:underline';

/** Text with the three inline marks of the written pages: links, code and bold. */
export function Inline({ text }: { text: string }) {
  return (
    <>
      {parseInline(text).map((token, index) => {
        if (token.type === 'link') {
          return token.href.startsWith('/')
            ? <LocaleLink key={index} to={token.href} className={LINK}>{token.text}</LocaleLink>
            : <a key={index} href={token.href} target="_blank" rel="noreferrer" className={LINK}>{token.text}</a>;
        }
        if (token.type === 'code') {
          return <code key={index} className="break-words rounded bg-muted px-1 py-0.5 text-[0.85em] text-foreground">{token.text}</code>;
        }
        if (token.type === 'bold') return <strong key={index} className="font-semibold text-foreground">{token.text}</strong>;
        return <React.Fragment key={index}>{token.text}</React.Fragment>;
      })}
    </>
  );
}

function Block({ block }: { block: DocBlock }) {
  switch (block.type) {
    case 'h2':
      return <h2 className="pt-4 text-lg font-semibold tracking-tight text-foreground">{block.text}</h2>;
    case 'h3':
      return <h3 className="pt-1 text-sm font-semibold text-foreground">{block.text}</h3>;
    case 'p':
      return <p><Inline text={block.text} /></p>;
    case 'ul':
      return (
        <ul className="list-disc space-y-1.5 pl-5">
          {block.items.map((item) => <li key={item}><Inline text={item} /></li>)}
        </ul>
      );
    case 'code':
      return (
        <pre className="overflow-x-auto rounded-lg border border-border bg-muted/40 p-3 text-xs leading-5 text-foreground">
          <code>{block.text}</code>
        </pre>
      );
    case 'table':
      return (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-muted-foreground">
                {block.head.map((label) => <th key={label} scope="col" className="py-1.5 pr-4 font-normal">{label}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {block.rows.map((row, index) => (
                <tr key={index}>
                  {row.map((cell, column) => (
                    <td key={column} className="py-2 pr-4 align-top"><Inline text={cell} /></td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
  }
}

export function DocBlocks({ blocks }: { blocks: DocBlock[] }) {
  return (
    <div className="space-y-3 text-sm leading-6 text-muted-foreground">
      {blocks.map((block, index) => <Block key={index} block={block} />)}
    </div>
  );
}

export default DocBlocks;
