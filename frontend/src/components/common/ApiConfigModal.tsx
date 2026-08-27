import React, { useState } from 'react';
import { Server, CheckCircle2, XCircle, RefreshCw, Globe } from 'lucide-react';
import { useApi } from '../../context/ApiContext';
import { Button } from './Button';
import { Input } from './Input';

interface ApiConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApiConfigModal: React.FC<ApiConfigModalProps> = ({ isOpen, onClose }) => {
  const { apiUrl, updateApiUrl, resetApiUrl, isBackendConnected, isChecking, checkConnection } = useApi();
  const [urlInput, setUrlInput] = useState<string>(apiUrl);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    updateApiUrl(urlInput);
    setSaveSuccess(true);
    await checkConnection();
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleReset = () => {
    resetApiUrl();
    setUrlInput('http://localhost:8080');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-5 text-slate-100">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400 border border-emerald-500/20">
              <Server className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-100">Backend API Settings</h3>
              <p className="text-xs text-slate-400">Configure Go Gin server endpoint</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors text-sm"
          >
            ✕
          </button>
        </div>

        {/* Server Health Status */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Connection Status</span>
            <div className="flex items-center gap-1.5">
              {isChecking ? (
                <span className="flex items-center gap-1 text-amber-400 font-medium">
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  Testing...
                </span>
              ) : isBackendConnected ? (
                <span className="flex items-center gap-1 text-emerald-400 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Backend Online
                </span>
              ) : (
                <span className="flex items-center gap-1 text-rose-400 font-medium">
                  <XCircle className="w-3.5 h-3.5 text-rose-400" />
                  Backend Offline
                </span>
              )}
            </div>
          </div>

          <div className="text-xs text-slate-300 font-mono bg-slate-900 px-2.5 py-1.5 rounded-lg border border-slate-800/80 truncate">
            {apiUrl}
          </div>

          <div className="flex justify-end pt-1">
            <button
              onClick={() => checkConnection()}
              disabled={isChecking}
              className="text-xs text-slate-400 hover:text-emerald-400 flex items-center gap-1 transition-colors"
            >
              <RefreshCw className={`w-3 h-3 ${isChecking ? 'animate-spin' : ''}`} />
              Ping Server
            </button>
          </div>
        </div>

        {/* Change Base URL Form */}
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Server Base URL"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="http://localhost:8080"
            hint="Default: http://localhost:8080"
            leftIcon={<Globe className="w-4 h-4 text-slate-500" />}
          />

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={handleReset}
              className="text-xs text-slate-400 hover:text-slate-200 underline"
            >
              Reset to Default
            </button>

            <div className="flex items-center gap-2">
              <Button type="button" variant="ghost" size="sm" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" isLoading={isChecking}>
                {saveSuccess ? 'Saved' : 'Save'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
