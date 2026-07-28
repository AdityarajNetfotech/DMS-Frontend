import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PricingPlansModal from '../components/Subscription/PricingPlansModal';
import { API_BASE_URL } from '../config/api';

export default function PricingPlansPage() {
  const { companySlug } = useParams();
  const navigate = useNavigate();
  const [currentPlan, setCurrentPlan] = useState('Trial');

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        if (!companySlug) return;
        const res = await fetch(`${API_BASE_URL}/api/tenant/subscription/status/${companySlug}`);
        const data = await res.json();
        if (data.success && data.subscription?.plan) {
          setCurrentPlan(data.subscription.plan);
        }
      } catch (err) {
        console.error('Failed to fetch subscription status', err);
      }
    };
    fetchStatus();
  }, [companySlug]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <PricingPlansModal
        isOpen={true}
        onClose={() => navigate(-1)}
        companySlug={companySlug}
        currentPlan={currentPlan}
      />
    </div>
  );
}
