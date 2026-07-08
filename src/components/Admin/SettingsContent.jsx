// src/components/SettingsContent.jsx

import { useState } from "react";
import {
  Building2,
  Shield,
  Palette,
  Upload,
} from "lucide-react";

export default function SettingsContent() {
  const [idleLogout, setIdleLogout] = useState(true);

  const [darkMode, setDarkMode] = useState(false);

  const [primaryColor, setPrimaryColor] =
    useState("#072B86");

  const [secondaryColor, setSecondaryColor] =
    useState("#14B8A6");

  return (
    <div className="flex-1 overflow-y-auto bg-[#F5F7FB] p-4 sm:p-6 lg:p-8">
      {/* ======================================== */}
      {/* HEADER */}
      {/* ======================================== */}

      <div className="flex flex-col gap-4 border-b border-gray-200 pb-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-4xl font-bold text-[#0B2C87]">
            Settings
          </h1>

          <p className="text-gray-500 mt-2">
            Configure organization preferences and
            security policies.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <button className="px-6 py-3 bg-white border border-gray-300 rounded-xl hover:bg-gray-50">
            Discard Changes
          </button>

          <button className="px-6 py-3 bg-[#0B2C87] text-white rounded-xl hover:bg-[#082064]">
            Save Settings
          </button>
        </div>
      </div>

      {/* ======================================== */}
      {/* GENERAL SETTINGS */}
      {/* ======================================== */}

      <div className="bg-white rounded-3xl border border-gray-200 p-8 mt-8 shadow-sm">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
            <Building2 className="text-[#0B2C87]" />
          </div>

          <div>
            <h2 className="text-2xl font-semibold">
              General Settings
            </h2>

            <p className="text-gray-500 text-sm">
              Configure organization information.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Organization Name */}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Organization Name
            </label>

            <input
              type="text"
              defaultValue="Nexus Global Corp"
              className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Organization ID */}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Organization ID
            </label>

            <input
              type="text"
              defaultValue="TEN-2026-001"
              disabled
              className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-gray-100 text-gray-500"
            />
          </div>

          {/* Tenant Domain */}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tenant Domain
            </label>

            <input
              type="text"
              defaultValue="nexus.global.com"
              className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Timezone */}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Timezone
            </label>

            <select className="w-full border border-gray-300 rounded-xl px-4 py-3">
              <option>Asia/Kolkata</option>
              <option>UTC</option>
              <option>America/New_York</option>
            </select>
          </div>

          {/* Language */}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Language
            </label>

            <select className="w-full border border-gray-300 rounded-xl px-4 py-3">
              <option>English</option>
              <option>Hindi</option>
            </select>
          </div>

          {/* Date Format */}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date Format
            </label>

            <select className="w-full border border-gray-300 rounded-xl px-4 py-3">
              <option>DD/MM/YYYY</option>
              <option>MM/DD/YYYY</option>
              <option>YYYY-MM-DD</option>
            </select>
          </div>

          {/* Currency */}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Currency
            </label>

            <select className="w-full border border-gray-300 rounded-xl px-4 py-3">
              <option>INR</option>
              <option>USD</option>
              <option>EUR</option>
            </select>
          </div>
        </div>
      </div>

      {/* ======================================== */}
      {/* SECURITY SETTINGS */}
      {/* ======================================== */}

      <div className="bg-white rounded-3xl border border-gray-200 p-8 mt-8 shadow-sm">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
            <Shield className="text-red-600" />
          </div>

          <div>
            <h2 className="text-2xl font-semibold">
              Security Settings
            </h2>

            <p className="text-gray-500 text-sm">
              Configure session and password policies.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Session Timeout */}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Session Timeout
            </label>

            <select className="w-full border border-gray-300 rounded-xl px-4 py-3">
              <option>30 Minutes</option>
              <option>1 Hour</option>
              <option>2 Hours</option>
            </select>
          </div>

          {/* Password Expiry */}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password Expiry
            </label>

            <select className="w-full border border-gray-300 rounded-xl px-4 py-3">
              <option>90 Days</option>
              <option>60 Days</option>
              <option>30 Days</option>
            </select>
          </div>

          {/* Login Attempts */}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Maximum Login Attempts
            </label>

            <input
              type="number"
              defaultValue={5}
              className="w-full border border-gray-300 rounded-xl px-4 py-3"
            />
          </div>

          {/* Lock Duration */}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Account Lock Duration
            </label>

            <select className="w-full border border-gray-300 rounded-xl px-4 py-3">
              <option>15 Minutes</option>
              <option>30 Minutes</option>
              <option>1 Hour</option>
            </select>
          </div>
        </div>

        {/* Idle Logout */}

        <div className="mt-8 border rounded-2xl p-5 flex items-center justify-between">
          <div>
            <h3 className="font-semibold">
              Enable Idle Logout
            </h3>

            <p className="text-sm text-gray-500 mt-1">
              Automatically log out inactive users.
            </p>
          </div>

          <button
            onClick={() =>
              setIdleLogout(!idleLogout)
            }
            className={`w-14 h-8 rounded-full relative transition
            ${
              idleLogout
                ? "bg-[#0B2C87]"
                : "bg-gray-300"
            }`}
          >
            <div
              className={`absolute top-1 w-6 h-6 bg-white rounded-full transition
              ${
                idleLogout
                  ? "right-1"
                  : "left-1"
              }`}
            />
          </button>
        </div>
      </div>

      {/* PART 2 CONTINUES BELOW */}
            {/* ======================================== */}
      {/* BRANDING SETTINGS */}
      {/* ======================================== */}

      <div className="bg-white rounded-3xl border border-gray-200 p-8 mt-8 shadow-sm">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
            <Palette className="text-purple-600" />
          </div>

          <div>
            <h2 className="text-2xl font-semibold">
              Branding Settings
            </h2>

            <p className="text-gray-500 text-sm">
              Customize workspace branding and appearance.
            </p>
          </div>
        </div>

        {/* Upload Logo */}

        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Organization Logo
          </label>

          <div className="border-2 border-dashed border-gray-300 rounded-2xl p-6 flex items-center gap-5 hover:bg-gray-50 cursor-pointer transition">
            <div className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center">
              <Upload className="text-gray-500" />
            </div>

            <div>
              <h3 className="font-semibold text-[#0B2C87]">
                Upload Logo
              </h3>

              <p className="text-sm text-gray-500">
                SVG, PNG or JPG (Max 2MB)
              </p>
            </div>
          </div>
        </div>

        {/* Color Settings */}

        <div className="grid grid-cols-2 gap-8">
          {/* Primary Color */}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Primary Color
            </label>

            <div className="flex items-center gap-4">
              <input
                type="color"
                value={primaryColor}
                onChange={(e) =>
                  setPrimaryColor(e.target.value)
                }
                className="w-14 h-14 border rounded-xl cursor-pointer"
              />

              <input
                type="text"
                value={primaryColor}
                onChange={(e) =>
                  setPrimaryColor(e.target.value)
                }
                className="border border-gray-300 rounded-xl px-4 py-3 w-full"
              />
            </div>
          </div>

          {/* Secondary Color */}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Secondary Color
            </label>

            <div className="flex items-center gap-4">
              <input
                type="color"
                value={secondaryColor}
                onChange={(e) =>
                  setSecondaryColor(e.target.value)
                }
                className="w-14 h-14 border rounded-xl cursor-pointer"
              />

              <input
                type="text"
                value={secondaryColor}
                onChange={(e) =>
                  setSecondaryColor(e.target.value)
                }
                className="border border-gray-300 rounded-xl px-4 py-3 w-full"
              />
            </div>
          </div>
        </div>

        {/* Dark Mode */}

        <div className="mt-8 border rounded-2xl p-5 flex items-center justify-between">
          <div>
            <h3 className="font-semibold">
              Dark Mode
            </h3>

            <p className="text-sm text-gray-500 mt-1">
              Enable dark appearance for the admin workspace.
            </p>
          </div>

          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`w-14 h-8 rounded-full relative transition
              ${
                darkMode
                  ? "bg-[#0B2C87]"
                  : "bg-gray-300"
              }`}
          >
            <div
              className={`absolute top-1 w-6 h-6 bg-white rounded-full transition
                ${
                  darkMode
                    ? "right-1"
                    : "left-1"
                }`}
            />
          </button>
        </div>
      </div>
       </div>
  );
}

