import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft, Compass } from 'lucide-react';
import { Button } from '@/components/ui/button';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/3 left-1/4 w-72 h-72 bg-primary/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/3 right-1/4 w-72 h-72 bg-accent/5 rounded-full blur-[100px]" />
      </div>

      <div className="relative text-center max-w-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="mb-8"
        >
          <div className="text-8xl font-display font-bold text-gradient mb-2">404</div>
          <div className="w-24 h-1 rounded-full bg-solana-gradient mx-auto" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h1 className="font-display text-2xl font-bold text-foreground mb-3">
            Lost in the Blockchain
          </h1>
          <p className="text-muted-foreground mb-8">
            This page doesn't exist on any ledger. Let's get you back to building.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          <Link to="/">
            <Button className="gap-2 bg-solana-gradient text-background hover:opacity-90">
              <Home className="w-4 h-4" /> Go Home
            </Button>
          </Link>
          <Link to="/courses">
            <Button variant="outline" className="gap-2 border-border text-foreground">
              <Compass className="w-4 h-4" /> Explore Courses
            </Button>
          </Link>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ delay: 0.8 }}
          className="mt-12 text-xs text-muted-foreground font-mono"
        >
          Error: AccountNotFound • Slot: {Math.floor(Math.random() * 999999999)}
        </motion.p>
      </div>
    </div>
  );
};

export default NotFound;
