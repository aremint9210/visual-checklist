import React, { useState } from 'react';
import { 
  MessageSquareHeart, 
  ThumbsUp, 
  Star, 
  Send, 
  Mic, 
  User, 
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { FeedbackRecord } from '../types/inspection';

interface TeamFeedbackViewProps {
  feedbacks: FeedbackRecord[];
  onAddFeedback: (feedback: {
    author: string;
    role: string;
    category: string;
    rating: number;
    message: string;
  }) => Promise<void>;
  onUpvoteFeedback: (id: string) => Promise<void>;
  isListening: boolean;
  onToggleVoice: (field: 'feedback') => void;
}

export const TeamFeedbackView: React.FC<TeamFeedbackViewProps> = ({
  feedbacks,
  onAddFeedback,
  onUpvoteFeedback,
  isListening,
  onToggleVoice,
}) => {
  const [author, setAuthor] = useState('');
  const [role, setRole] = useState('Technician');
  const [category, setCategory] = useState('General Suggestion');
  const [rating, setRating] = useState(5);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsSubmitting(true);
    try {
      await onAddFeedback({
        author: author.trim() || 'Team Member',
        role,
        category,
        rating,
        message: message.trim(),
      });
      setMessage('');
      setSubmittedSuccess(true);
      setTimeout(() => setSubmittedSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to submit feedback:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Card */}
      <div className="rounded-2xl border border-white/[0.08] bg-slate-950/60 p-5 backdrop-blur-xl">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
            <MessageSquareHeart className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Team Feedback & Improvement Hub</h2>
            <p className="text-xs text-slate-400">
              Share suggestions, defect tag requests, or field feedback to continuously improve our CBM workflows.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Form Column */}
        <div className="rounded-2xl border border-white/[0.08] bg-slate-950/60 p-5 backdrop-blur-xl h-fit">
          <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-emerald-400" />
            <span>Submit Team Idea</span>
          </h3>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Your Name</label>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="e.g. Aremi / Inspector"
                className="w-full rounded-xl border border-white/[0.1] bg-slate-900 px-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-emerald-500/50"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full rounded-xl border border-white/[0.1] bg-slate-900 px-2.5 py-2 text-xs text-white outline-none"
                >
                  <option value="Technician">Technician</option>
                  <option value="Inspector">Inspector</option>
                  <option value="CBM Lead">CBM Lead</option>
                  <option value="Engineer">Engineer</option>
                  <option value="Supervisor">Supervisor</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-xl border border-white/[0.1] bg-slate-900 px-2.5 py-2 text-xs text-white outline-none"
                >
                  <option value="General Suggestion">General Idea</option>
                  <option value="Checklist Item Request">New Item</option>
                  <option value="Mobile UX / UI">Mobile UX</option>
                  <option value="CBM Reliability">CBM Metric</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Rating</label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 text-slate-500 hover:text-amber-400"
                  >
                    <Star
                      className={`h-5 w-5 ${
                        star <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-600'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-300">Suggestion Message</label>
                <button
                  type="button"
                  onClick={() => onToggleVoice('feedback')}
                  className={`text-xs flex items-center gap-1 ${
                    isListening ? 'text-rose-400 animate-pulse font-bold' : 'text-emerald-400 hover:underline'
                  }`}
                >
                  <Mic className="h-3 w-3" />
                  <span>{isListening ? 'Listening...' : 'Voice Dictate'}</span>
                </button>
              </div>
              <textarea
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Share your suggestions, additional tags needed, or UX feedback..."
                className="w-full rounded-xl border border-white/[0.1] bg-slate-900 px-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-emerald-500/50"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="touch-press w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white hover:bg-emerald-500 shadow-glow-pass"
            >
              <Send className="h-3.5 w-3.5" />
              <span>{isSubmitting ? 'Posting...' : 'Post Feedback'}</span>
            </button>

            {submittedSuccess && (
              <div className="text-center text-xs font-bold text-emerald-400 animate-fade-in flex items-center justify-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Thank you! Your idea has been posted.</span>
              </div>
            )}
          </form>
        </div>

        {/* Feedback List Column */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Community Ideas & Suggestions ({feedbacks.length})
            </span>
          </div>

          {feedbacks.length === 0 ? (
            <div className="rounded-2xl border border-white/[0.08] bg-slate-950/40 p-8 text-center text-slate-400 text-xs">
              No team feedback posted yet. Be the first to share your thoughts!
            </div>
          ) : (
            feedbacks.map((fb) => (
              <div
                key={fb.id}
                className="rounded-2xl border border-white/[0.08] bg-slate-950/50 p-4 space-y-2.5 hover:border-white/[0.14] transition-all shadow-sm"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-800 text-xs font-bold text-slate-300">
                      {fb.author.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-white">{fb.author}</span>
                        <span className="rounded bg-slate-800 px-1.5 py-0.2 text-[10px] text-slate-400">
                          {fb.role}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500">{fb.createdAt}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3 w-3 ${
                          i < fb.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-700'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <p className="text-xs text-slate-200 leading-relaxed pl-1">
                  {fb.message}
                </p>

                <div className="flex items-center justify-between pt-1 border-t border-white/[0.04] text-[11px] text-slate-400">
                  <span className="text-emerald-400 font-semibold">{fb.category}</span>
                  <button
                    type="button"
                    onClick={() => onUpvoteFeedback(fb.id)}
                    className="touch-press flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-slate-900 px-2.5 py-1 text-slate-300 hover:bg-emerald-500/10 hover:border-emerald-500/30 hover:text-emerald-300 transition-all"
                  >
                    <ThumbsUp className="h-3 w-3" />
                    <span>Upvote ({fb.upvotes || 0})</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

      </div>

    </div>
  );
};
