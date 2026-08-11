'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import NewCaseLeadFollowUpForm from '@/components/vendor-portal/leads/NewCaseLeadFollowUpForm';

export default function PublicVendorFormPage() {
  const params = useParams();
  const token = (params?.token as string) || '';
  const [vendorName, setVendorName] = useState<string>('');
  const [vendorId, setVendorId] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function getVendorMeta() {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`/api/public/form/${token}`);
        const data = await res.json();
        if (data.success && data.vendor) {
          setVendorName(data.vendor.name);
          setVendorId(data.vendor.id);
        }
      } catch (err) {
        console.error('Error fetching public form vendor info:', err);
      } finally {
        setLoading(false);
      }
    }
    getVendorMeta();
  }, [token]);

  if (loading) {
    return (
      <div className="flex h-64 w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="w-full bg-slate-50 min-h-screen py-6 px-4">
      <NewCaseLeadFollowUpForm
        vendorId={vendorId || token}
        vendorName={vendorName || 'Public Lead Intake'}
        title="New Case: Lead Follow Up"
        subtitle="Fill out the grouped sections below to record complete case follow-up data."
      />
    </div>
  );
}
