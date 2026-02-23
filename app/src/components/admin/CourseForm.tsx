import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Plus, Trash2, ChevronDown, ChevronUp, BookOpen, FileCode, GripVertical, Loader2, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface TestCaseForm {
  name: string;
  input: string;
  expected: string;
}

interface LessonForm {
  id?: string;
  title: string;
  type: 'content' | 'challenge' | 'video';
  content: string;
  xp_reward: number;
  video_url: string;
  challenge_instructions: string;
  challenge_starter_code: string;
  challenge_expected_output: string;
  challenge_language: 'rust' | 'typescript' | 'json';
  test_cases: TestCaseForm[];
}

interface ModuleForm {
  id?: string;
  title: string;
  lessons: LessonForm[];
  expanded: boolean;
}

interface CourseFormData {
  id?: string;
  slug: string;
  title: string;
  description: string;
  short_description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: string;
  xp_reward: number;
  thumbnail: string;
  track: string;
  tags: string;
  instructor_name: string;
  instructor_bio: string;
  published: boolean;
  modules: ModuleForm[];
}

interface CourseFormProps {
  initial?: CourseFormData;
  onClose: () => void;
  onSaved: () => void;
}

const defaultLesson = (): LessonForm => ({
  title: '',
  type: 'content',
  content: '',
  xp_reward: 20,
  video_url: '',
  challenge_instructions: '',
  challenge_starter_code: '',
  challenge_expected_output: '',
  challenge_language: 'typescript',
  test_cases: [],
});

const defaultModule = (): ModuleForm => ({
  title: '',
  lessons: [defaultLesson()],
  expanded: true,
});

const defaultForm = (): CourseFormData => ({
  slug: '',
  title: '',
  description: '',
  short_description: '',
  difficulty: 'beginner',
  duration: '',
  xp_reward: 100,
  thumbnail: '',
  track: '',
  tags: '',
  instructor_name: '',
  instructor_bio: '',
  published: false,
  modules: [defaultModule()],
});

export function CourseForm({ initial, onClose, onSaved }: CourseFormProps) {
  const [form, setForm] = useState<CourseFormData>(initial || defaultForm());
  const [saving, setSaving] = useState(false);
  const [activeLesson, setActiveLesson] = useState<{ modIdx: number; lesIdx: number } | null>(null);

  const updateField = (key: keyof CourseFormData, value: any) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const autoSlug = (title: string) => {
    return title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  };

  // Module actions
  const addModule = () => setForm(p => ({ ...p, modules: [...p.modules, defaultModule()] }));
  const removeModule = (i: number) => setForm(p => ({ ...p, modules: p.modules.filter((_, idx) => idx !== i) }));
  const updateModule = (i: number, key: keyof ModuleForm, value: any) => {
    setForm(p => {
      const mods = [...p.modules];
      mods[i] = { ...mods[i], [key]: value };
      return { ...p, modules: mods };
    });
  };

  // Lesson actions
  const addLesson = (modIdx: number) => {
    setForm(p => {
      const mods = [...p.modules];
      mods[modIdx] = { ...mods[modIdx], lessons: [...mods[modIdx].lessons, defaultLesson()] };
      return { ...p, modules: mods };
    });
  };
  const removeLesson = (modIdx: number, lesIdx: number) => {
    setForm(p => {
      const mods = [...p.modules];
      mods[modIdx] = { ...mods[modIdx], lessons: mods[modIdx].lessons.filter((_, i) => i !== lesIdx) };
      return { ...p, modules: mods };
    });
    if (activeLesson?.modIdx === modIdx && activeLesson?.lesIdx === lesIdx) setActiveLesson(null);
  };
  const updateLesson = (modIdx: number, lesIdx: number, key: keyof LessonForm, value: any) => {
    setForm(p => {
      const mods = [...p.modules];
      const lessons = [...mods[modIdx].lessons];
      lessons[lesIdx] = { ...lessons[lesIdx], [key]: value };
      mods[modIdx] = { ...mods[modIdx], lessons };
      return { ...p, modules: mods };
    });
  };

  // Test case actions
  const addTestCase = (modIdx: number, lesIdx: number) => {
    updateLesson(modIdx, lesIdx, 'test_cases', [
      ...form.modules[modIdx].lessons[lesIdx].test_cases,
      { name: '', input: '', expected: '' },
    ]);
  };
  const updateTestCase = (modIdx: number, lesIdx: number, tcIdx: number, key: keyof TestCaseForm, value: string) => {
    const tcs = [...form.modules[modIdx].lessons[lesIdx].test_cases];
    tcs[tcIdx] = { ...tcs[tcIdx], [key]: value };
    updateLesson(modIdx, lesIdx, 'test_cases', tcs);
  };
  const removeTestCase = (modIdx: number, lesIdx: number, tcIdx: number) => {
    const tcs = form.modules[modIdx].lessons[lesIdx].test_cases.filter((_, i) => i !== tcIdx);
    updateLesson(modIdx, lesIdx, 'test_cases', tcs);
  };

  const handleSave = async () => {
    if (!form.title || !form.slug) {
      toast.error('Title and slug are required');
      return;
    }
    setSaving(true);
    try {
      // Upsert course
      const coursePayload = {
        slug: form.slug,
        title: form.title,
        description: form.description,
        short_description: form.short_description,
        difficulty: form.difficulty,
        duration: form.duration,
        xp_reward: Number(form.xp_reward),
        thumbnail: form.thumbnail,
        track: form.track,
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
        instructor_name: form.instructor_name,
        instructor_bio: form.instructor_bio,
        published: form.published,
      };

      let courseId = form.id;
      if (courseId) {
        const { error } = await supabase.from('courses').update(coursePayload).eq('id', courseId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from('courses').insert(coursePayload).select('id').single();
        if (error) throw error;
        courseId = data.id;
      }

      // Delete existing modules/lessons if editing (cascade handles lessons)
      if (form.id) {
        await supabase.from('course_modules').delete().eq('course_id', courseId);
      }

      // Insert modules and lessons
      for (let modIdx = 0; modIdx < form.modules.length; modIdx++) {
        const mod = form.modules[modIdx];
        const { data: modData, error: modErr } = await supabase
          .from('course_modules')
          .insert({ course_id: courseId, title: mod.title, sort_order: modIdx })
          .select('id')
          .single();
        if (modErr) throw modErr;

        for (let lesIdx = 0; lesIdx < mod.lessons.length; lesIdx++) {
          const les = mod.lessons[lesIdx];
          const { data: lesData, error: lesErr } = await supabase
            .from('lessons')
            .insert({
              module_id: modData.id,
              title: les.title,
              type: les.type,
              content: les.content,
              xp_reward: Number(les.xp_reward),
              sort_order: lesIdx,
              video_url: les.type === 'video' ? les.video_url : null,
              challenge_instructions: les.type === 'challenge' ? les.challenge_instructions : null,
              challenge_starter_code: les.type === 'challenge' ? les.challenge_starter_code : null,
              challenge_expected_output: les.type === 'challenge' ? les.challenge_expected_output : null,
              challenge_language: les.type === 'challenge' ? les.challenge_language : null,
            })
            .select('id')
            .single();
          if (lesErr) throw lesErr;

          // Insert test cases
          if (les.type === 'challenge' && les.test_cases.length > 0) {
            const { error: tcErr } = await supabase.from('lesson_test_cases').insert(
              les.test_cases.map((tc, tcIdx) => ({
                lesson_id: lesData.id,
                name: tc.name,
                input: tc.input,
                expected: tc.expected,
                sort_order: tcIdx,
              }))
            );
            if (tcErr) throw tcErr;
          }
        }
      }

      toast.success(form.id ? 'Course updated!' : 'Course created!');
      onSaved();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to save course');
    } finally {
      setSaving(false);
    }
  };

  const currentLesson =
    activeLesson !== null
      ? form.modules[activeLesson.modIdx]?.lessons[activeLesson.lesIdx]
      : null;

  return (
    <div className="fixed inset-0 z-50 flex bg-black/60 backdrop-blur-sm">
      {/* Left: Course + Modules Structure */}
      <motion.div
        initial={{ x: -40, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="w-[380px] bg-card border-r border-border flex flex-col h-full overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="font-display text-lg font-bold text-foreground">
            {form.id ? 'Edit Course' : 'New Course'}
          </h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable form */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Basic info */}
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Title *</label>
              <Input
                placeholder="Course title"
                value={form.title}
                onChange={e => {
                  updateField('title', e.target.value);
                  if (!form.id) updateField('slug', autoSlug(e.target.value));
                }}
                className="bg-background/50 border-border/50"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Slug *</label>
              <Input
                placeholder="course-slug"
                value={form.slug}
                onChange={e => updateField('slug', e.target.value)}
                className="bg-background/50 border-border/50 font-mono text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Short Description</label>
              <Input
                placeholder="One-liner (max 120 chars)"
                value={form.short_description}
                onChange={e => updateField('short_description', e.target.value)}
                maxLength={120}
                className="bg-background/50 border-border/50"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Description</label>
              <Textarea
                placeholder="Full course description..."
                value={form.description}
                onChange={e => updateField('description', e.target.value)}
                rows={3}
                className="bg-background/50 border-border/50 resize-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Difficulty</label>
                <select
                  value={form.difficulty}
                  onChange={e => updateField('difficulty', e.target.value)}
                  className="w-full h-10 px-3 rounded-md border border-border/50 bg-background/50 text-sm text-foreground"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Duration</label>
                <Input
                  placeholder="e.g. 4 hours"
                  value={form.duration}
                  onChange={e => updateField('duration', e.target.value)}
                  className="bg-background/50 border-border/50"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">XP Reward</label>
                <Input
                  type="number"
                  value={form.xp_reward}
                  onChange={e => updateField('xp_reward', e.target.value)}
                  className="bg-background/50 border-border/50"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Track</label>
                <select
                  value={form.track}
                  onChange={e => updateField('track', e.target.value)}
                  className="w-full h-10 px-3 rounded-md border border-border/50 bg-background/50 text-sm text-foreground"
                >
                  <option value="">Select track</option>
                  <option value="Solana Core">Solana Core</option>
                  <option value="Program Development">Program Development</option>
                  <option value="DeFi Engineering">DeFi Engineering</option>
                  <option value="Digital Assets">Digital Assets</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Tags (comma-separated)</label>
              <Input
                placeholder="rust, solana, anchor"
                value={form.tags}
                onChange={e => updateField('tags', e.target.value)}
                className="bg-background/50 border-border/50"
              />
            </div>
          </div>

          {/* Instructor */}
          <div className="pt-2 border-t border-border">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Instructor</p>
            <div className="space-y-3">
              <Input
                placeholder="Instructor name"
                value={form.instructor_name}
                onChange={e => updateField('instructor_name', e.target.value)}
                className="bg-background/50 border-border/50"
              />
              <Input
                placeholder="Short bio"
                value={form.instructor_bio}
                onChange={e => updateField('instructor_bio', e.target.value)}
                className="bg-background/50 border-border/50"
              />
            </div>
          </div>

          {/* Publish toggle */}
          <div className="flex items-center justify-between py-2 px-3 rounded-lg border border-border bg-secondary/20">
            <span className="text-sm font-medium text-foreground">Published</span>
            <button
              onClick={() => updateField('published', !form.published)}
              className={`relative w-10 h-5 rounded-full transition-colors ${form.published ? 'bg-primary' : 'bg-secondary'}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${form.published ? 'translate-x-5' : ''}`} />
            </button>
          </div>

          {/* Modules */}
          <div className="pt-2 border-t border-border">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Modules</p>
              <button onClick={addModule} className="text-xs text-primary hover:underline flex items-center gap-1">
                <Plus className="w-3 h-3" /> Add Module
              </button>
            </div>

            <div className="space-y-2">
              {form.modules.map((mod, modIdx) => (
                <div key={modIdx} className="border border-border rounded-xl overflow-hidden">
                  {/* Module header */}
                  <div className="flex items-center gap-2 px-3 py-2.5 bg-secondary/20">
                    <GripVertical className="w-3.5 h-3.5 text-muted-foreground/40" />
                    <Input
                      placeholder={`Module ${modIdx + 1} title`}
                      value={mod.title}
                      onChange={e => updateModule(modIdx, 'title', e.target.value)}
                      className="flex-1 h-7 text-sm border-0 bg-transparent p-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                    <button onClick={() => updateModule(modIdx, 'expanded', !mod.expanded)}>
                      {mod.expanded ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />}
                    </button>
                    <button onClick={() => removeModule(modIdx)} className="text-destructive/60 hover:text-destructive">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Lessons list */}
                  {mod.expanded && (
                    <div className="divide-y divide-border/50">
                      {mod.lessons.map((les, lesIdx) => (
                        <button
                          key={lesIdx}
                          onClick={() => setActiveLesson({ modIdx, lesIdx })}
                          className={`w-full flex items-center gap-2 px-4 py-2.5 text-left text-sm transition-colors hover:bg-secondary/30 ${
                            activeLesson?.modIdx === modIdx && activeLesson?.lesIdx === lesIdx
                              ? 'bg-primary/10 text-primary'
                              : 'text-foreground'
                          }`}
                        >
                          {les.type === 'challenge' ? (
                            <FileCode className="w-3.5 h-3.5 flex-shrink-0" />
                          ) : les.type === 'video' ? (
                            <Video className="w-3.5 h-3.5 text-solana-purple flex-shrink-0" />
                          ) : (
                            <BookOpen className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                          )}
                          <span className="flex-1 truncate">{les.title || `Lesson ${lesIdx + 1}`}</span>
                          <span className="text-[10px] text-muted-foreground font-mono">+{les.xp_reward}</span>
                          <button
                            onClick={e => { e.stopPropagation(); removeLesson(modIdx, lesIdx); }}
                            className="text-destructive/40 hover:text-destructive ml-1"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </button>
                      ))}
                      <button
                        onClick={() => { addLesson(modIdx); setActiveLesson({ modIdx, lesIdx: mod.lessons.length }); }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-xs text-primary/70 hover:text-primary hover:bg-primary/5 transition-colors"
                      >
                        <Plus className="w-3 h-3" /> Add Lesson
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="px-5 py-4 border-t border-border flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1 border-border/50">
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving} className="flex-1 bg-solana-gradient text-background hover:opacity-90">
            {saving ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Saving...</> : (form.id ? 'Update Course' : 'Create Course')}
          </Button>
        </div>
      </motion.div>

      {/* Right: Lesson Editor */}
      <div className="flex-1 bg-background overflow-y-auto">
        {currentLesson && activeLesson ? (
          <motion.div
            key={`${activeLesson.modIdx}-${activeLesson.lesIdx}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="max-w-3xl mx-auto p-8 space-y-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <h3 className="font-display text-xl font-bold text-foreground">Lesson Editor</h3>
              <Badge className="text-[10px] bg-secondary text-muted-foreground">
                Module {activeLesson.modIdx + 1} · Lesson {activeLesson.lesIdx + 1}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Lesson Title</label>
                <Input
                  placeholder="Lesson title"
                  value={currentLesson.title}
                  onChange={e => updateLesson(activeLesson.modIdx, activeLesson.lesIdx, 'title', e.target.value)}
                  className="bg-card border-border/50"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">XP Reward</label>
                <Input
                  type="number"
                  value={currentLesson.xp_reward}
                  onChange={e => updateLesson(activeLesson.modIdx, activeLesson.lesIdx, 'xp_reward', e.target.value)}
                  className="bg-card border-border/50"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Lesson Type</label>
              <div className="flex gap-2">
                {(['content', 'video', 'challenge'] as const).map(t => (
                  <button
                    key={t}
                    onClick={() => updateLesson(activeLesson.modIdx, activeLesson.lesIdx, 'type', t)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                      currentLesson.type === t
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border text-muted-foreground hover:border-primary/50'
                    }`}
                  >
                    {t === 'challenge' ? <FileCode className="w-4 h-4" /> : t === 'video' ? <Video className="w-4 h-4" /> : <BookOpen className="w-4 h-4" />}
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">
                {currentLesson.type === 'challenge' ? 'Challenge Instructions' : 'Lesson Content'} (Markdown)
              </label>
              <Textarea
                placeholder={currentLesson.type === 'challenge'
                  ? 'Describe what the learner must implement...'
                  : '# Lesson Title\n\nWrite your lesson content in Markdown...'
                }
                value={currentLesson.type === 'challenge' ? currentLesson.challenge_instructions : currentLesson.content}
                onChange={e => updateLesson(
                  activeLesson.modIdx, activeLesson.lesIdx,
                  currentLesson.type === 'challenge' ? 'challenge_instructions' : 'content',
                  e.target.value
                )}
                rows={8}
                className="bg-card border-border/50 resize-none font-mono text-sm"
              />
            </div>

            {currentLesson.type === 'video' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Video URL</label>
                  <Input
                    placeholder="https://youtube.com/watch?v=... or direct .mp4 URL"
                    value={currentLesson.video_url}
                    onChange={e => updateLesson(activeLesson.modIdx, activeLesson.lesIdx, 'video_url', e.target.value)}
                    className="bg-card border-border/50 font-mono text-sm"
                  />
                  <p className="text-[10px] text-muted-foreground mt-1">Supports YouTube URLs and direct video links (.mp4, .webm)</p>
                </div>
                {currentLesson.video_url && (
                  <div className="rounded-lg overflow-hidden border border-border aspect-video bg-black">
                    {currentLesson.video_url.includes('youtube.com') || currentLesson.video_url.includes('youtu.be') ? (
                      <iframe
                        src={currentLesson.video_url.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : (
                      <video src={currentLesson.video_url} controls className="w-full h-full" />
                    )}
                  </div>
                )}
              </motion.div>
            )}

            {currentLesson.type === 'challenge' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Language</label>
                  <div className="flex gap-2">
                    {(['typescript', 'rust', 'json'] as const).map(lang => (
                      <button
                        key={lang}
                        onClick={() => updateLesson(activeLesson.modIdx, activeLesson.lesIdx, 'challenge_language', lang)}
                        className={`px-3 py-1.5 rounded-lg border text-xs font-mono font-medium transition-all ${
                          currentLesson.challenge_language === lang
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border text-muted-foreground'
                        }`}
                      >
                        {lang}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Starter Code</label>
                  <Textarea
                    placeholder="// Starter code for the learner..."
                    value={currentLesson.challenge_starter_code}
                    onChange={e => updateLesson(activeLesson.modIdx, activeLesson.lesIdx, 'challenge_starter_code', e.target.value)}
                    rows={6}
                    className="bg-card border-border/50 resize-none font-mono text-sm"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Expected Output</label>
                  <Input
                    placeholder="e.g. Transaction successful"
                    value={currentLesson.challenge_expected_output}
                    onChange={e => updateLesson(activeLesson.modIdx, activeLesson.lesIdx, 'challenge_expected_output', e.target.value)}
                    className="bg-card border-border/50 font-mono text-sm"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-medium text-muted-foreground">Test Cases</label>
                    <button
                      onClick={() => addTestCase(activeLesson.modIdx, activeLesson.lesIdx)}
                      className="text-xs text-primary hover:underline flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" /> Add Test Case
                    </button>
                  </div>
                  <div className="space-y-2">
                    {currentLesson.test_cases.map((tc, tcIdx) => (
                      <div key={tcIdx} className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2 items-center">
                        <Input
                          placeholder="Test name"
                          value={tc.name}
                          onChange={e => updateTestCase(activeLesson.modIdx, activeLesson.lesIdx, tcIdx, 'name', e.target.value)}
                          className="bg-card border-border/50 text-xs h-8"
                        />
                        <Input
                          placeholder="Input"
                          value={tc.input}
                          onChange={e => updateTestCase(activeLesson.modIdx, activeLesson.lesIdx, tcIdx, 'input', e.target.value)}
                          className="bg-card border-border/50 text-xs h-8 font-mono"
                        />
                        <Input
                          placeholder="Expected"
                          value={tc.expected}
                          onChange={e => updateTestCase(activeLesson.modIdx, activeLesson.lesIdx, tcIdx, 'expected', e.target.value)}
                          className="bg-card border-border/50 text-xs h-8 font-mono"
                        />
                        <button
                          onClick={() => removeTestCase(activeLesson.modIdx, activeLesson.lesIdx, tcIdx)}
                          className="text-destructive/50 hover:text-destructive"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                    {currentLesson.test_cases.length === 0 && (
                      <p className="text-xs text-muted-foreground text-center py-3 border border-dashed border-border/50 rounded-lg">
                        No test cases yet. Add some to validate learner code.
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        ) : (
          <div className="flex items-center justify-center h-full text-center p-8">
            <div>
              <BookOpen className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">Select a lesson from the left to edit its content</p>
              <p className="text-muted-foreground/60 text-xs mt-1">Or add a new lesson to a module</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
