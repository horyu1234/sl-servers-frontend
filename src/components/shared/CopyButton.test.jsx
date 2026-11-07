import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { toast } from 'sonner';
import { CopyButton } from './CopyButton';

vi.mock('sonner', () => ({ toast: { info: vi.fn() } }));

function mockClipboard(writeText) {
  Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } });
}

describe('CopyButton', () => {
  beforeEach(() => vi.clearAllMocks());

  it('copies the value and confirms it', async () => {
    const writeText = vi.fn().mockResolvedValue();
    mockClipboard(writeText);
    render(<CopyButton value="1.2.3.4:7777" label="Copy" copiedLabel="Copied" />);

    fireEvent.click(screen.getByRole('button', { name: 'Copy' }));

    expect(writeText).toHaveBeenCalledWith('1.2.3.4:7777');
    expect(await screen.findByRole('button', { name: 'Copied' })).toBeInTheDocument();
  });

  it('shows the value when clipboard access is blocked', async () => {
    mockClipboard(vi.fn().mockRejectedValue(new Error('denied')));
    render(<CopyButton value="1.2.3.4:7777" label="Copy" copiedLabel="Copied" />);

    fireEvent.click(screen.getByRole('button', { name: 'Copy' }));

    await waitFor(() => expect(toast.info).toHaveBeenCalledWith('1.2.3.4:7777'));
  });
});
