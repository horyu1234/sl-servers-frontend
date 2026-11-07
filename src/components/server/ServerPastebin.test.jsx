import React from 'react';
import { beforeAll, describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from '../../i18n/locale/en-US.json';
import { ServerPastebin } from './ServerPastebin';

const frameName = en['server-info']['pastebin-embed']['frame-title'];
const loadingName = en['server-info']['pastebin-embed'].loading;

beforeAll(async () => {
  await i18n.use(initReactI18next).init({
    lng: 'en-US',
    resources: { 'en-US': { translation: en } },
    interpolation: { escapeValue: false },
  });
});

describe('ServerPastebin', () => {
  it("embeds the paste through Pastebin's official embed page", () => {
    render(<ServerPastebin pasteKey="dujQCM81" />);

    const frame = screen.getByTitle(frameName);
    expect(frame).toHaveAttribute('src', 'https://pastebin.com/embed_iframe/dujQCM81');
    expect(frame).toHaveAttribute('loading', 'lazy');
    expect(frame).toHaveAttribute('referrerpolicy', 'no-referrer');
  });

  it('grants the embedded page no sandbox permissions', () => {
    render(<ServerPastebin pasteKey="dujQCM81" />);

    // An empty value is the strictest sandbox. Any token here opens a way out.
    expect(screen.getByTitle(frameName)).toHaveAttribute('sandbox', '');
  });

  it('keeps Pastebin cookies out of the embed request', () => {
    render(<ServerPastebin pasteKey="dujQCM81" />);

    expect(screen.getByTitle(frameName)).toHaveAttribute('credentialless');
  });

  it('shows a placeholder until the frame loads, then removes it', () => {
    render(<ServerPastebin pasteKey="dujQCM81" />);
    expect(screen.getByRole('status', { name: loadingName })).toBeInTheDocument();

    fireEvent.load(screen.getByTitle(frameName));

    expect(screen.queryByRole('status', { name: loadingName })).not.toBeInTheDocument();
  });

  it('keeps the notice and the Pastebin link before and after loading', () => {
    render(<ServerPastebin pasteKey="dujQCM81" />);

    const check = () => {
      expect(screen.getByText(en['server-info']['pastebin-embed'].notice)).toBeInTheDocument();
      const link = screen.getByRole('link', { name: en['server-info']['pastebin-embed'].open });
      expect(link).toHaveAttribute('href', 'https://pastebin.com/dujQCM81');
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noreferrer');
    };

    check();
    fireEvent.load(screen.getByTitle(frameName));
    check();
  });

  it('starts over with a fresh frame when the paste changes', () => {
    const { rerender } = render(<ServerPastebin pasteKey="dujQCM81" />);
    const firstFrame = screen.getByTitle(frameName);
    fireEvent.load(firstFrame);

    rerender(<ServerPastebin pasteKey="Ybmdi6Bj" />);

    const nextFrame = screen.getByTitle(frameName);
    expect(nextFrame).not.toBe(firstFrame);
    expect(nextFrame).toHaveAttribute('src', 'https://pastebin.com/embed_iframe/Ybmdi6Bj');
    expect(screen.getByRole('status', { name: loadingName })).toBeInTheDocument();
  });

  it.each([
    ['empty', ''],
    ['missing', undefined],
    ['malformed', '../../aa'],
    ['a full URL', 'https://evil.example/dujQCM81'],
  ])('renders nothing for a key that is %s', (_label, pasteKey) => {
    const { container } = render(<ServerPastebin pasteKey={pasteKey} />);
    expect(container).toBeEmptyDOMElement();
  });
});
