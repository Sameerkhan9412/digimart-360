import { getAdminAISettings } from "src/app/actions/settingsActions"
import AISettingsForm from "src/components/dashboard/AISettingsForm"

export default async function AdminSettingsPage() {
  const settings = await getAdminAISettings()

  return (
    <div className="flex flex-col gap-6">
      
      {/* Title */}
      <div className="border-b border-slate-100 pb-5 shrink-0">
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">AI Configurations</h1>
        <p className="text-slate-400 text-xs sm:text-sm mt-1">
          Configure OpenAI LLM parameters to unlock automatic lead categorization, translation scoring, and catalog optimization.
        </p>
      </div>

      <AISettingsForm
        initialApiKey={settings.apiKey || ""}
        initialModel={settings.model || "gpt-4o-mini"}
        hasKey={settings.hasKey || false}
      />

    </div>
  )
}
