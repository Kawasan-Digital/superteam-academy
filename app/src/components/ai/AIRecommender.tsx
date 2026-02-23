import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { aiRequest } from '@/services/ai-service';
import ReactMarkdown from 'react-markdown';

interface AIRecommenderProps {
  completedCourses: string[];
  currentLevel: number;
  skills: Record<string, number>;
}

export function AIRecommender({ completedCourses, currentLevel, skills }: AIRecommenderProps) {
  const [recommendation, setRecommendation] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const getRecommendation = useCallback(async () => {
    setLoading(true);
    try {
      const context = `User level: ${currentLevel}\nCompleted courses: ${completedCourses.join(', ') || 'None yet'}\nSkills: ${Object.entries(skills).map(([k, v]) => `${k}: ${v}%`).join(', ')}`;
      const result = await aiRequest({
        messages: [{ role: 'user', content: 'What courses should I take next to advance my Solana development skills?' }],
        mode: 'recommend',
        context,
      });
      setRecommendation(result);
    } catch (e) {
      setRecommendation(`⚠️ ${e instanceof Error ? e.message : 'Failed to get recommendations'}`);
    } finally {
      setLoading(false);
    }
  }, [completedCourses, currentLevel, skills]);

  return (
    <div className="relative group">
      <div className="absolute -inset-px rounded-2xl bg-solana-gradient opacity-[0.08] group-hover:opacity-[0.15] blur-sm transition-opacity duration-500" />
      <div className="relative rounded-2xl border border-border/50 bg-card p-5 overflow-hidden">
        {/* Mesh bg */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] via-transparent to-accent/[0.03]" />

        <div className="relative flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute -inset-1 bg-solana-gradient opacity-20 rounded-xl blur-md" />
              <div className="relative w-9 h-9 rounded-xl bg-solana-gradient flex items-center justify-center">
                <Sparkles className="w-4.5 h-4.5 text-background" />
              </div>
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">AI Recommendations</h3>
              <p className="text-[11px] text-muted-foreground">Personalized learning path</p>
            </div>
          </div>
          {recommendation && (
            <Button variant="ghost" size="icon" onClick={getRecommendation} disabled={loading} className="h-8 w-8 hover:bg-primary/5">
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          )}
        </div>

        <AnimatePresence mode="wait">
          {!recommendation && !loading ? (
            <motion.div key="cta" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative">
              <Button
                onClick={getRecommendation}
                variant="outline"
                className="w-full gap-2 border-primary/20 text-primary hover:bg-primary/5 hover:border-primary/30 transition-all"
              >
                <Sparkles className="w-4 h-4" /> Get AI Recommendations
              </Button>
            </motion.div>
          ) : loading && !recommendation ? (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center justify-center py-6 gap-2 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin text-primary" /> Analyzing your progress...
            </motion.div>
          ) : recommendation ? (
            <motion.div key="result" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}>
              <div className="prose prose-sm dark:prose-invert prose-p:my-1 prose-headings:my-2 max-w-none text-sm relative">
                <ReactMarkdown>{recommendation}</ReactMarkdown>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}
