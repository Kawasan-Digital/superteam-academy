import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, User, ArrowRight, Eye, EyeOff, Zap, BookOpen, Award, Wallet } from "lucide-react";
import logoImg from "@/assets/logo.png";
import { Navigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { SEO } from "@/components/SEO";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "@/i18n/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { lovable } from "@/integrations/lovable/index";
import { supabase } from "@/integrations/supabase/client";
import { useWalletAuth } from "@/hooks/useWalletAuth";

const Auth = () => {
  const { t } = useTranslation();
  const { user, loading, signUp, signIn } = useAuth();
  const { loginWithWallet, status: walletStatus } = useWalletAuth();
  const { toast } = useToast();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!loading && user) return <Navigate to="/dashboard" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;

    setSubmitting(true);
    const { error } = mode === "signup" ? await signUp(email, password, displayName) : await signIn(email, password);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else if (mode === "signup") {
      toast({ title: "Account created!", description: "Please check your email to verify your account." });
    }
    setSubmitting(false);
  };

  const benefits = [
    { icon: Zap, text: "Earn XP & level up", color: "text-accent" },
    { icon: BookOpen, text: "Access all courses", color: "text-primary" },
    { icon: Award, text: "On-chain credentials", color: "text-solana-purple" },
  ];

  return (
    <MainLayout>
      <SEO
        title="Sign In — SolDev Labs"
        description="Sign in or create your SolDev Labs account. Learn Solana development with interactive courses."
        path="/auth"
      />
      <div className="relative min-h-[calc(100vh-8rem)] flex items-center justify-center px-4 py-12 overflow-hidden">
        {/* Background orbs */}
        <div className="absolute top-1/4 -left-32 w-[500px] h-[500px] bg-primary/8 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 -right-32 w-[400px] h-[400px] bg-accent/8 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-solana-purple/5 rounded-full blur-[150px] pointer-events-none" />

        {/* Dot grid */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(circle, hsl(var(--foreground)) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />

        <div className="relative w-full max-w-5xl grid lg:grid-cols-2 gap-12 items-center">
          {/* Left — branding */}
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} className="hidden lg:block">
            <div className="mb-10">
              <img src={logoImg} alt="SolDev Labs" className="w-14 h-14 rounded-2xl shadow-lg shadow-primary/20 mb-8" />
              <h1 className="font-display text-5xl font-bold text-foreground mb-4 leading-tight">
                {mode === "signup" ? (
                  <>
                    Start Your{" "}
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-solana-purple to-accent">
                      Journey
                    </span>
                  </>
                ) : (
                  <>
                    Welcome{" "}
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-solana-purple to-accent">
                      Back
                    </span>
                  </>
                )}
              </h1>
              <p className="text-muted-foreground text-lg leading-relaxed max-w-md">
                {mode === "signup"
                  ? "Join thousands of developers mastering Solana development."
                  : "Continue building on Solana. Your progress awaits."}
              </p>
            </div>

            <div className="space-y-4">
              {benefits.map((b, i) => (
                <motion.div
                  key={b.text}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.1 }}
                  className="group flex items-center gap-4"
                >
                  <div className="w-12 h-12 rounded-2xl bg-secondary/30 border border-border/30 flex items-center justify-center group-hover:border-primary/30 group-hover:bg-primary/5 transition-all duration-300">
                    <b.icon className={`w-5 h-5 ${b.color}`} />
                  </div>
                  <span className="text-sm text-foreground font-medium">{b.text}</span>
                </motion.div>
              ))}
            </div>

            {/* Decorative stats */}
            <div className="mt-10 flex gap-6">
              {[
                { value: "10K+", label: "Developers" },
                { value: "50+", label: "Courses" },
                { value: "100K", label: "XP Earned" },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right — form */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <div className="relative group/form">
              {/* Hover glow */}
              <div className="absolute -inset-[1px] rounded-3xl bg-gradient-to-b from-primary/25 via-border/30 to-border/10 opacity-60 group-hover/form:opacity-100 transition-opacity duration-500" />
              <div className="relative p-8 sm:p-10 rounded-3xl card-premium noise">
                {/* Top shimmer */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

                {/* Mode tabs */}
                <div className="flex gap-1 p-1 rounded-xl bg-secondary/30 border border-border/20 mb-8">
                  {(["login", "signup"] as const).map((m) => (
                    <button
                      key={m}
                      onClick={() => setMode(m)}
                      className={`relative flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                        mode === m ? "text-foreground" : "text-muted-foreground"
                      }`}
                    >
                      {mode === m && (
                        <motion.div
                          layoutId="auth-tab"
                          className="absolute inset-0 bg-card rounded-lg border border-border/50 shadow-sm"
                        />
                      )}
                      <span className="relative z-10">{m === "login" ? "Sign In" : "Sign Up"}</span>
                    </button>
                  ))}
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <AnimatePresence mode="wait">
                    {mode === "signup" && (
                      <motion.div
                        key="name"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-2"
                      >
                        <Label className="text-foreground text-sm font-medium">Display Name</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            placeholder="SolDev"
                            className="pl-10 bg-background/50 border-border/50 rounded-xl focus:border-primary/40"
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="space-y-2">
                    <Label className="text-foreground text-sm font-medium">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="dev@solana.com"
                        required
                        className="pl-10 bg-background/50 border-border/50 rounded-xl focus:border-primary/40"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-foreground text-sm font-medium">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        minLength={6}
                        className="pl-10 pr-10 bg-background/50 border-border/50 rounded-xl focus:border-primary/40"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-solana-gradient text-background hover:opacity-90 font-semibold h-12 rounded-xl gap-2 shadow-lg shadow-primary/20"
                  >
                    {submitting ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                        className="w-4 h-4 border-2 border-background/30 border-t-background rounded-full"
                      />
                    ) : (
                      <>
                        {mode === "login" ? "Sign In" : "Create Account"}
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </Button>
                </form>

                <div className="relative my-8">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-card px-4 text-muted-foreground">or continue with</span>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  {/* Google */}
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-12 rounded-xl gap-3 font-medium border-border/50 hover:border-primary/30 hover:bg-primary/5 transition-all"
                    onClick={async () => {
                      const { error } = await lovable.auth.signInWithOAuth("google", {
                        redirect_uri: window.location.origin,
                      });
                      if (error) {
                        toast({ title: "Error", description: error.message, variant: "destructive" });
                      }
                    }}
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                      />
                    </svg>
                    Continue with Google
                  </Button>

                  {/* GitHub */}
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-12 rounded-xl gap-3 font-medium border-border/50 hover:border-[#6e40c9]/40 hover:bg-[#6e40c9]/5 transition-all"
                    onClick={async () => {
                      const { error } = await supabase.auth.signInWithOAuth({
                        provider: "github",
                        options: { redirectTo: window.location.origin },
                      });
                      if (error) {
                        toast({ title: "Error", description: error.message, variant: "destructive" });
                      }
                    }}
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.868-.013-1.703-2.782.604-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0 1 12 6.836a9.59 9.59 0 0 1 2.504.337c1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                    </svg>
                    Continue with GitHub
                  </Button>

                  {/* Solana Wallet */}
                  <Button
                    type="button"
                    variant="outline"
                    disabled={walletStatus === 'connecting' || walletStatus === 'signing' || walletStatus === 'verifying'}
                    className="w-full h-12 rounded-xl gap-3 font-medium border-border/50 hover:border-solana-purple/40 hover:bg-solana-purple/5 transition-all"
                    onClick={() => loginWithWallet()}
                  >
                    {walletStatus === 'connecting' || walletStatus === 'signing' || walletStatus === 'verifying' ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                          className="w-4 h-4 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full"
                        />
                        {walletStatus === 'connecting' ? 'Connecting wallet...' : walletStatus === 'signing' ? 'Sign the message...' : 'Verifying...'}
                      </>
                    ) : (
                      <>
                        <Wallet className="w-5 h-5 text-solana-purple" />
                        Continue with Solana Wallet
                      </>
                    )}
                  </Button>
                </div>

                {mode === "login" && (
                  <p className="text-xs text-center mb-4 mt-6">
                    <button
                      type="button"
                      onClick={async () => {
                        if (!email.trim()) {
                          toast({
                            title: "Enter your email",
                            description: "Please enter your email address first.",
                            variant: "destructive",
                          });
                          return;
                        }
                        const { error } = await supabase.auth.resetPasswordForEmail(email, {
                          redirectTo: `${window.location.origin}/reset-password`,
                        });
                        if (error) {
                          toast({ title: "Error", description: error.message, variant: "destructive" });
                        } else {
                          toast({ title: "Check your email", description: "We sent you a password reset link." });
                        }
                      }}
                      className="text-primary hover:underline font-medium"
                    >
                      Forgot password?
                    </button>
                  </p>
                )}

                <p className="text-xs text-muted-foreground text-center mt-4">
                  {mode === "login" ? "Don't have an account? " : "Already have an account? "}
                  <button
                    onClick={() => setMode(mode === "login" ? "signup" : "login")}
                    className="text-primary hover:underline font-medium"
                  >
                    {mode === "login" ? "Sign up" : "Sign in"}
                  </button>
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Auth;
