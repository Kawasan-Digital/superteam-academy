import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { XPProgressBar } from '@/components/gamification/XPProgressBar';

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, style, ...props }: any) => <div style={style} {...props}>{children}</div>,
  },
}));

describe('XPProgressBar', () => {
  it('renders XP value with label', () => {
    const { getByText } = render(<XPProgressBar currentXP={500} currentLevel={2} />);
    expect(getByText('500 XP')).toBeInTheDocument();
  });

  it('shows XP needed for next level', () => {
    const { getByText } = render(<XPProgressBar currentXP={500} currentLevel={2} />);
    expect(getByText('400 XP to Level 3')).toBeInTheDocument();
  });

  it('hides label when showLabel is false', () => {
    const { queryByText } = render(<XPProgressBar currentXP={500} currentLevel={2} showLabel={false} />);
    expect(queryByText('500 XP')).not.toBeInTheDocument();
  });
});
