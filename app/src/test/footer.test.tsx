import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Footer } from '@/components/layout/Footer';

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

const renderFooter = () => render(
  <BrowserRouter><Footer /></BrowserRouter>
);

describe('Footer', () => {
  it('renders SolDev Labs brand', () => {
    const { getByText } = renderFooter();
    expect(getByText('SolDev Labs')).toBeInTheDocument();
  });

  it('renders copyright with 2026', () => {
    const { getByText } = renderFooter();
    expect(getByText(/© 2026/)).toBeInTheDocument();
  });

  it('renders platform links', () => {
    const { getByText } = renderFooter();
    expect(getByText('Courses')).toBeInTheDocument();
    expect(getByText('Leaderboard')).toBeInTheDocument();
    expect(getByText('Dashboard')).toBeInTheDocument();
  });

  it('renders resource links with real URLs', () => {
    const { getByText } = renderFooter();
    const solanaDocsLink = getByText('Solana Docs');
    expect(solanaDocsLink).toHaveAttribute('href', 'https://solana.com/docs');
  });

  it('renders community links with real URLs', () => {
    const { getByText } = renderFooter();
    const discordLink = getByText('Discord');
    expect(discordLink).toHaveAttribute('href', 'https://discord.gg/solana');
  });

  it('social icons have aria-labels', () => {
    const { getByLabelText } = renderFooter();
    expect(getByLabelText('GitHub')).toBeInTheDocument();
    expect(getByLabelText('Twitter')).toBeInTheDocument();
  });

  it('has contentinfo role', () => {
    const { getByRole } = renderFooter();
    expect(getByRole('contentinfo')).toBeInTheDocument();
  });

  it('renders newsletter signup', () => {
    const { getByText, getByPlaceholderText } = renderFooter();
    expect(getByText('Subscribe to updates')).toBeInTheDocument();
    expect(getByPlaceholderText('dev@solana.com')).toBeInTheDocument();
  });
});
