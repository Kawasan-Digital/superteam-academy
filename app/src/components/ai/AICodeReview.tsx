import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { aiRequest } from '@/services/ai-service';
import ReactMarkdown from 'react-markdown';

interface AICodeReviewProps {
  code: string;
  language: string;
  challengeInstructions: string;
}

export function AICodeReview({ code, language, challengeInstructions }: AICodeReviewProps) {
  const [review, setReview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);

  const requestReview = useCallback(async () => {
    if (loading || !code.trim()) return;
    setLoading(true);
    setShow(true);
    try {
      const result = await aiRequest({
        messages: [{ role: 'user', content: `Review this ${language} code:\n\n\`\`\`${language}\n${code}\n\`\`\`` }],
        mode: 'code-review',
        context: `Challenge: ${challengeInstructions}`,
      });
      setReview(result);
    } catch (e) {
      setReview(`⚠️ ${e instanceof Error ? e.message : 'Failed to get review'}`);
    } finally {
      setLoading(false);
    }
  }, [code, language, challengeInstructions, loading]);

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={requestReview}
        disabled={loading || !code.trim()}
        className="gap-1.5 text-xs border-primary/30 text-primary hover:bg-primary/10"
      >
        {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
        AI Review
      </Button>

      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 rounded-xl border border-primary/20 bg-primary/5 overflow-hidden"
          >
            <div className="flex items-center justify-between px-3 py-2 border-b border-primary/10">
              <span className="text-xs font-medium text-primary flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> AI Code Review
              </span>
              <button onClick={() => setShow(false)} className="p-1 rounded hover:bg-secondary">
                <X className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            </div>
            <div className="px-3 py-3 max-h-64 overflow-y-auto">
              {loading ? (
                <div className="flex items-center gap-2 text-xs text-muted-foreground py-4 justify-center">
                  <Loader2 className="w-4 h-4 animate-spin" /> Analyzing your code...
                </div>
              ) : review ? (
                <div className="prose prose-sm dark:prose-invert prose-p:my-1 prose-headings:my-2 max-w-none text-sm">
                  <ReactMarkdown>{review}</ReactMarkdown>
                </div>
              ) : null}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
