'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';

interface ShareButtonsProps {
  complaintText: string;
  subject: string;
}

export default function ShareButtons({ complaintText, subject }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(complaintText);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      alert('Could not copy automatically. Please select the text manually.');
    }
  }, [complaintText]);

  const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(complaintText)}`;

  return (
    <div className="space-y-3">
      <h3 className="font-bold text-base text-gray-800">Actions</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Button
          type="button"
          onClick={handleCopy}
          className="w-full border-2 border-gray-300 hover:border-gray-500 bg-white text-gray-800 font-medium py-3 rounded-xl transition-colors min-h-[44px]"
        >
          {copied ? '✅ Copied to Clipboard!' : '📋 Copy Complaint Text'}
        </Button>
        <a
          href={mailtoUrl}
          className="flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-xl transition-colors min-h-[44px]"
        >
          ✉️ Send via Email
        </a>
      </div>
    </div>
  );
}