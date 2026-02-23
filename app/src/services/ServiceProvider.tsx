import { createContext, useContext, type ReactNode } from 'react';
import { LearningProgressService } from './types';
import { LocalLearningProgressService } from './learning-progress';

const ServiceContext = createContext<LearningProgressService | undefined>(undefined);

/**
 * Provides the LearningProgressService implementation via React context.
 * Swap the `service` prop to switch between local storage and on-chain implementations.
 */
export function LearningServiceProvider({
  children,
  service,
}: {
  children: ReactNode;
  service?: LearningProgressService;
}) {
  const impl = service ?? new LocalLearningProgressService();
  return (
    <ServiceContext.Provider value={impl}>
      {children}
    </ServiceContext.Provider>
  );
}

export function useLearningService(): LearningProgressService {
  const ctx = useContext(ServiceContext);
  if (!ctx) throw new Error('useLearningService must be used within LearningServiceProvider');
  return ctx;
}
