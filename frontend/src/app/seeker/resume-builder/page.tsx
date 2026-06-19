'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/Toast';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { FileText, UploadCloud, Sparkles, Plus, Trash2, Save, Download, Eye } from 'lucide-react';

interface ExperienceItem {
  title: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  description: string;
  current: boolean;
}

interface EducationItem {
  school: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate: string;
}

export default function ResumeBuilderPage() {
  const { user, loading, refreshSession } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  // Profile States
  const [fullName, setFullName] = useState('');
  const [headline, setHeadline] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [skills, setSkills] = useState('');
  const [experience, setExperience] = useState<ExperienceItem[]>([]);
  const [education, setEducation] = useState<EducationItem[]>([]);

  // Page States
  const [isParsing, setIsParsing] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (user.role !== 'SEEKER') {
        router.push('/');
      } else {
        // Prefill from profile
        const prof = user.profile;
        setFullName(prof?.fullName || '');
        setHeadline(prof?.headline || '');
        setBio(prof?.bio || '');
        setLocation(prof?.location || '');
        setSkills(prof?.skills || '');
        try {
          setExperience(JSON.parse(prof?.experience || '[]'));
          setEducation(JSON.parse(prof?.education || '[]'));
        } catch (err) {
          console.error(err);
        }
      }
    }
  }, [user, loading]);

  // Mock Resume Parser
  const handleResumeParse = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsParsing(true);
    toast('Uploading and parsing resume using CareerWave AI parser...', 'info');

    setTimeout(() => {
      // Set mocked parsed data based on filename or defaults
      setFullName(user?.profile?.fullName || 'John Doe');
      setHeadline('Full Stack Software Engineer');
      setBio('Detail-oriented developer with expertise in designing, building, and deploying highly scalable cloud applications.');
      setLocation('San Francisco, CA');
      setSkills('React, TypeScript, Node.js, Next.js, Express, Postgres, Docker, Git, CI/CD');
      setExperience([
        {
          title: 'Software Engineer II',
          company: 'InnoTech Solutions',
          location: 'San Francisco, CA',
          startDate: 'Jun 2024',
          endDate: 'Present',
          description: 'Engineered responsive web applications using React and Next.js. Optimized database queries and API response times by 35%. Lead developer on high-traffic company dashboard.',
          current: true
        },
        {
          title: 'Associate Web Developer',
          company: 'DevScale Agency',
          location: 'Remote',
          startDate: 'Jan 2022',
          endDate: 'May 2024',
          description: 'Developed custom web projects for clients. Collaborative developer in agile workflows. Wrote automated Jest tests increasing code coverage by 20%.',
          current: false
        }
      ]);
      setEducation([
        {
          school: 'State Tech University',
          degree: 'B.S.',
          fieldOfStudy: 'Computer Science',
          startDate: 'Sep 2018',
          endDate: 'Dec 2022'
        }
      ]);

      setIsParsing(false);
      toast('Resume parsed successfully! Review and edit the fields below.', 'success');
    }, 2500);
  };

  const handleAddExperience = () => {
    setExperience(prev => [
      ...prev,
      { title: '', company: '', location: '', startDate: '', endDate: '', description: '', current: false }
    ]);
  };

  const handleUpdateExperience = (index: number, key: keyof ExperienceItem, val: any) => {
    setExperience(prev => prev.map((item, idx) => {
      if (idx === index) {
        const updated = { ...item, [key]: val };
        if (key === 'current' && val === true) {
          updated.endDate = '';
        }
        return updated;
      }
      return item;
    }));
  };

  const handleDeleteExperience = (index: number) => {
    setExperience(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleAddEducation = () => {
    setEducation(prev => [
      ...prev,
      { school: '', degree: '', fieldOfStudy: '', startDate: '', endDate: '' }
    ]);
  };

  const handleUpdateEducation = (index: number, key: keyof EducationItem, val: any) => {
    setEducation(prev => prev.map((item, idx) => (idx === index ? { ...item, [key]: val } : item)));
  };

  const handleDeleteEducation = (index: number) => {
    setEducation(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleSaveResume = async () => {
    if (!fullName.trim() || !headline.trim()) {
      toast('Full Name and Headline are required', 'warning');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/seeker/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          headline,
          bio,
          location,
          skills,
          experience,
          education,
          portfolioUrl: user?.profile?.portfolioUrl || '',
          linkedinUrl: user?.profile?.linkedinUrl || '',
          githubUrl: user?.profile?.githubUrl || '',
          visibility: user?.profile?.visibility || 'PUBLIC',
          openToWork: user?.profile?.openToWork ?? true,
          resumeUrl: user?.profile?.resumeUrl || 'http://localhost:5000/uploads/generated_resume.pdf' // Simulate resume file generation
        }),
      });

      const data = await res.json();
      setSaving(false);

      if (res.ok && data.success) {
        toast('Resume details saved and synced to profile!', 'success');
        await refreshSession();
        router.push('/seeker/dashboard');
      } else {
        toast(data.error || 'Failed to save resume details', 'error');
      }
    } catch (err) {
      console.error(err);
      setSaving(false);
      toast('An error occurred during saving', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-grow items-center justify-center min-h-[70vh]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 w-full flex-grow space-y-8">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200 pb-5 dark:border-slate-800 gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary-500" /> Resume Builder & Parser
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Build your professional resume from scratch or upload an existing PDF/Word resume to auto-fill the forms.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push('/seeker/dashboard')} className="text-xs font-bold">
            Back to Dashboard
          </Button>
          <Button onClick={handleSaveResume} isLoading={saving} className="text-xs font-bold flex items-center gap-1.5">
            <Save className="h-4 w-4" /> Save & Update Profile
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Builder Form & Upload */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* 1. Upload & Auto-Parse Section */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <UploadCloud className="h-5 w-5 text-primary-500" /> Smart Resume Parser
            </h2>
            <p className="text-[11px] text-slate-500 leading-normal">
              Have an existing resume? Upload it here. Our parser will instantly extract your skills, experience, and details to fill out the form automatically.
            </p>
            
            <div className="border-2 border-dashed border-slate-300 dark:border-slate-800 rounded-xl p-6 text-center hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors relative cursor-pointer">
              <input
                type="file"
                onChange={handleResumeParse}
                accept=".pdf,.doc,.docx"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={isParsing}
              />
              <FileText className="h-8 w-8 text-slate-400 mx-auto" />
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-2">
                {isParsing ? 'Parsing resume with AI...' : 'Upload resume to parse'}
              </p>
              <p className="text-[10px] text-slate-400 mt-1">Supports PDF, DOC, DOCX up to 10MB</p>
            </div>
          </div>

          {/* 2. Contact & Bio Details */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Contact & Professional Summary</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Full Name *"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. John Doe"
              />
              <Input
                label="Job Title / Headline *"
                required
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder="e.g. Senior Frontend Developer"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Location / Country"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Austin, TX"
              />
              <Input
                label="Skills Tags (Comma separated)"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                placeholder="e.g. React, Node.js, SQL"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Summary / Objective
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell recruiters about yourself..."
                className="block w-full min-h-[90px] rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>
          </div>

          {/* 3. Work Experience */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3 dark:border-slate-800">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Work History</h2>
              <button
                type="button"
                onClick={handleAddExperience}
                className="flex items-center gap-1 text-xs font-bold text-primary-600 hover:underline dark:text-primary-400"
              >
                <Plus className="h-3.5 w-3.5" /> Add Experience
              </button>
            </div>

            {experience.length === 0 ? (
              <p className="text-center text-xs text-slate-400 py-4">No experience items added yet.</p>
            ) : (
              <div className="space-y-6">
                {experience.map((exp, idx) => (
                  <div key={idx} className="relative border-b border-slate-100 pb-5 dark:border-slate-800 space-y-4">
                    <button
                      type="button"
                      onClick={() => handleDeleteExperience(idx)}
                      className="absolute right-0 top-0 text-slate-400 hover:text-red-500"
                    >
                      <Trash2 className="h-4.5 w-4.5" />
                    </button>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Job Title *"
                        value={exp.title}
                        onChange={(e) => handleUpdateExperience(idx, 'title', e.target.value)}
                        placeholder="e.g. Software Engineer"
                      />
                      <Input
                        label="Company *"
                        value={exp.company}
                        onChange={(e) => handleUpdateExperience(idx, 'company', e.target.value)}
                        placeholder="e.g. Acme Corp"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Input
                        label="Location"
                        value={exp.location}
                        onChange={(e) => handleUpdateExperience(idx, 'location', e.target.value)}
                        placeholder="e.g. Seattle, WA"
                      />
                      <Input
                        label="Start Date"
                        value={exp.startDate}
                        onChange={(e) => handleUpdateExperience(idx, 'startDate', e.target.value)}
                        placeholder="e.g. Jan 2022"
                      />
                      {!exp.current && (
                        <Input
                          label="End Date"
                          value={exp.endDate}
                          onChange={(e) => handleUpdateExperience(idx, 'endDate', e.target.value)}
                          placeholder="e.g. Present or Dec 2023"
                        />
                      )}
                    </div>

                    <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                      <input
                        type="checkbox"
                        checked={exp.current}
                        onChange={(e) => handleUpdateExperience(idx, 'current', e.target.checked)}
                        className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                      />
                      I currently work in this role
                    </label>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Responsibilities
                      </label>
                      <textarea
                        value={exp.description}
                        onChange={(e) => handleUpdateExperience(idx, 'description', e.target.value)}
                        placeholder="Detail your achievements and projects..."
                        className="block w-full min-h-[80px] rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 4. Education History */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3 dark:border-slate-800">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Education History</h2>
              <button
                type="button"
                onClick={handleAddEducation}
                className="flex items-center gap-1 text-xs font-bold text-primary-600 hover:underline dark:text-primary-400"
              >
                <Plus className="h-3.5 w-3.5" /> Add Education
              </button>
            </div>

            {education.length === 0 ? (
              <p className="text-center text-xs text-slate-400 py-4">No education items added yet.</p>
            ) : (
              <div className="space-y-6">
                {education.map((edu, idx) => (
                  <div key={idx} className="relative border-b border-slate-100 pb-5 dark:border-slate-800 space-y-4">
                    <button
                      type="button"
                      onClick={() => handleDeleteEducation(idx)}
                      className="absolute right-0 top-0 text-slate-400 hover:text-red-500"
                    >
                      <Trash2 className="h-4.5 w-4.5" />
                    </button>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="School / University *"
                        value={edu.school}
                        onChange={(e) => handleUpdateEducation(idx, 'school', e.target.value)}
                        placeholder="e.g. Stanford University"
                      />
                      <Input
                        label="Degree *"
                        value={edu.degree}
                        onChange={(e) => handleUpdateEducation(idx, 'degree', e.target.value)}
                        placeholder="e.g. B.S."
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Input
                        label="Field of Study"
                        value={edu.fieldOfStudy}
                        onChange={(e) => handleUpdateEducation(idx, 'fieldOfStudy', e.target.value)}
                        placeholder="e.g. Computer Science"
                      />
                      <Input
                        label="Start Date"
                        value={edu.startDate}
                        onChange={(e) => handleUpdateEducation(idx, 'startDate', e.target.value)}
                        placeholder="e.g. Sep 2018"
                      />
                      <Input
                        label="End Date"
                        value={edu.endDate}
                        onChange={(e) => handleUpdateEducation(idx, 'endDate', e.target.value)}
                        placeholder="e.g. Jun 2022"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Right Side: Visual Preview */}
        <div className="lg:col-span-5 space-y-4">
          <div className="sticky top-6 border border-slate-200 rounded-3xl bg-slate-900 p-6 text-white shadow-xl max-h-[85vh] overflow-y-auto space-y-6">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <span className="text-[10px] font-extrabold tracking-widest text-accent-400 uppercase flex items-center gap-1">
                <Eye className="h-3.5 w-3.5" /> Live Resume Preview
              </span>
              <div className="flex gap-2">
                <span className="text-[10px] font-semibold text-slate-400 flex items-center gap-1">
                  <Download className="h-3 w-3" /> Auto-sync active
                </span>
              </div>
            </div>

            {/* A4 Sheet Mockup */}
            <div className="bg-white text-slate-800 rounded-2xl p-6 space-y-6 font-sans text-xs shadow">
              
              {/* Header */}
              <div className="text-center space-y-1.5 border-b border-slate-200 pb-4">
                <h3 className="text-base font-extrabold text-slate-950 uppercase tracking-wide">
                  {fullName || 'Your Name'}
                </h3>
                <p className="text-[10px] font-bold text-primary-600 uppercase tracking-widest">
                  {headline || 'Target Job Title'}
                </p>
                <div className="text-[9px] text-slate-500 font-medium">
                  {location || 'Location Address'} &bull; {user?.email}
                </div>
              </div>

              {/* Summary */}
              {bio && (
                <div className="space-y-1.5">
                  <h4 className="text-[10px] font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-1">
                    Professional Summary
                  </h4>
                  <p className="text-[10px] text-slate-600 leading-relaxed">{bio}</p>
                </div>
              )}

              {/* Skills */}
              {skills && (
                <div className="space-y-1.5">
                  <h4 className="text-[10px] font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-1">
                    Core Skills
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {skills.split(',').map((skill, index) => (
                      <span key={index} className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[8px] font-semibold">
                        {skill.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Experience */}
              {experience.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-[10px] font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-1">
                    Work Experience
                  </h4>
                  <div className="space-y-3">
                    {experience.map((exp, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="font-bold text-slate-900">{exp.title || 'Role Title'}</span>
                            <span className="text-slate-500"> &bull; {exp.company || 'Company'}</span>
                          </div>
                          <span className="text-[9px] text-slate-400 font-semibold">
                            {exp.startDate || 'Start'} - {exp.current ? 'Present' : exp.endDate || 'End'}
                          </span>
                        </div>
                        {exp.description && (
                          <p className="text-[9px] text-slate-600 leading-relaxed font-light">{exp.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Education */}
              {education.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-[10px] font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-1">
                    Education
                  </h4>
                  <div className="space-y-2">
                    {education.map((edu, idx) => (
                      <div key={idx} className="flex justify-between items-start">
                        <div>
                          <span className="font-bold text-slate-900">{edu.school || 'School/University'}</span>
                          <div className="text-slate-500">
                            {edu.degree || 'Degree'} {edu.fieldOfStudy ? `in ${edu.fieldOfStudy}` : ''}
                          </div>
                        </div>
                        <span className="text-[9px] text-slate-400 font-semibold">
                          {edu.startDate || 'Start'} - {edu.endDate || 'End'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
