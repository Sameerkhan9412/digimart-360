"use client"

import React, { useState } from "react"
import { useToast } from "src/components/ui/Toast"
import { saveAdminAISettings } from "src/app/actions/settingsActions"
import { Eye, EyeOff, Key, Sparkles, AlertTriangle } from "lucide-react"

interface AISettingsFormProps {
  initialApiKey: string
  initialModel: string
  hasKey: boolean
}

export default function AISettingsForm({
  initialApiKey,
  initialModel,
  hasKey,
}: AISettingsFormProps) {
  const { toast } = useToast()
  const [showKey, setShowKey] = useState(false)
  const [loading, setLoading] = useState(false)
  const [activeKey, setActiveKey] = useState(initialApiKey)
  const [model, setModel] = useState(initialModel)
  const [activeHasKey, setActiveHasKey] = useState(hasKey)

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const data = {
      apiKey: formData.get("apiKey") as string,
      model: model,
    }

    try {
      const response = await saveAdminAISettings(data)
      if (response.success) {
        toast(response.message || "AI Configurations updated successfully.", "success")
        if (data.apiKey) {
          setActiveHasKey(true)
          // Mask entered key locally
          const rawKey = data.apiKey
          if (!rawKey.includes("...")) {
            setActiveKey(rawKey.length > 8 ? `${rawKey.substring(0, 4)}...${rawKey.substring(rawKey.length - 4)}` : rawKey)
          }
        }
      } else {
        toast(response.error || "Failed to update configurations.", "error")
      }
    } catch (err) {
      console.error(err)
      toast("Error saving settings.", "error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      
      {/* Warning indicator if key is missing */}
      {!activeHasKey && (
        <div className="p-4 bg-amber-50/50 border border-amber-100 rounded-2xl flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <h5 className="font-extrabold text-amber-800 text-xs sm:text-sm">OpenAI Key Required</h5>
            <p className="text-amber-700/80 text-[10px] sm:text-xs mt-1 leading-relaxed">
              OpenAI API key is currently not configured. All AI features (including catalog description generators, automated CRM lead scoring, and text tags recommendations) are disabled.
            </p>
          </div>
        </div>
      )}

      <div className="bg-white border border-slate-100 rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="flex items-center gap-2 mb-6 border-b border-slate-50 pb-4">
          <Sparkles className="w-5 h-5 text-primary" />
          <div>
            <h4 className="font-extrabold text-slate-800 text-sm sm:text-base">AI Engine Settings</h4>
            <p className="text-[10px] text-slate-400 mt-0.5">Control generative workflows across DIGIMART360.</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="flex flex-col gap-5 max-w-xl">
          
          {/* API Key */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">OpenAI API Key</label>
            <div className="relative">
              <input
                type={showKey ? "text" : "password"}
                name="apiKey"
                defaultValue={activeKey}
                placeholder={activeHasKey ? "••••••••••••••••••••" : "sk-proj-..."}
                className="w-full text-xs font-semibold pl-8 pr-10 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition bg-slate-50/20"
              />
              <Key className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Model selection */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Model Selection</label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-200 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition bg-slate-50/20"
            >
              <option value="gpt-4o-mini">gpt-4o-mini (Recommended - Fast & Cost-Effective)</option>
              <option value="gpt-4o">gpt-4o (High Accuracy Reasoning)</option>
              <option value="gpt-3.5-turbo">gpt-3.5-turbo (Legacy)</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-extrabold tracking-wide transition shadow-lg shadow-primary/20 flex items-center justify-center gap-1.5 self-start mt-2 w-full sm:w-auto"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              "Save Configurations"
            )}
          </button>

        </form>
      </div>

    </div>
  )
}
