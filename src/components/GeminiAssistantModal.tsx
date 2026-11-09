import React, { useState } from 'react';
import {
  Sparkles,
  Send,
  X,
  Bot,
  User,
  Shield,
  Loader2,
  HelpCircle,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { ApiService } from '../services/api';
import { Zone, Alert } from '../types';

interface GeminiAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  zones: Zone[];
  alerts: Alert[];
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  source?: string;
  timestamp: string;
}

export const GeminiAssistantModal: React.FC<GeminiAssistantModalProps> = ({
  isOpen,
  onClose,
  zones,
  alerts
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content:
        'Namaste! I am the CrowdGuard Gemini Intelligence Advisor for Godavari Pushkaralu 2027. I am actively grounded in the surveillance grid across all 8 Rajamahendravaram sectors. How can I assist your command shift?',
      timestamp: 'Just now'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const quickQuestions = [
    'Which zone currently needs immediate attention and why?',
    'Why was the Pushkar Ghat congestion alert triggered?',
    'Compare crowd levels between Kotilingala Ghat and Pushkar Ghat',
    'Summarize current monitoring data for executive shift handover',
    'What route diversions should we activate right now?'
  ];

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || input;
    if (!textToSend.trim() || loading) return;

    const userMsg: Message = {
      role: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!queryText) setInput('');
    setLoading(true);

    try {
      const res = await ApiService.sendChatMessage(textToSend);
      const assistantMsg: Message = {
        role: 'assistant',
        content: res.reply,
        source: res.source,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            'Unable to contact server-side Gemini intelligence engine. Operational telemetry remains active in local monitoring state.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl h-[640px] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold tracking-tight">CrowdGuard Intelligence Advisor</h3>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-900/80 text-cyan-300 border border-cyan-700">
                  GEMINI 3.8 FLASH
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Grounded Operational AI for RMC & Police Task Force
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Context Banner */}
        <div className="px-6 py-2 bg-slate-50 border-b border-slate-200 text-xs text-slate-600 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Live Grid: 8 Monitored Zones · {zones.reduce((a, b) => a + b.currentCount, 0).toLocaleString()} Total Pilgrims</span>
          </div>
          <span className="text-[10px] text-slate-400 font-medium">Verified Operational Telemetry</span>
        </div>

        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.role === 'assistant' && (
                <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[82%] rounded-2xl px-4 py-3 text-xs leading-relaxed shadow-2xs ${
                  m.role === 'user'
                    ? 'bg-blue-600 text-white rounded-br-xs'
                    : 'bg-white text-slate-800 border border-slate-200 rounded-bl-xs'
                }`}
              >
                <div className="whitespace-pre-wrap">{m.content}</div>

                <div
                  className={`mt-2 flex items-center justify-between text-[10px] ${
                    m.role === 'user' ? 'text-blue-200' : 'text-slate-400'
                  }`}
                >
                  <span>{m.timestamp}</span>
                  {m.source && (
                    <span className="font-mono text-[9px] text-cyan-600">
                      via {m.source}
                    </span>
                  )}
                </div>
              </div>

              {m.role === 'user' && (
                <div className="w-7 h-7 rounded-full bg-slate-700 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-3 items-center text-xs text-slate-500 pl-2">
              <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
              <span>Analyzing live sector telemetry with Gemini 3.8 Flash...</span>
            </div>
          )}
        </div>

        {/* Quick Suggestion Pills */}
        <div className="px-6 py-2.5 bg-white border-t border-slate-100 overflow-x-auto flex items-center gap-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
            Suggested:
          </span>
          {quickQuestions.slice(0, 3).map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              className="text-[11px] text-slate-700 hover:text-blue-700 bg-slate-100 hover:bg-blue-50 px-2.5 py-1 rounded-md border border-slate-200 whitespace-nowrap shrink-0 transition-colors"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-white border-t border-slate-200 flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask Gemini about crowd density, choke points, or tactical directives..."
            className="flex-1 bg-slate-100 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
          />

          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || loading}
            className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white shadow-xs transition-colors shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
