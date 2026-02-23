import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ExternalLink, Download, Share2, CheckCircle2, Shield, Sparkles, Copy } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { SEO } from '@/components/SEO';
import { useTranslation } from '@/i18n/LanguageContext';
import { MOCK_CREDENTIALS } from '@/services/mock-data';
import { Button } from '@/components/ui/button';
import { useState, useRef, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';

const Certificate = () => {
  const { id } = useParams();
  const { t } = useTranslation();
  const credential = MOCK_CREDENTIALS.find(c => c.id === id) || MOCK_CREDENTIALS[0];
  const [copied, setCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const certRef = useRef<HTMLDivElement>(null);

  const handleCopy = () => {
    navigator.clipboard.writeText(credential.mintAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const solanaExplorerUrl = `https://explorer.solana.com/address/${credential.mintAddress}?cluster=devnet`;

  const handleVerify = () => {
    window.open(solanaExplorerUrl, '_blank', 'noopener,noreferrer');
  };

  const handleShareTwitter = () => {
    const text = `🎓 I just earned my "${credential.courseName}" certificate on SolDev Labs! Verified on-chain as a compressed NFT.\n\n🔗 Verify: ${solanaExplorerUrl}\n\n#SolDevLabs #Web3 #Solana`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleCopyLink = () => {
    const link = `${window.location.origin}/certificates/${credential.id}`;
    navigator.clipboard.writeText(link);
    setLinkCopied(true);
    toast({ title: 'Link copied!', description: 'Certificate link copied to clipboard.' });
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const handleDownload = useCallback(async () => {
    if (!certRef.current) return;
    try {
      const { default: html2canvas } = await import('html2canvas');
      const canvas = await html2canvas(certRef.current, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
      });
      const link = document.createElement('a');
      link.download = `${credential.courseName.replace(/\s+/g, '-')}-certificate.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch {
      toast({ title: 'Download failed', description: 'Could not generate certificate image.', variant: 'destructive' });
    }
  }, [credential.courseName]);

  return (
    <MainLayout>
      <SEO title={`Certificate: ${credential.courseName}`} description={`On-chain verified certificate for completing ${credential.courseName} on SolDev Labs.`} path={`/certificates/${id}`} />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link to="/profile" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> {t('common.back')}
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Certificate Visual */}
          <div ref={certRef} className="relative rounded-2xl overflow-hidden border border-border">
            {/* Animated gradient background */}
            <div className="absolute inset-0 bg-solana-gradient opacity-[0.04]" />
            <div className="absolute inset-0 bg-card/95" />
            
            {/* Subtle grid pattern */}
            <div className="absolute inset-0 opacity-[0.03]" style={{
              backgroundImage: 'radial-gradient(circle, hsl(var(--primary)) 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }} />

            <div className="relative p-8 sm:p-12 text-center">
              {/* Top badge */}
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.2 }}
                className="mb-6"
              >
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-accent mx-auto flex items-center justify-center relative">
                  <Sparkles className="w-9 h-9 text-background" />
                  <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-accent flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-accent-foreground" />
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 mb-4">
                  <Shield className="w-3.5 h-3.5 text-accent" />
                  <span className="text-xs text-accent font-semibold">Verified On-Chain</span>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <p className="text-sm text-muted-foreground mb-2 font-medium uppercase tracking-wider">Certificate of Completion</p>
                <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-3">{credential.courseName}</h1>
                <div className="flex items-center justify-center gap-3 text-sm text-muted-foreground mb-8">
                  <span className="px-2 py-0.5 rounded bg-primary/10 text-primary text-xs font-medium">{credential.track}</span>
                  <span>Level {credential.level}</span>
                  <span>{t('certificate.issued')}: {new Date(credential.issuedAt).toLocaleDateString('en', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-secondary/30"
              >
                <div className="text-left">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">Mint Address</p>
                  <p className="text-sm font-mono text-foreground">{credential.mintAddress}</p>
                </div>
                <button 
                  onClick={handleCopy}
                  className="p-1.5 rounded-lg hover:bg-secondary transition-colors"
                >
                  {copied ? (
                    <CheckCircle2 className="w-4 h-4 text-accent" />
                  ) : (
                    <Copy className="w-4 h-4 text-muted-foreground" />
                  )}
                </button>
              </motion.div>

              {/* Decorative corners */}
              <div className="absolute top-4 left-4 w-16 h-16 border-t-2 border-l-2 border-primary/20 rounded-tl-xl" />
              <div className="absolute top-4 right-4 w-16 h-16 border-t-2 border-r-2 border-accent/20 rounded-tr-xl" />
              <div className="absolute bottom-4 left-4 w-16 h-16 border-b-2 border-l-2 border-accent/20 rounded-bl-xl" />
              <div className="absolute bottom-4 right-4 w-16 h-16 border-b-2 border-r-2 border-primary/20 rounded-br-xl" />
            </div>
          </div>

          {/* Actions */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-wrap gap-3 mt-6 justify-center"
          >
            <Button onClick={handleVerify} className="gap-2 bg-solana-gradient text-background hover:opacity-90 font-semibold">
              <ExternalLink className="w-4 h-4" /> {t('certificate.verify')}
            </Button>
            <Button variant="outline" className="gap-2 border-border text-foreground" onClick={handleShareTwitter}>
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              Twitter
            </Button>
            <Button variant="outline" className="gap-2 border-border text-foreground" onClick={handleCopyLink}>
              {linkCopied ? <CheckCircle2 className="w-4 h-4 text-accent" /> : <Share2 className="w-4 h-4" />} {linkCopied ? 'Copied!' : t('certificate.share')}
            </Button>
            <Button variant="outline" className="gap-2 border-border text-foreground" onClick={handleDownload}>
              <Download className="w-4 h-4" /> {t('certificate.download')}
            </Button>
          </motion.div>

          {/* NFT Details */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="mt-8 p-6 rounded-xl border border-border bg-card"
          >
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" /> NFT Details
            </h3>
            <div className="space-y-3 text-sm">
              {[
                { label: 'Type', value: 'Compressed NFT (Bubblegum)' },
                { label: 'Network', value: 'Solana Devnet' },
                { label: 'Standard', value: 'Metaplex Bubblegum v0.7' },
                { label: 'Transferable', value: 'No (Soulbound)', highlight: true },
                { label: 'Mint Address', value: credential.mintAddress, mono: true },
              ].map(item => (
                <div key={item.label} className="flex justify-between items-center py-1">
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className={`text-foreground ${item.mono ? 'font-mono text-xs' : ''} ${item.highlight ? 'text-accent font-medium' : ''}`}>
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </MainLayout>
  );
};

export default Certificate;
