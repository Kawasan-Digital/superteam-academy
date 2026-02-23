import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, BookOpen, TrendingUp, BarChart3, Settings2, Plus, Eye, Edit, Trash2, Search, Globe, Lock, RefreshCw, GraduationCap, Zap, Target, Calendar, Award, UserPlus, X, PieChart, Activity } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { SEO } from '@/components/SEO';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { CourseForm } from '@/components/admin/CourseForm';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart as RechartsPie, Pie, Cell, AreaChart, Area, Legend } from 'recharts';

const PremiumCard = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className="relative group/card">
    <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-b from-primary/20 via-border/30 to-border/10 opacity-0 group-hover/card:opacity-100 transition-opacity duration-500" />
    <div className={`relative rounded-2xl card-premium noise ${className}`}>
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
      {children}
    </div>
  </div>
);

// ─── Types ──────────────────────────────────────────────────────
interface DBCourse {
  id: string; slug: string; title: string; description: string; short_description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced'; duration: string; xp_reward: number;
  thumbnail: string; track: string; tags: string[]; enrolled_count: number;
  instructor_name: string; instructor_avatar: string; instructor_bio: string;
  published: boolean; created_at: string;
}

interface PlatformStats {
  totalUsers: number; totalCourses: number; publishedCourses: number;
  totalEnrollments: number; totalCompletions: number; totalXP: number;
  avgXP: number; newUsersWeek: number;
}

interface UserRow {
  display_name: string; username: string | null; xp: number; level: number;
  streak: number; joined_at: string; user_id: string;
  enrolled_courses: number; completed_lessons: number;
}

interface RecentEnrollment {
  user_name: string; course_title: string; enrolled_at: string;
}

const CHART_COLORS = [
  'hsl(var(--primary))', 'hsl(var(--accent))', 'hsl(var(--destructive))',
  'hsl(var(--muted-foreground))', 'hsl(var(--secondary-foreground))',
];

// ─── Admin Settings Panel ───────────────────────────────────────
function AdminSettingsPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [autoConfirm, setAutoConfirm] = useState(false);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [defaultXP, setDefaultXP] = useState('25');
  const [saving, setSaving] = useState(false);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success('Settings saved successfully');
      onClose();
    }, 600);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-background/60 backdrop-blur-sm z-50" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-card border-l border-border z-50 overflow-y-auto"
          >
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground">Platform Settings</h2>
                <Button variant="ghost" size="icon" onClick={onClose}><X className="w-4 h-4" /></Button>
              </div>

              <div className="space-y-5">
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-foreground">Course Defaults</h3>
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">Default XP per lesson</Label>
                    <Input value={defaultXP} onChange={e => setDefaultXP(e.target.value)} type="number" className="bg-background/50 border-border/50 rounded-xl" />
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/5 border border-border/20">
                    <div>
                      <p className="text-sm font-medium text-foreground">Auto-publish courses</p>
                      <p className="text-xs text-muted-foreground">New courses are published immediately</p>
                    </div>
                    <Switch checked={autoConfirm} onCheckedChange={setAutoConfirm} />
                  </div>
                </div>

                <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />

                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-foreground">Platform</h3>
                  <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/5 border border-border/20">
                    <div>
                      <p className="text-sm font-medium text-foreground">Maintenance Mode</p>
                      <p className="text-xs text-muted-foreground">Disable public access temporarily</p>
                    </div>
                    <Switch checked={maintenanceMode} onCheckedChange={setMaintenanceMode} />
                  </div>
                </div>

                <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />

                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-foreground">Database</h3>
                  <div className="p-4 rounded-xl bg-secondary/5 border border-border/20 space-y-2">
                    <p className="text-sm font-medium text-foreground">Quick Actions</p>
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" size="sm" className="text-xs rounded-lg" onClick={() => toast.info('Cache cleared')}>Clear Cache</Button>
                      <Button variant="outline" size="sm" className="text-xs rounded-lg" onClick={() => toast.info('Analytics recalculated')}>Recalculate Stats</Button>
                    </div>
                  </div>
                </div>
              </div>

              <Button onClick={handleSave} disabled={saving} className="w-full bg-solana-gradient text-background hover:opacity-90 rounded-xl h-11 font-semibold">
                {saving ? 'Saving...' : 'Save Settings'}
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── Overview Tab ───────────────────────────────────────────────
function OverviewTab() {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [topUsers, setTopUsers] = useState<UserRow[]>([]);
  const [recentEnrollments, setRecentEnrollments] = useState<RecentEnrollment[]>([]);
  const [courseBreakdown, setCourseBreakdown] = useState<{ title: string; enrolled_count: number; difficulty: string; track: string }[]>([]);
  const [enrollmentsByDate, setEnrollmentsByDate] = useState<{ date: string; count: number }[]>([]);
  const [xpDistribution, setXpDistribution] = useState<{ range: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [statsRes, usersRes, enrollRes, coursesRes, allEnrollRes, allProfilesRes] = await Promise.all([
        Promise.all([
          supabase.from('profiles').select('*', { count: 'exact', head: true }),
          supabase.from('courses').select('*', { count: 'exact', head: true }),
          supabase.from('courses').select('*', { count: 'exact', head: true }).eq('published', true),
          supabase.from('enrollments').select('*', { count: 'exact', head: true }),
          supabase.from('lesson_completions').select('*', { count: 'exact', head: true }),
          supabase.from('profiles').select('xp'),
        ]),
        supabase.from('profiles').select('display_name, username, xp, level, streak, joined_at, user_id').order('xp', { ascending: false }).limit(10),
        supabase.from('enrollments').select('enrolled_at, course_id, user_id').order('enrolled_at', { ascending: false }).limit(8),
        supabase.from('courses').select('title, enrolled_count, difficulty, track').order('enrolled_count', { ascending: false }).limit(8),
        supabase.from('enrollments').select('enrolled_at').order('enrolled_at', { ascending: false }).limit(500),
        supabase.from('profiles').select('xp, joined_at'),
      ]);

      // Stats
      const [profCount, courseCount, pubCount, enrollCount, compCount, xpData] = statsRes;
      const allXP = (xpData.data || []).map((p: any) => p.xp as number);
      const totalXP = allXP.reduce((a: number, b: number) => a + b, 0);

      // New users this week
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const newUsersWeek = (allProfilesRes.data || []).filter((p: any) => new Date(p.joined_at) >= weekAgo).length;

      setStats({
        totalUsers: profCount.count || 0,
        totalCourses: courseCount.count || 0,
        publishedCourses: pubCount.count || 0,
        totalEnrollments: enrollCount.count || 0,
        totalCompletions: compCount.count || 0,
        totalXP,
        avgXP: allXP.length ? Math.round(totalXP / allXP.length) : 0,
        newUsersWeek,
      });

      // Top users
      setTopUsers((usersRes.data || []) as UserRow[]);

      // Recent enrollments
      if (enrollRes.data && enrollRes.data.length > 0) {
        const userIds = [...new Set(enrollRes.data.map((e: any) => e.user_id))];
        const courseIds = [...new Set(enrollRes.data.map((e: any) => e.course_id))];
        const [usersLookup, coursesLookup] = await Promise.all([
          supabase.from('profiles').select('user_id, display_name').in('user_id', userIds),
          supabase.from('courses').select('id, title').in('id', courseIds),
        ]);
        const uMap = Object.fromEntries((usersLookup.data || []).map((u: any) => [u.user_id, u.display_name]));
        const cMap = Object.fromEntries((coursesLookup.data || []).map((c: any) => [c.id, c.title]));
        setRecentEnrollments(enrollRes.data.map((e: any) => ({
          user_name: uMap[e.user_id] || 'Unknown',
          course_title: cMap[e.course_id] || 'Unknown',
          enrolled_at: e.enrolled_at,
        })));
      }

      setCourseBreakdown((coursesRes.data || []) as any);

      // Enrollment trend (last 14 days)
      const dateMap: Record<string, number> = {};
      const today = new Date();
      for (let i = 13; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        dateMap[d.toISOString().split('T')[0]] = 0;
      }
      (allEnrollRes.data || []).forEach((e: any) => {
        const d = e.enrolled_at?.split('T')[0];
        if (d && dateMap[d] !== undefined) dateMap[d]++;
      });
      setEnrollmentsByDate(Object.entries(dateMap).map(([date, count]) => ({
        date: new Date(date).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
        count,
      })));

      // XP distribution
      const ranges = [
        { range: '0-50', min: 0, max: 50 },
        { range: '51-200', min: 51, max: 200 },
        { range: '201-500', min: 201, max: 500 },
        { range: '501-1000', min: 501, max: 1000 },
        { range: '1000+', min: 1001, max: Infinity },
      ];
      const xpDist = ranges.map(r => ({
        range: r.range,
        count: allXP.filter(x => x >= r.min && x <= r.max).length,
      }));
      setXpDistribution(xpDist);

      setLoading(false);
    }
    load();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const s = stats!;
  const statCards = [
    { label: 'Total Users', value: s.totalUsers.toLocaleString(), icon: Users, color: 'text-primary', sub: `+${s.newUsersWeek} this week`, trend: s.newUsersWeek > 0 },
    { label: 'Total Courses', value: s.totalCourses.toString(), icon: BookOpen, color: 'text-accent', sub: `${s.publishedCourses} published` },
    { label: 'Enrollments', value: s.totalEnrollments.toLocaleString(), icon: GraduationCap, color: 'text-solana-purple', sub: 'All time' },
    { label: 'Lessons Completed', value: s.totalCompletions.toLocaleString(), icon: Target, color: 'text-accent', sub: `${s.totalXP.toLocaleString()} XP total` },
  ];

  const maxEnrolled = Math.max(...courseBreakdown.map(c => c.enrolled_count), 1);

  // Difficulty breakdown for pie chart
  const difficultyData = ['beginner', 'intermediate', 'advanced'].map(d => ({
    name: d.charAt(0).toUpperCase() + d.slice(1),
    value: courseBreakdown.filter(c => c.difficulty === d).length || 0,
  })).filter(d => d.value > 0);
  if (difficultyData.length === 0) difficultyData.push({ name: 'No courses', value: 1 });

  // Track breakdown for pie chart
  const trackSet = new Set(courseBreakdown.map(c => c.track).filter(Boolean));
  const trackData = Array.from(trackSet).map(t => ({
    name: t,
    value: courseBreakdown.filter(c => c.track === t).length,
  }));

  return (
    <div className="space-y-8">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <PremiumCard className="p-5">
              <div className="flex items-center justify-between mb-3">
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
                {'trend' in stat && stat.trend && <Badge variant="secondary" className="text-[10px] text-accent">↑</Badge>}
              </div>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
              <p className="text-[10px] text-muted-foreground/60 mt-0.5">{stat.sub}</p>
            </PremiumCard>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Enrollment Trend */}
        <PremiumCard className="p-6">
          <div className="flex items-center gap-2 mb-1">
            <Activity className="w-4 h-4 text-primary" />
            <h3 className="font-semibold text-foreground">Enrollment Trend</h3>
          </div>
          <p className="text-xs text-muted-foreground mb-4">Last 14 days</p>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={enrollmentsByDate} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="enrollGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.2)" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} allowDecimals={false} width={30} />
                <RechartsTooltip
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px', fontSize: 12, padding: '8px 12px' }}
                  labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 600, marginBottom: 4 }}
                />
                <Area type="monotone" dataKey="count" stroke="hsl(var(--primary))" fill="url(#enrollGrad)" strokeWidth={2} name="Enrollments" dot={{ r: 3, fill: 'hsl(var(--primary))' }} activeDot={{ r: 5, stroke: 'hsl(var(--primary))', strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </PremiumCard>

        {/* XP Distribution */}
        <PremiumCard className="p-6">
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 className="w-4 h-4 text-accent" />
            <h3 className="font-semibold text-foreground">XP Distribution</h3>
          </div>
          <p className="text-xs text-muted-foreground mb-4">User XP ranges</p>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={xpDistribution} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.2)" vertical={false} />
                <XAxis dataKey="range" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} allowDecimals={false} width={30} />
                <RechartsTooltip
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px', fontSize: 12, padding: '8px 12px' }}
                  cursor={{ fill: 'hsl(var(--muted) / 0.2)' }}
                />
                <Bar dataKey="count" fill="hsl(var(--accent))" radius={[6, 6, 0, 0]} name="Users" maxBarSize={48} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </PremiumCard>

        {/* Difficulty Breakdown */}
        <PremiumCard className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <PieChart className="w-4 h-4 text-primary" />
            <h3 className="font-semibold text-foreground text-sm">By Difficulty</h3>
          </div>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPie>
                <Pie data={difficultyData} cx="50%" cy="45%" innerRadius={40} outerRadius={70} paddingAngle={3} dataKey="value" strokeWidth={0}>
                  {difficultyData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                </Pie>
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, paddingTop: 12 }} formatter={(value: string) => <span style={{ color: 'hsl(var(--muted-foreground))' }}>{value}</span>} />
                <RechartsTooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px', fontSize: 12, padding: '8px 12px' }} />
              </RechartsPie>
            </ResponsiveContainer>
          </div>
        </PremiumCard>

        {/* Course Popularity */}
        <PremiumCard className="p-6">
          <h3 className="font-semibold text-foreground mb-1">Course Popularity</h3>
          <p className="text-xs text-muted-foreground mb-4">By enrollment count</p>
          {courseBreakdown.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">No courses yet</p>
          ) : (
            <div className="space-y-4">
              {courseBreakdown.map((c, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm text-foreground truncate max-w-[55%] font-medium">{c.title}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-[10px] capitalize">{c.difficulty}</Badge>
                      <span className="text-xs font-semibold text-accent tabular-nums">{c.enrolled_count}</span>
                    </div>
                  </div>
                  <div className="h-1.5 bg-secondary/20 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.max((c.enrolled_count / maxEnrolled) * 100, 2)}%` }}
                      transition={{ delay: i * 0.1, duration: 0.6 }}
                      className="h-full bg-gradient-to-r from-primary/60 to-primary rounded-full"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </PremiumCard>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Enrollments */}
        <PremiumCard className="p-6">
          <div className="flex items-center gap-2 mb-1">
            <UserPlus className="w-4 h-4 text-primary" />
            <h3 className="font-semibold text-foreground">Recent Enrollments</h3>
          </div>
          <p className="text-xs text-muted-foreground mb-4">Latest course signups</p>
          {recentEnrollments.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">No enrollments yet</p>
          ) : (
            <div className="space-y-3">
              {recentEnrollments.map((e, i) => (
                <div key={i} className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 rounded-full bg-secondary/50 flex items-center justify-center text-xs font-bold text-foreground shrink-0">
                    {e.user_name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="font-medium text-foreground">{e.user_name}</span>
                    <span className="text-muted-foreground"> → </span>
                    <span className="font-medium text-primary">{e.course_title}</span>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(e.enrolled_at).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </PremiumCard>

        {/* Top Learners */}
        <PremiumCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-foreground">Top Learners</h3>
              <p className="text-xs text-muted-foreground">Ranked by XP</p>
            </div>
            <Award className="w-5 h-5 text-accent" />
          </div>
          {topUsers.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">No users yet</p>
          ) : (
            <div className="space-y-2">
              {topUsers.slice(0, 5).map((u, i) => (
                <div key={u.user_id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/10 transition-colors">
                  <span className={`text-sm font-bold w-5 text-center ${i < 3 ? 'text-accent' : 'text-muted-foreground'}`}>
                    {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
                  </span>
                  <div className="w-7 h-7 rounded-full bg-secondary/50 flex items-center justify-center text-xs font-bold text-foreground">
                    {u.display_name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{u.display_name}</p>
                    <p className="text-[10px] text-muted-foreground">Lv. {u.level} • 🔥 {u.streak}</p>
                  </div>
                  <span className="text-sm font-semibold text-accent">{u.xp.toLocaleString()} XP</span>
                </div>
              ))}
            </div>
          )}
        </PremiumCard>
      </div>

      {/* Platform Health */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Avg XP per User', value: s.avgXP.toLocaleString(), icon: Zap },
          { label: 'Published Rate', value: s.totalCourses ? `${Math.round((s.publishedCourses / s.totalCourses) * 100)}%` : '0%', icon: Globe },
          { label: 'Completion Ratio', value: s.totalEnrollments ? `${Math.round((s.totalCompletions / Math.max(s.totalEnrollments, 1)) * 100)}%` : '0%', icon: TrendingUp },
          { label: 'Total XP Distributed', value: s.totalXP.toLocaleString(), icon: BarChart3 },
        ].map((item, i) => (
          <motion.div key={item.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.05 }}>
            <PremiumCard className="p-4">
              <item.icon className="w-4 h-4 text-muted-foreground mb-2" />
              <p className="text-lg font-bold text-foreground">{item.value}</p>
              <p className="text-[11px] text-muted-foreground">{item.label}</p>
            </PremiumCard>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ─── Courses Tab ────────────────────────────────────────────────
function CoursesTab() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState<any | null>(null);
  const [courses, setCourses] = useState<DBCourse[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(false);

  const fetchCourses = useCallback(async () => {
    setLoadingCourses(true);
    const { data, error } = await supabase.from('courses').select('*').order('created_at', { ascending: false });
    if (error) toast.error('Failed to fetch courses');
    else setCourses((data as DBCourse[]) || []);
    setLoadingCourses(false);
  }, []);

  useEffect(() => { fetchCourses(); }, [fetchCourses]);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this course and all its modules/lessons?')) return;
    const { error } = await supabase.from('courses').delete().eq('id', id);
    if (error) toast.error(error.message);
    else { toast.success('Course deleted'); fetchCourses(); }
  };

  const handleTogglePublish = async (course: DBCourse) => {
    const { error } = await supabase.from('courses').update({ published: !course.published }).eq('id', course.id);
    if (error) toast.error(error.message);
    else { toast.success(course.published ? 'Course unpublished' : 'Course published!'); fetchCourses(); }
  };

  const handleEdit = async (course: DBCourse) => {
    const { data: mods } = await supabase
      .from('course_modules')
      .select('*, lessons(*, lesson_test_cases(*))')
      .eq('course_id', course.id)
      .order('sort_order');

    const modules = (mods || []).map((m: any) => ({
      id: m.id, title: m.title, expanded: true,
      lessons: (m.lessons || []).sort((a: any, b: any) => a.sort_order - b.sort_order).map((l: any) => ({
        id: l.id, title: l.title, type: l.type, content: l.content, xp_reward: l.xp_reward,
        video_url: l.video_url || '',
        challenge_instructions: l.challenge_instructions || '', challenge_starter_code: l.challenge_starter_code || '',
        challenge_expected_output: l.challenge_expected_output || '', challenge_language: l.challenge_language || 'typescript',
        test_cases: (l.lesson_test_cases || []).sort((a: any, b: any) => a.sort_order - b.sort_order).map((tc: any) => ({
          name: tc.name, input: tc.input, expected: tc.expected,
        })),
      })),
    }));

    setEditingCourse({
      id: course.id, slug: course.slug, title: course.title, description: course.description,
      short_description: course.short_description, difficulty: course.difficulty, duration: course.duration,
      xp_reward: course.xp_reward, thumbnail: course.thumbnail, track: course.track,
      tags: course.tags.join(', '), instructor_name: course.instructor_name, instructor_bio: course.instructor_bio,
      published: course.published,
      modules: modules.length > 0 ? modules : [{ title: '', lessons: [], expanded: true }],
    });
    setShowForm(true);
  };

  const filteredCourses = courses.filter(c =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.track.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      {showForm && (
        <CourseForm
          initial={editingCourse}
          onClose={() => { setShowForm(false); setEditingCourse(null); }}
          onSaved={() => { setShowForm(false); setEditingCourse(null); fetchCourses(); }}
        />
      )}
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search courses..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10 bg-background/50 border-border/50 rounded-xl" />
          </div>
          <button onClick={fetchCourses} className="text-muted-foreground hover:text-foreground transition-colors" title="Refresh">
            <RefreshCw className={`w-4 h-4 ${loadingCourses ? 'animate-spin' : ''}`} />
          </button>
          <Button onClick={() => { setEditingCourse(null); setShowForm(true); }} className="bg-solana-gradient text-background hover:opacity-90 rounded-xl gap-2">
            <Plus className="w-4 h-4" /> New Course
          </Button>
        </div>

        <PremiumCard className="overflow-hidden">
          {loadingCourses ? (
            <div className="flex items-center justify-center py-16"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
          ) : filteredCourses.length === 0 ? (
            <div className="text-center py-16">
              <BookOpen className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">No courses yet.</p>
              <button onClick={() => setShowForm(true)} className="text-primary text-sm hover:underline mt-2">Create your first course →</button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/30">
                    <th className="text-left text-xs font-medium text-muted-foreground p-4">Course</th>
                    <th className="text-left text-xs font-medium text-muted-foreground p-4">Difficulty</th>
                    <th className="text-left text-xs font-medium text-muted-foreground p-4">XP</th>
                    <th className="text-left text-xs font-medium text-muted-foreground p-4">Enrolled</th>
                    <th className="text-left text-xs font-medium text-muted-foreground p-4">Status</th>
                    <th className="text-right text-xs font-medium text-muted-foreground p-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCourses.map(course => (
                    <tr key={course.id} className="border-b border-border/10 hover:bg-secondary/5 transition-colors">
                      <td className="p-4">
                        <p className="text-sm font-medium text-foreground">{course.title}</p>
                        <p className="text-xs text-muted-foreground">{course.track || '—'}</p>
                      </td>
                      <td className="p-4"><Badge variant="secondary" className="text-xs capitalize">{course.difficulty}</Badge></td>
                      <td className="p-4 text-sm text-accent font-medium">+{course.xp_reward}</td>
                      <td className="p-4 text-sm text-foreground">{course.enrolled_count}</td>
                      <td className="p-4">
                        <button onClick={() => handleTogglePublish(course)} className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full transition-colors ${course.published ? 'bg-accent/10 text-accent hover:bg-accent/20' : 'bg-secondary text-muted-foreground hover:bg-secondary/80'}`}>
                          {course.published ? <><Globe className="w-3 h-3" /> Published</> : <><Lock className="w-3 h-3" /> Draft</>}
                        </button>
                      </td>
                      <td className="p-4">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => window.open(`/courses/${course.slug}`, '_blank')} title="Preview"><Eye className="w-4 h-4" /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(course)} title="Edit"><Edit className="w-4 h-4" /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDelete(course.id)} title="Delete"><Trash2 className="w-4 h-4" /></Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </PremiumCard>
      </div>
    </>
  );
}

// ─── Users Tab ──────────────────────────────────────────────────
function UsersTab() {
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const { data } = await supabase
        .from('profiles')
        .select('display_name, username, xp, level, streak, joined_at, user_id')
        .order('xp', { ascending: false });
      setUsers((data || []) as UserRow[]);
      setLoading(false);
    }
    load();
  }, []);

  const filtered = users.filter(u =>
    u.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.username || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search users..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10 bg-background/50 border-border/50 rounded-xl" />
        </div>
        <Badge variant="secondary" className="text-xs">{users.length} users</Badge>
      </div>

      <PremiumCard className="overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/30">
                  <th className="text-left text-xs font-medium text-muted-foreground p-4">User</th>
                  <th className="text-left text-xs font-medium text-muted-foreground p-4">Level</th>
                  <th className="text-left text-xs font-medium text-muted-foreground p-4">XP</th>
                  <th className="text-left text-xs font-medium text-muted-foreground p-4">Streak</th>
                  <th className="text-left text-xs font-medium text-muted-foreground p-4">Joined</th>
                  <th className="text-right text-xs font-medium text-muted-foreground p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(u => (
                  <tr key={u.user_id} className="border-b border-border/10 hover:bg-secondary/5 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-secondary/50 flex items-center justify-center text-xs font-bold text-foreground">
                          {u.display_name[0]}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{u.display_name}</p>
                          {u.username && <p className="text-xs text-muted-foreground">@{u.username}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-foreground">{u.level}</td>
                    <td className="p-4 text-sm text-accent font-medium">{u.xp.toLocaleString()}</td>
                    <td className="p-4 text-sm text-foreground">🔥 {u.streak}</td>
                    <td className="p-4 text-xs text-muted-foreground">{new Date(u.joined_at).toLocaleDateString()}</td>
                    <td className="p-4">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => window.open(`/profile/${u.username}`, '_blank')} title="View Profile"><Eye className="w-4 h-4" /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </PremiumCard>
    </div>
  );
}

// ─── Main Admin Dashboard ───────────────────────────────────────
const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'courses' | 'users'>('overview');
  const [settingsOpen, setSettingsOpen] = useState(false);

  const tabs = [
    { id: 'overview' as const, label: 'Overview', icon: BarChart3 },
    { id: 'courses' as const, label: 'Courses', icon: BookOpen },
    { id: 'users' as const, label: 'Users', icon: Users },
  ];

  return (
    <MainLayout>
      <SEO title="Admin Dashboard" description="Manage courses, users, and analytics for SolDev Labs." path="/admin" />
      <AdminSettingsPanel open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent/5 rounded-full blur-[100px] pointer-events-none" />

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="h-px w-8 bg-gradient-to-r from-primary to-transparent" />
                <span className="text-xs font-semibold uppercase tracking-wider text-primary">Admin</span>
              </div>
              <h1 className="font-display text-3xl font-bold text-foreground">Dashboard</h1>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="rounded-xl border-border/50 gap-2" onClick={() => setSettingsOpen(true)}>
                <Settings2 className="w-4 h-4" /> Settings
              </Button>
              <Button
                onClick={() => setActiveTab('courses')}
                className="bg-solana-gradient text-background hover:opacity-90 rounded-xl gap-2"
              >
                <Plus className="w-4 h-4" /> New Course
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 p-1 rounded-xl bg-secondary/30 border border-border/20 mb-8 w-fit">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id ? 'text-foreground' : 'text-muted-foreground'}`}
              >
                {activeTab === tab.id && (
                  <motion.div layoutId="admin-tab" className="absolute inset-0 bg-card rounded-lg border border-border/50 shadow-sm" />
                )}
                <tab.icon className="w-4 h-4 relative z-10" />
                <span className="relative z-10">{tab.label}</span>
              </button>
            ))}
          </div>

          {activeTab === 'overview' && <OverviewTab />}
          {activeTab === 'courses' && <CoursesTab />}
          {activeTab === 'users' && <UsersTab />}
        </motion.div>
      </div>
    </MainLayout>
  );
};

export default AdminDashboard;
