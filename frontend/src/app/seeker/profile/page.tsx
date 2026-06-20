'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/Toast';
import { apiFetch } from '@/lib/api';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import Modal from '@/components/ui/Modal';
import { 
  User, 
  MapPin, 
  Briefcase, 
  Award, 
  Trash2, 
  Plus, 
  UploadCloud, 
  FileText, 
  Link as LinkIcon 
} from 'lucide-react';

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

export default function SeekerProfilePage() {
  const { user, loading, refreshSession } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  // Basic Info Form States
  const [fullName, setFullName] = useState('');
  const [headline, setHeadline] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [skills, setSkills] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [visibility, setVisibility] = useState('PUBLIC');
  const [openToWork, setOpenToWork] = useState(true);
  const [resumeUrl, setResumeUrl] = useState('');
  
  // Experience & Education lists
  const [experience, setExperience] = useState<ExperienceItem[]>([]);
  const [education, setEducation] = useState<EducationItem[]>([]);

  // Modal control & temporary item states
  const [expModalOpen, setExpModalOpen] = useState(false);
  const [eduModalOpen, setEduModalOpen] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Temporary Experience form state
  const [tempExp, setTempExp] = useState<ExperienceItem>({
    title: '', company: '', location: '', startDate: '', endDate: '', description: '', current: false
  });

  // Temporary Education form state
  const [tempEdu, setTempEdu] = useState<EducationItem>({
    school: '', degree: '', fieldOfStudy: '', startDate: '', endDate: ''
  });

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (user.role !== 'SEEKER') {
        router.push('/');
      } else {
        // Prefill profile states
        const prof = user.profile;
        setFullName(prof?.fullName || '');
        setHeadline(prof?.headline || '');
        setBio(prof?.bio || '');
        setLocation(prof?.location || '');
        setSkills(prof?.skills || '');
        setPortfolioUrl(prof?.portfolioUrl || '');
        setLinkedinUrl(prof?.linkedinUrl || '');
        setGithubUrl(prof?.githubUrl || '');
        setVisibility(prof?.visibility || 'PUBLIC');
        setOpenToWork(prof?.openToWork ?? true);
        setResumeUrl(prof?.resumeUrl || '');

        try {
          setExperience(JSON.parse(prof?.experience || '[]'));
          setEducation(JSON.parse(prof?.education || '[]'));
        } catch (err) {
          console.error(err);
        }
      }
    }
  }, [user, loading]);

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext !== 'pdf' && ext !== 'doc' && ext !== 'docx') {
      toast('Please upload a PDF or Word Document (.doc, .docx)', 'error');
      return;
    }

    setUploadingResume(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await apiFetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setResumeUrl(data.url);
        toast('Resume uploaded successfully!', 'success');
      } else {
        toast(data.error || 'Failed to upload resume', 'error');
      }
    } catch (err) {
      console.error(err);
      toast('Error uploading file', 'error');
    } finally {
      setUploadingResume(false);
    }
  };

  const handleAddExperience = () => {
    if (!tempExp.title.trim() || !tempExp.company.trim()) {
      toast('Job Title and Company Name are required', 'warning');
      return;
    }
    setExperience(prev => [...prev, tempExp]);
    setTempExp({
      title: '', company: '', location: '', startDate: '', endDate: '', description: '', current: false
    });
    setExpModalOpen(false);
    toast('Experience entry added', 'success');
  };

  const handleDeleteExperience = (idx: number) => {
    setExperience(prev => prev.filter((_, i) => i !== idx));
    toast('Experience entry removed', 'info');
  };

  const handleAddEducation = () => {
    if (!tempEdu.school.trim() || !tempEdu.degree.trim()) {
      toast('School and Degree are required', 'warning');
      return;
    }
    setEducation(prev => [...prev, tempEdu]);
    setTempEdu({
      school: '', degree: '', fieldOfStudy: '', startDate: '', endDate: ''
    });
    setEduModalOpen(false);
    toast('Education entry added', 'success');
  };

  const handleDeleteEducation = (idx: number) => {
    setEducation(prev => prev.filter((_, i) => i !== idx));
    toast('Education entry removed', 'info');
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      toast('Full name is required', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      const res = await apiFetch('/api/seeker/profile', {
        method: 'PUT',
        body: JSON.stringify({
          fullName,
          headline,
          bio,
          location,
          skills,
          experience,
          education,
          portfolioUrl,
          linkedinUrl,
          githubUrl,
          visibility,
          openToWork,
          resumeUrl,
        }),
      });

      const data = await res.json();
      setSubmitting(false);

      if (res.ok && data.success) {
        toast('Profile updated successfully!', 'success');
        await refreshSession();
        router.push('/seeker/dashboard');
      } else {
        toast(data.error || 'Failed to update profile', 'error');
      }
    } catch (err) {
      console.error(err);
      setSubmitting(false);
      toast('An error occurred during save', 'error');
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
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 w-full space-y-8 flex-grow">
      
      {/* Header */}
      <div className="border-b border-slate-200 pb-5 dark:border-slate-800">
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Build Your Professional Profile
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Provide your information to help matching recruiters discover and evaluate you.
        </p>
      </div>

      <form onSubmit={handleSaveProfile} className="space-y-6">
        
        {/* 1. Basic Information */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 pb-3 dark:border-slate-800 flex items-center gap-2">
            <User className="h-5 w-5 text-primary-500" /> Basic Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Full Name *"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Jane Doe"
            />
            <Input
              label="Professional Headline"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              placeholder="e.g. Senior Frontend Developer | React Expert"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. San Francisco, CA"
            />
            <Input
              label="Skills (Comma-separated tags)"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              placeholder="e.g. React, TypeScript, Node.js, SQL"
              helperText="Separate each skill tag with a comma."
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Short Biography / Summary
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell companies about your professional journey..."
              className="block w-full min-h-[100px] rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 placeholder-slate-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>
        </div>

        {/* 2. Resume CV File */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 pb-3 dark:border-slate-800 flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary-500" /> Resume / CV Document
          </h2>

          {resumeUrl ? (
            <div className="flex items-center justify-between border border-slate-200 rounded-lg p-3 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/20">
              <div className="flex items-center gap-2">
                <FileText className="h-6 w-6 text-primary-500" />
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">Profile Resume Uploaded</p>
                  <a href={resumeUrl} target="_blank" rel="noopener noreferrer" className="text-[10px] text-primary-500 hover:underline">
                    View resume document
                  </a>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setResumeUrl('')}
                className="text-xs text-red-500 font-bold hover:underline"
              >
                Delete Resume
              </button>
            </div>
          ) : (
            <div className="border-2 border-dashed border-slate-300 dark:border-slate-800 rounded-lg p-6 text-center hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors relative cursor-pointer">
              <input
                type="file"
                onChange={handleResumeUpload}
                accept=".pdf,.doc,.docx"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={uploadingResume}
              />
              <UploadCloud className="h-8 w-8 text-slate-400 mx-auto" />
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-2">
                {uploadingResume ? 'Uploading files...' : 'Upload new resume'}
              </p>
              <p className="text-[10px] text-slate-400 mt-1">Supports PDF, DOC, DOCX up to 10MB</p>
            </div>
          )}
        </div>

        {/* 3. Work Experience */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-primary-500" /> Work History
            </h2>
            <button
              type="button"
              onClick={() => setExpModalOpen(true)}
              className="flex items-center gap-1 text-xs font-bold text-primary-600 hover:underline dark:text-primary-400"
            >
              <Plus className="h-3.5 w-3.5" /> Add Experience
            </button>
          </div>

          {experience.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
              No work history added yet.
            </div>
          ) : (
            <div className="space-y-3">
              {experience.map((exp, idx) => (
                <div key={idx} className="flex justify-between items-start p-4 border border-slate-200 rounded-xl dark:border-slate-800">
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">{exp.title}</h4>
                    <p className="text-xs text-slate-500 font-semibold">{exp.company} &bull; {exp.location}</p>
                    <p className="text-[10px] text-slate-400">
                      {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                    </p>
                    {exp.description && (
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">{exp.description}</p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteExperience(idx)}
                    className="text-slate-400 hover:text-red-500 p-1 rounded hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 4. Education History */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Award className="h-5 w-5 text-primary-500" /> Education History
            </h2>
            <button
              type="button"
              onClick={() => setEduModalOpen(true)}
              className="flex items-center gap-1 text-xs font-bold text-primary-600 hover:underline dark:text-primary-400"
            >
              <Plus className="h-3.5 w-3.5" /> Add Education
            </button>
          </div>

          {education.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
              No education history added yet.
            </div>
          ) : (
            <div className="space-y-3">
              {education.map((edu, idx) => (
                <div key={idx} className="flex justify-between items-start p-4 border border-slate-200 rounded-xl dark:border-slate-800">
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">{edu.school}</h4>
                    <p className="text-xs text-slate-500 font-semibold">
                      {edu.degree} in {edu.fieldOfStudy}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {edu.startDate} - {edu.endDate}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteEducation(idx)}
                    className="text-slate-400 hover:text-red-500 p-1 rounded hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 5. Online Portfolios & Visibility */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 pb-3 dark:border-slate-800 flex items-center gap-2">
            <LinkIcon className="h-5 w-5 text-primary-500" /> Links & Privacy
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Portfolio / Personal Web"
              value={portfolioUrl}
              onChange={(e) => setPortfolioUrl(e.target.value)}
              placeholder="https://jane.dev"
            />
            <Input
              label="LinkedIn URL"
              value={linkedinUrl}
              onChange={(e) => setLinkedinUrl(e.target.value)}
              placeholder="https://linkedin.com/in/jane"
            />
            <Input
              label="GitHub Profile URL"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              placeholder="https://github.com/jane"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-100 pt-4 dark:border-slate-800/60">
            <Select
              label="Profile Visibility"
              value={visibility}
              onChange={(e) => setVisibility(e.target.value)}
              options={[
                { label: 'Public (Everyone can see profile & resume)', value: 'PUBLIC' },
                { label: 'Employers Only (Only verified companies can view)', value: 'EMPLOYERS_ONLY' },
                { label: 'Private (Hidden from candidate databases)', value: 'PRIVATE' },
              ]}
            />
            
            <div className="flex flex-col justify-end pb-1.5">
              <label className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={openToWork}
                  onChange={(e) => setOpenToWork(e.target.checked)}
                  className="h-4.5 w-4.5 rounded border-slate-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
                />
                Display "Open To Work" badge on profile
              </label>
            </div>
          </div>
        </div>

        {/* Action Panel */}
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/seeker/dashboard')}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            isLoading={submitting}
          >
            Save Changes & View Dashboard
          </Button>
        </div>

      </form>

      {/* 6. Modals for Adding items */}
      {/* Experience modal */}
      <Modal
        isOpen={expModalOpen}
        onClose={() => setExpModalOpen(false)}
        title="Add Work History Entry"
        footer={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setExpModalOpen(false)}>Cancel</Button>
            <Button onClick={handleAddExperience}>Add Entry</Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Input
            label="Job Title *"
            required
            value={tempExp.title}
            onChange={(e) => setTempExp(prev => ({ ...prev, title: e.target.value }))}
            placeholder="e.g. Lead Software Engineer"
          />
          <Input
            label="Company Name *"
            required
            value={tempExp.company}
            onChange={(e) => setTempExp(prev => ({ ...prev, company: e.target.value }))}
            placeholder="e.g. TechCorp"
          />
          <Input
            label="Location"
            value={tempExp.location}
            onChange={(e) => setTempExp(prev => ({ ...prev, location: e.target.value }))}
            placeholder="e.g. Austin, TX (or Hybrid)"
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Start Date"
              type="text"
              value={tempExp.startDate}
              onChange={(e) => setTempExp(prev => ({ ...prev, startDate: e.target.value }))}
              placeholder="e.g. Jan 2023"
            />
            {!tempExp.current && (
              <Input
                label="End Date"
                type="text"
                value={tempExp.endDate}
                onChange={(e) => setTempExp(prev => ({ ...prev, endDate: e.target.value }))}
                placeholder="e.g. Present or Dec 2024"
              />
            )}
          </div>
          <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
            <input
              type="checkbox"
              checked={tempExp.current}
              onChange={(e) => setTempExp(prev => ({ ...prev, current: e.target.checked, endDate: e.target.checked ? '' : prev.endDate }))}
              className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
            />
            I currently work in this role
          </label>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Description / Core Responsibilities
            </label>
            <textarea
              value={tempExp.description}
              onChange={(e) => setTempExp(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Briefly state your duties and achievements..."
              className="block w-full min-h-[90px] rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 placeholder-slate-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>
        </div>
      </Modal>

      {/* Education modal */}
      <Modal
        isOpen={eduModalOpen}
        onClose={() => setEduModalOpen(false)}
        title="Add Education Entry"
        footer={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setEduModalOpen(false)}>Cancel</Button>
            <Button onClick={handleAddEducation}>Add Entry</Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Input
            label="School / University *"
            required
            value={tempEdu.school}
            onChange={(e) => setTempEdu(prev => ({ ...prev, school: e.target.value }))}
            placeholder="e.g. Stanford University"
          />
          <Input
            label="Degree *"
            required
            value={tempEdu.degree}
            onChange={(e) => setTempEdu(prev => ({ ...prev, degree: e.target.value }))}
            placeholder="e.g. B.S. or M.S."
          />
          <Input
            label="Field of Study"
            value={tempEdu.fieldOfStudy}
            onChange={(e) => setTempEdu(prev => ({ ...prev, fieldOfStudy: e.target.value }))}
            placeholder="e.g. Computer Science"
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Start Date"
              value={tempEdu.startDate}
              onChange={(e) => setTempEdu(prev => ({ ...prev, startDate: e.target.value }))}
              placeholder="e.g. Sep 2019"
            />
            <Input
              label="End Date"
              value={tempEdu.endDate}
              onChange={(e) => setTempEdu(prev => ({ ...prev, endDate: e.target.value }))}
              placeholder="e.g. Jun 2023"
            />
          </div>
        </div>
      </Modal>

    </div>
  );
}
