import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { CourseCard } from '@/components/course/CourseCard';
import { MOCK_COURSES } from '@/services/mock-data';

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

vi.mock('@/i18n/LanguageContext', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    language: 'en',
    setLanguage: vi.fn(),
  }),
}));

const renderCard = (props: any = {}) => {
  return render(
    <BrowserRouter>
      <CourseCard course={MOCK_COURSES[0]} {...props} />
    </BrowserRouter>
  );
};

describe('CourseCard', () => {
  const course = MOCK_COURSES[0];

  it('renders course title', () => {
    const { getByText } = renderCard();
    expect(getByText(course.title)).toBeInTheDocument();
  });

  it('renders short description', () => {
    const { getByText } = renderCard();
    expect(getByText(course.shortDescription)).toBeInTheDocument();
  });

  it('renders XP reward', () => {
    const { getByText } = renderCard();
    expect(getByText(`+${course.xpReward} XP`)).toBeInTheDocument();
  });

  it('renders progress bar when progress provided', () => {
    const { getByText } = renderCard({ progress: 45 });
    expect(getByText('45%')).toBeInTheDocument();
    expect(getByText('Progress')).toBeInTheDocument();
  });

  it('does not render progress bar without progress', () => {
    const { queryByText } = renderCard();
    expect(queryByText('Progress')).not.toBeInTheDocument();
  });

  it('links to the correct course detail page', () => {
    const { getByRole } = renderCard();
    const link = getByRole('link');
    expect(link).toHaveAttribute('href', `/courses/${course.slug}`);
  });

  it('renders track name', () => {
    const { getByText } = renderCard();
    expect(getByText(course.track)).toBeInTheDocument();
  });

  it('renders enrolled count', () => {
    const { getByText } = renderCard();
    expect(getByText(course.enrolledCount.toLocaleString())).toBeInTheDocument();
  });
});
