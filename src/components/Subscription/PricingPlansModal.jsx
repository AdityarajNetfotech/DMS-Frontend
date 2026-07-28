import React, { useState, useEffect } from 'react';
import { Check, Zap, Crown, ShieldCheck, Sparkles, X, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../config/api';

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      return resolve(true);
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function PricingPlansModal({ isOpen, onClose, companySlug, currentPlan = 'Trial' }) {
  const navigate = useNavigate();
  const [loadingPlan, setLoadingPlan] = useState('');
  const [error, setError] = useState('');
  const [subDetails, setSubDetails] = useState({
    plan: currentPlan,
    daysLeft: 7,
    status: 'active',
    trialEnded: false
  });

  const userRole = localStorage.getItem("userRole");
  const isAdmin = userRole === "Tenant Admin" || userRole === "Company Admin";

  useEffect(() => {
    const fetchSubStatus = async () => {
      try {
        if (!companySlug) return;
        const res = await fetch(`${API_BASE_URL}/api/tenant/subscription/status/${companySlug}`);
        const data = await res.json();
        if (data.success) {
          const now = new Date();
          const plan = data.subscription?.plan || 'Trial';
          const targetDate = plan === 'Trial' ? new Date(data.trialEndsAt) : new Date(data.subscription?.expiresAt);

          let daysLeft = 0;
          if (targetDate && !isNaN(targetDate)) {
            const diffTime = targetDate - now;
            daysLeft = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
          }

          setSubDetails({
            plan,
            daysLeft,
            status: data.subscription?.status || 'active',
            trialEnded: data.trialEnded
          });
        }
      } catch (err) {
        console.error("Failed to fetch subscription status in modal", err);
      }
    };
    fetchSubStatus();
  }, [companySlug]);

  const activePlanName = subDetails.plan || currentPlan;

  const plans = [
    {
      name: 'Free Trial',
      price: '0',
      billing: '7 days',
      icon: ShieldCheck,
      iconColor: 'text-slate-600',
      badgeBg: 'bg-slate-50 text-slate-700 border-slate-200',
      buttonStyle: 'bg-slate-500 cursor-not-allowed text-white',
      validations: {
        users: 'Max 3 Users',
        storage: '500 MB Storage',
        ai: '5 AI Queries / mo'
      },
      features: [
        'Up to 3 Team Users',
        '500 MB Secure Cloud Storage',
        'Basic AI Summaries (5/mo)',
        'Standard Document Search & Filters'
      ],
      notIncluded: ['Custom Branding', 'Audit Logging', 'Priority Support']
    },
    {
      name: 'Basic',
      price: '1,499',
      billing: 'per month',
      icon: Zap,
      iconColor: 'text-blue-600',
      badgeBg: 'bg-blue-50 text-blue-700 border-blue-200',
      buttonStyle: 'bg-blue-600 hover:bg-blue-700 text-white',
      validations: {
        users: 'Max 10 Users',
        storage: '5 GB Cloud Storage',
        ai: 'No AI Summaries'
      },
      features: [
        'Up to 10 Team Users',
        '5 GB Secure Cloud Storage',
        'Standard Document Search & Filters',
        'Internal & External Sharing',
        'Email Support'
      ],
      notIncluded: ['AI Summaries & Chat', 'Audit Logging']
    },
    {
      name: 'Pro',
      price: '3,999',
      billing: 'per month',
      popular: true,
      icon: Sparkles,
      iconColor: 'text-purple-600',
      badgeBg: 'bg-purple-50 text-purple-700 border-purple-200',
      buttonStyle: 'bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-500/25',
      validations: {
        users: 'Max 50 Users',
        storage: '25 GB Cloud Storage',
        ai: '100 AI Queries / mo'
      },
      features: [
        'Up to 50 Team Users',
        '25 GB Secure Cloud Storage',
        '100 AI Summaries / month',
        'Role-based Access Control',
        'Priority Email & Chat Support'
      ]
    },
    {
      name: 'Ultra',
      price: '7,999',
      billing: 'per month',
      icon: Crown,
      iconColor: 'text-amber-600',
      badgeBg: 'bg-amber-50 text-amber-700 border-amber-200',
      buttonStyle: 'bg-amber-600 hover:bg-amber-700 text-white',
      validations: {
        users: 'Unlimited Users',
        storage: '500 GB Cloud Storage',
        ai: 'Unlimited AI Queries'
      },
      features: [
        'Unlimited Team Users',
        '500 GB Secure Cloud Storage',
        'Unlimited AI Summaries & Chat',
        'Custom Tenant Branding & Logo',
        'Dedicated Account Manager',
        '24/7 VIP Phone & Email Support'
      ]
    }
  ];

  if (!isOpen) return null;

  const handleSubscribe = async (planName) => {
    if (planName === 'Free Trial') return;
    setError('');
    setLoadingPlan(planName);

    try {
      const isScriptLoaded = await loadRazorpayScript();
      if (!isScriptLoaded) {
        alert('Razorpay SDK failed to load. Please check your internet connection.');
        setLoadingPlan('');
        return;
      }

      // 1. Create order on backend
      const res = await fetch(`${API_BASE_URL}/api/tenant/subscription/order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planName, companySlug }),
      });
      const data = await res.json();

      if (!data.success) {
        throw new Error(data.message || 'Failed to create payment order.');
      }

      const { key, order, amount } = data;

      // 2. Open Razorpay Checkout Modal
      const options = {
        key: key || 'rzp_test_mockkey123',
        amount: amount,
        currency: 'INR',
        name: 'DMS Subscription',
        description: `${planName} Plan Membership Upgrade`,
        order_id: order.id,
        handler: async function (response) {
          try {
            // 3. Verify Payment Signature
            const verifyRes = await fetch(`${API_BASE_URL}/api/tenant/subscription/verify`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id || order.id,
                razorpay_payment_id: response.razorpay_payment_id || `pay_mock_${Date.now()}`,
                razorpay_signature: response.razorpay_signature || '',
                companySlug,
                planName
              })
            });
            const verifyData = await verifyRes.json();

            if (verifyData.success) {
              alert(`🎉 Payment Successful! You are now subscribed to the ${planName} Plan.`);
              window.location.reload();
            } else {
              setError(verifyData.message || 'Payment verification failed.');
            }
          } catch (err) {
            console.error(err);
            setError('Payment verification error.');
          } finally {
            setLoadingPlan('');
          }
        },
        modal: {
          ondismiss: function () {
            setLoadingPlan('');
          }
        },
        prefill: {
          name: 'Workspace Admin',
          email: 'admin@company.com'
        },
        theme: {
          color: '#2563eb'
        }
      };

      const razorpayInstance = new window.Razorpay(options);

      // Fallback for test / sandbox mock execution
      razorpayInstance.on('payment.failed', function (response) {
        alert(`Payment failed: ${response.error.description}`);
        setLoadingPlan('');
      });

      razorpayInstance.open();
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to initialize payment.');
      setLoadingPlan('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-md p-4 overflow-y-auto">
      <div className="relative w-full max-w-7xl rounded-3xl border border-white/80 bg-white p-6 sm:p-8 shadow-2xl transition-all">

        {/* Close Button */}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute right-5 top-5 rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition cursor-pointer"
          >
            <X size={20} />
          </button>
        )}

        {/* Current Subscription Active Banner */}
        <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 text-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-md">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-400/30 flex items-center justify-center font-bold">
              <Sparkles size={20} />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Current Selected Plan</p>
              <h4 className="text-base font-extrabold text-white flex items-center gap-2">
                <span>{activePlanName === 'Trial' ? '7-Day Free Trial' : `${activePlanName} Plan`}</span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Active
                </span>
              </h4>
            </div>
          </div>

          <div className="flex items-baseline gap-2 bg-slate-800/80 px-4 py-2 rounded-xl border border-slate-700/60">
            <span className="text-2xl font-black text-amber-400">{subDetails.daysLeft}</span>
            <span className="text-xs font-medium text-slate-300">Days Remaining</span>
          </div>
        </div>

        {/* Header */}
        <div className="text-center max-w-xl mx-auto mb-8">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-bold text-blue-700 uppercase tracking-wider mb-3">
            <ShieldCheck size={14} /> Membership Tier Showcase
          </span>
          <h2 className="text-3xl font-black tracking-tight text-slate-900">
            Choose the Best Plan for Your Company
          </h2>
          <p className="mt-2 text-sm text-slate-500 font-medium">
            Select a plan to launch Razorpay checkout. Each plan enforces custom user, storage, and AI validation limits.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-sm font-semibold text-red-700 text-center">
            {error}
          </div>
        )}

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => {
            const Icon = plan.icon;
            const isCurrent = currentPlan === plan.name || (plan.name === 'Free Trial' && currentPlan === 'Trial');
            const isLoading = loadingPlan === plan.name;

            return (
              <div
                key={plan.name}
                className={`relative flex flex-col justify-between rounded-2xl border p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${plan.popular
                  ? 'border-purple-300 bg-gradient-to-b from-purple-50/40 via-white to-white shadow-md'
                  : 'border-slate-200 bg-white shadow-sm'
                  }`}
              >
                {plan.popular && (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-purple-600 px-4 py-1 text-[11px] font-black tracking-wider uppercase text-white shadow-md">
                    Most Popular
                  </span>
                )}

                <div>
                  <div className="flex items-center justify-between">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border text-xs font-bold ${plan.badgeBg}`}>
                      <Icon size={14} className={plan.iconColor} /> {plan.name}
                    </span>
                    {isCurrent && (
                      <span className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                        Active Plan
                      </span>
                    )}
                  </div>

                  <div className="mt-5">
                    <span className="text-3xl font-black text-slate-950">₹{plan.price}</span>
                    <span className="text-xs font-semibold text-slate-500 ml-1.5">/ {plan.billing}</span>
                  </div>

                  {/* Plan Validation Limits Showcase */}
                  <div className="my-4 p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5 text-[11px] font-semibold text-slate-700">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-medium">Team Limit:</span>
                      <span className="text-slate-900 font-bold">{plan.validations.users}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-medium">Storage Limit:</span>
                      <span className="text-slate-900 font-bold">{plan.validations.storage}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-medium">AI Limit:</span>
                      <span className="text-slate-900 font-bold">{plan.validations.ai}</span>
                    </div>
                  </div>

                  <hr className="my-4 border-slate-100" />

                  <ul className="space-y-3 text-xs font-medium text-slate-700">
                    {plan.features.map((feat) => (
                      <li key={feat} className="flex items-center gap-2.5">
                        <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                          <Check size={11} strokeWidth={3} />
                        </span>
                        <span>{feat}</span>
                      </li>
                    ))}
                    {plan.notIncluded?.map((item) => (
                      <li key={item} className="flex items-center gap-2.5 text-slate-400 line-through">
                        <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                          ×
                        </span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-8">
                  <button
                    onClick={() => handleSubscribe(plan.name)}
                    disabled={isLoading || isCurrent || plan.name === 'Free Trial'}
                    className={`w-full py-3 px-4 rounded-xl font-bold text-xs tracking-wide transition-all cursor-pointer flex items-center justify-center gap-2 ${plan.buttonStyle} disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>Initializing Razorpay...</span>
                      </>
                    ) : isCurrent ? (
                      'Current Active Plan'
                    ) : plan.name === 'Free Trial' ? (
                      'Trial Period Ended / Unavailable'
                    ) : (
                      `Upgrade to ${plan.name}`
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Centered Go to Admin Dashboard button */}
        {isAdmin && (
          <div className="mt-8 flex justify-center">
            <button
              onClick={() => navigate(`/${companySlug}/admin/dashboard`)}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 transition cursor-pointer shadow-md"
            >
              <ShieldCheck size={18} />
              Go to Admin Dashboard
            </button>
          </div>
        )}

        <div className="mt-8 text-center border-t border-slate-100 pt-5">
          <p className="text-xs text-slate-500 font-medium flex items-center justify-center gap-2">
            <ShieldCheck size={16} className="text-emerald-600" />
            <span>Secure 256-bit encrypted checkout powered by Razorpay API</span>
          </p>
        </div>

      </div>
    </div>
  );
}
