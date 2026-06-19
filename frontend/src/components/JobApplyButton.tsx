'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/Toast';
import Button from './ui/Button';
import Modal from './ui/Modal';
import Input from './ui/Input';
import { Send, FileText, UploadCloud, AlertCircle } from 'lucide-react';

interface JobApplyButtonProps {
  jobId: string;
  jobTitle: string;
  companyName: string;
}

export default function JobApplyButton({
  jobId,
  jobTitle,
  companyName,
}: JobApplyButtonProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [resumeUrl, setResumeUrl] = useState(user?.profile?.resumeUrl || '');
  const [resumeName, setResumeName] = useState(user?.profile?.resumeUrl ? 'Saved Profile Resume' : '');
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleOpen = () => {
    if (!user) {
      toast('Please log in to apply for this position', 'warning');
      router.push(`/login?redirect=/jobs/${jobId}`);
      return;
    }

    if (user.role !== 'SEEKER') {
      toast('Only job seekers can submit applications', 'warning');
      return;
    }

    // Prefill resume from profile if it changed
    if (user.profile?.resumeUrl && !resumeUrl) {
      setResumeUrl(user.profile.resumeUrl);
      setResumeName('Saved Profile Resume');
    }

    setIsOpen(true);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Limit to PDF or DOCX
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext !== 'pdf' && ext !== 'doc' && ext !== 'docx') {
      toast('Please upload a PDF or Word Document (.doc, .docx)', 'error');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setResumeUrl(data.url);
        setResumeName(data.fileName);
        toast('Resume uploaded successfully!', 'success');
      } else {
        toast(data.error || 'Failed to upload resume', 'error');
      }
    } catch (err) {
      console.error(err);
      toast('Error uploading file', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!resumeUrl) {
      toast('Please upload or select a resume', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId,
          resumeUrl,
          coverLetter: coverLetter.trim() || null,
        }),
      });

      const data = await res.json();
      setSubmitting(false);

      if (res.ok && data.success) {
        toast(`Application submitted for ${jobTitle}!`, 'success');
        setIsOpen(false);
        setCoverLetter('');
        router.refresh();
      } else {
        toast(data.error || 'Failed to submit application', 'error');
      }
    } catch (err) {
      console.error(err);
      setSubmitting(false);
      toast('An error occurred during submission', 'error');
    }
  };

  const renderApplyButton = () => {
    if (user?.role === 'EMPLOYER') {
      return (
        <div className="rounded-xl bg-slate-100 p-4 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
          <p className="text-xs font-semibold text-slate-500">
            Viewing as Employer. You cannot apply to listings.
          </p>
        </div>
      );
    }

    if (user?.role === 'ADMIN') {
      return (
        <div className="rounded-xl bg-slate-100 p-4 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
          <p className="text-xs font-semibold text-slate-500">
            Viewing as Admin. You cannot apply to listings.
          </p>
        </div>
      );
    }

    return (
      <Button
        onClick={handleOpen}
        variant="accent"
        size="lg"
        className="w-full text-sm font-bold tracking-wide"
      >
        Apply Now
      </Button>
    );
  };

  return (
    <>
      {renderApplyButton()}

      {/* Application Dialog Modal */}
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={`Apply for ${jobTitle}`}
        footer={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="accent"
              onClick={handleSubmit}
              isLoading={submitting}
              disabled={uploading}
            >
              Submit Application <Send className="ml-2 h-4 w-4" />
            </Button>
          </div>
        }
      >
        <div className="space-y-5">
          <div className="bg-slate-50 p-3 rounded-lg dark:bg-slate-950/40 text-xs text-slate-600 dark:text-slate-400">
            Applying to <span className="font-semibold text-slate-800 dark:text-slate-200">{companyName}</span> for the role of <span className="font-semibold text-slate-800 dark:text-slate-200">{jobTitle}</span>.
          </div>

          {/* Resume Upload area */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              Resume / CV (Required)
            </label>

            {resumeUrl ? (
              <div className="flex items-center justify-between border border-slate-200 rounded-lg p-3 dark:border-slate-800 bg-white dark:bg-slate-900">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary-500" />
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[200px]">
                      {resumeName}
                    </p>
                    <a
                      href={resumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-primary-500 hover:underline"
                    >
                      Preview resume
                    </a>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setResumeUrl('');
                    setResumeName('');
                  }}
                  className="text-xs text-red-500 font-bold hover:underline"
                >
                  Change
                </button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-slate-300 dark:border-slate-800 rounded-lg p-6 text-center hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors relative cursor-pointer">
                <input
                  type="file"
                  onChange={handleUpload}
                  accept=".pdf,.doc,.docx"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={uploading}
                />
                <UploadCloud className="h-8 w-8 text-slate-400 mx-auto" />
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-2">
                  {uploading ? 'Uploading resume...' : 'Upload your resume'}
                </p>
                <p className="text-[10px] text-slate-400 mt-1">
                  Supports PDF, DOC, DOCX up to 10MB
                </p>
              </div>
            )}
          </div>

          {/* Cover Letter */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Cover Letter (Optional)
            </label>
            <textarea
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              placeholder="Explain why you are the perfect fit for this role..."
              className="block w-full min-h-[120px] rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 placeholder-slate-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>

        </div>
      </Modal>
    </>
  );
}
