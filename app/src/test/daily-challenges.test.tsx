import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { DailyChallenges } from '@/components/gamification/DailyChallenges';

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

describe('DailyChallenges', () => {
  it('renders daily challenges section', () => {
    const { getByText } = render(<DailyChallenges />);
    expect(getByText('Daily Challenges')).toBeInTheDocument();
  });

  it('renders all three challenges', () => {
    const { getByText } = render(<DailyChallenges />);
    expect(getByText('Complete a Lesson')).toBeInTheDocument();
    expect(getByText('Pass a Code Challenge')).toBeInTheDocument();
    expect(getByText('Read 3 Lessons')).toBeInTheDocument();
  });

  it('renders seasonal event', () => {
    const { getByText } = render(<DailyChallenges />);
    expect(getByText('Solana Summer Sprint 🌴')).toBeInTheDocument();
  });

  it('shows completion count', () => {
    const { getByText } = render(<DailyChallenges />);
    expect(getByText('1/3 done')).toBeInTheDocument();
  });

  it('renders claim buttons for incomplete challenges', () => {
    const { getAllByText } = render(<DailyChallenges />);
    const claimButtons = getAllByText('Claim');
    expect(claimButtons.length).toBe(2);
  });

  it('shows seasonal event progress', () => {
    const { getByText } = render(<DailyChallenges />);
    expect(getByText('2/5 courses')).toBeInTheDocument();
    expect(getByText('+500 XP')).toBeInTheDocument();
  });

  it('claiming a challenge updates the count', () => {
    const { getAllByText, getByText } = render(<DailyChallenges />);
    const claimButtons = getAllByText('Claim');
    claimButtons[0].click();
    expect(getByText('2/3 done')).toBeInTheDocument();
  });
});
