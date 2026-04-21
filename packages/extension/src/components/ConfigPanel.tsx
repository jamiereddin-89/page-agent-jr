import {
	Copy,
	CornerUpLeft,
	ExternalLink,
	Eye,
	EyeOff,
	FoldVertical,
	HatGlasses,
	Loader2,
	RefreshCw,
	Scale,
	UnfoldVertical,
	Wifi,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { siGithub } from 'simple-icons'

import { DEMO_BASE_URL, DEMO_MODEL, isTestingEndpoint } from '@/agent/constants'
import { applyTheme } from '@/agent/useAgent'
import type { ExtConfig, LanguagePreference, ThemePreference } from '@/agent/useAgent'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'

type LLMProvider =
	| 'openai'
	| 'anthropic'
	| 'aliyun'
	| 'ollama'
	| 'kilocode'
	| 'puter'
	| 'pollinations'
	| 'opencode'

interface ProviderConfig {
	id: LLMProvider
	name: string
	baseURL: string
	hasTestButton: boolean
}

const PROVIDERS: ProviderConfig[] = [
	{ id: 'openai', name: 'OpenAI', baseURL: 'https://api.openai.com/v1', hasTestButton: false },
	{
		id: 'anthropic',
		name: 'Anthropic',
		baseURL: 'https://api.anthropic.com',
		hasTestButton: false,
	},
	{
		id: 'aliyun',
		name: '阿里云/通义千问',
		baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
		hasTestButton: false,
	},
	{ id: 'ollama', name: 'Ollama', baseURL: 'http://localhost:11434/v1', hasTestButton: false },
	{
		id: 'kilocode',
		name: 'KiloCode',
		baseURL: 'https://api.kilo.ai/api/gateway',
		hasTestButton: true,
	},
	{
		id: 'puter',
		name: 'Puter',
		baseURL: 'https://api.puter.com/puterai/openai/v1',
		hasTestButton: true,
	},
	{
		id: 'pollinations',
		name: 'Pollinations',
		baseURL: 'https://gen.pollinations.ai/v1',
		hasTestButton: true,
	},
	{ id: 'opencode', name: 'Opencode', baseURL: 'https://opencode.ai/zen/v1', hasTestButton: true },
]

const DEFAULT_PROVIDER = PROVIDERS[0]

function getProviderByBaseURL(baseURL: string): ProviderConfig {
	return PROVIDERS.find((p) => p.baseURL === baseURL) || PROVIDERS[0]
}

function detectProvider(baseURL: string): LLMProvider {
	const provider = getProviderByBaseURL(baseURL)
	return provider.id
}

interface ConfigPanelProps {
	config: ExtConfig | null
	onSave: (config: ExtConfig) => Promise<void>
	onClose: () => void
}

export function ConfigPanel({ config, onSave, onClose }: ConfigPanelProps) {
	const [baseURL, setBaseURL] = useState(config?.baseURL || DEMO_BASE_URL)
	const [model, setModel] = useState(config?.model || DEMO_MODEL)
	const [apiKey, setApiKey] = useState(config?.apiKey)
	const [language, setLanguage] = useState<LanguagePreference>(config?.language)
	const [maxSteps, setMaxSteps] = useState(config?.maxSteps)
	const [systemInstruction, setSystemInstruction] = useState(config?.systemInstruction ?? '')
	const [experimentalLlmsTxt, setExperimentalLlmsTxt] = useState(
		config?.experimentalLlmsTxt ?? false
	)
	const [experimentalIncludeAllTabs, setExperimentalIncludeAllTabs] = useState(
		config?.experimentalIncludeAllTabs ?? false
	)
	const [disableNamedToolChoice, setDisableNamedToolChoice] = useState(
		config?.disableNamedToolChoice ?? false
	)
	const [theme, setTheme] = useState<ThemePreference>(config?.theme ?? 'system')
	const [advancedOpen, setAdvancedOpen] = useState(false)
	const [saving, setSaving] = useState(false)
	const [userAuthToken, setUserAuthToken] = useState('')
	const [copied, setCopied] = useState(false)
	const [showToken, setShowToken] = useState(false)
	const [showApiKey, setShowApiKey] = useState(false)
	const [selectedProvider, setSelectedProvider] = useState<LLMProvider>(() =>
		detectProvider(config?.baseURL || DEMO_BASE_URL)
	)
	const [testing, setTesting] = useState(false)
	const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null)
	const [resetDropdownOpen, setResetDropdownOpen] = useState(false)

	const [prevConfig, setPrevConfig] = useState(config)
	if (prevConfig !== config) {
		setPrevConfig(config)
		setBaseURL(config?.baseURL || DEMO_BASE_URL)
		setModel(config?.model || DEMO_MODEL)
		setApiKey(config?.apiKey)
		setLanguage(config?.language)
		setMaxSteps(config?.maxSteps)
		setSystemInstruction(config?.systemInstruction ?? '')
		setExperimentalLlmsTxt(config?.experimentalLlmsTxt ?? false)
		setExperimentalIncludeAllTabs(config?.experimentalIncludeAllTabs ?? false)
		setDisableNamedToolChoice(config?.disableNamedToolChoice ?? false)
		setTheme(config?.theme ?? 'system')
		setSelectedProvider(detectProvider(config?.baseURL || DEMO_BASE_URL))
		setTestResult(null)
	}

	// Poll for user auth token every second until found
	useEffect(() => {
		let interval: NodeJS.Timeout | null = null

		const fetchToken = async () => {
			const result = await chrome.storage.local.get('PageAgentExtUserAuthToken')
			const token = result.PageAgentExtUserAuthToken
			if (typeof token === 'string' && token) {
				setUserAuthToken(token)
				if (interval) {
					clearInterval(interval)
					interval = null
				}
			}
		}

		fetchToken()
		interval = setInterval(fetchToken, 1000)

		return () => {
			if (interval) clearInterval(interval)
		}
	}, [])

	useEffect(() => {
		applyTheme(config?.theme ?? 'system')
	}, [config?.theme])

	const handleCopyToken = async () => {
		if (userAuthToken) {
			await navigator.clipboard.writeText(userAuthToken)
			setCopied(true)
			setTimeout(() => setCopied(false), 2000)
		}
	}

	const handleSave = async () => {
		setSaving(true)
		try {
			await onSave({
				apiKey,
				baseURL,
				model,
				language,
				theme,
				maxSteps: maxSteps || undefined,
				systemInstruction: systemInstruction || undefined,
				experimentalLlmsTxt,
				experimentalIncludeAllTabs,
				disableNamedToolChoice,
			})
			applyTheme(theme)
		} finally {
			setSaving(false)
		}
	}

	const handleProviderChange = (providerId: LLMProvider) => {
		setSelectedProvider(providerId)
		const provider = PROVIDERS.find((p) => p.id === providerId)
		if (provider) {
			setBaseURL(provider.baseURL)
		}
		setTestResult(null)
	}

	const handleTestConnection = async () => {
		setTesting(true)
		setTestResult(null)
		try {
			const response = await fetch(`${baseURL}/models`, {
				method: 'GET',
				headers: apiKey ? { Authorization: `Bearer ${apiKey}` } : {},
			})
			if (response.ok) {
				const data = await response.json()
				const models =
					data.data
						?.slice(0, 5)
						.map((m: { id: string }) => m.id)
						.join(', ') || 'available'
				setTestResult({ success: true, message: `Models: ${models}` })
			} else {
				setTestResult({
					success: false,
					message: `Error: ${response.status} ${response.statusText}`,
				})
			}
		} catch (error) {
			setTestResult({
				success: false,
				message: `Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
			})
		} finally {
			setTesting(false)
		}
	}

	const handleResetProvider = () => {
		handleProviderChange(DEFAULT_PROVIDER.id)
		setResetDropdownOpen(false)
	}

	return (
		<div className="flex flex-col gap-4 p-4 relative">
			<div className="flex items-center justify-between">
				<h2 className="text-base font-semibold">Settings</h2>
				<Button
					variant="ghost"
					size="icon-sm"
					onClick={onClose}
					className="absolute top-2 right-3 cursor-pointer"
					aria-label="Back"
				>
					<CornerUpLeft className="size-3.5" />
				</Button>
			</div>

			{/* User Auth Token Section */}
			<div className="flex flex-col gap-1.5 p-3 bg-muted/50 rounded-md border">
				<label htmlFor="user-auth-token" className="text-xs font-medium text-muted-foreground">
					User Auth Token
				</label>
				<p className="text-[10px] text-muted-foreground mb-1">
					Give a website the ability to call this extension.
				</p>
				<div className="flex gap-2 items-center">
					<Input
						id="user-auth-token"
						readOnly
						value={
							userAuthToken
								? showToken
									? userAuthToken
									: `${userAuthToken.slice(0, 4)}${'•'.repeat(userAuthToken.length - 8)}${userAuthToken.slice(-4)}`
								: 'Loading...'
						}
						className="text-xs h-8 font-mono bg-background"
					/>
					<Button
						variant="outline"
						size="icon"
						className="h-8 w-8 shrink-0 cursor-pointer"
						onClick={() => setShowToken(!showToken)}
						disabled={!userAuthToken}
						aria-label={showToken ? 'Hide token' : 'Show token'}
						aria-pressed={showToken}
					>
						{showToken ? <EyeOff className="size-3" /> : <Eye className="size-3" />}
					</Button>
					<Button
						variant="outline"
						size="icon"
						className="h-8 w-8 shrink-0 cursor-pointer"
						onClick={handleCopyToken}
						disabled={!userAuthToken}
						aria-label="Copy token"
					>
						{copied ? <span className="">✓</span> : <Copy className="size-3" />}
					</Button>
					<span role="status" aria-live="polite" aria-atomic="true" className="sr-only">
						{copied ? 'Token copied' : ''}
					</span>
				</div>
			</div>

			{/* Hub link */}
			<a
				href="/hub.html"
				target="_blank"
				className="flex items-center justify-between p-3 rounded-md border bg-muted/50 text-xs font-medium text-muted-foreground hover:text-foreground hover:border-foreground/20 transition-colors"
			>
				Manage Squish-Browser Hub
				<ExternalLink className="size-3" />
			</a>

			{/* Theme Section */}
			<div className="flex flex-col gap-1.5">
				<label className="text-xs text-muted-foreground">Theme</label>
				<select
					value={theme ?? 'system'}
					onChange={(e) => setTheme(e.target.value as ThemePreference)}
					className="h-8 text-xs rounded-md border border-input bg-background px-2 cursor-pointer"
				>
					<option value="system">System</option>
					<option value="light">Light</option>
					<option value="dark">Dark</option>
				</select>
			</div>

			<div className="flex flex-col gap-1.5">
				<label htmlFor="provider" className="text-xs text-muted-foreground">
					Provider
				</label>
				<div className="flex gap-2 items-center">
					<select
						id="provider"
						value={selectedProvider}
						onChange={(e) => handleProviderChange(e.target.value as LLMProvider)}
						className="h-8 text-xs rounded-md border border-input bg-background px-2 cursor-pointer flex-1 min-w-0"
					>
						{PROVIDERS.map((p) => (
							<option key={p.id} value={p.id}>
								{p.name}
							</option>
						))}
					</select>
					<div className="relative">
						<Button
							variant="outline"
							size="icon"
							className="h-8 w-8 shrink-0 cursor-pointer"
							onClick={() => setResetDropdownOpen(!resetDropdownOpen)}
							title="Reset to default"
							aria-label="Reset to default provider"
						>
							<RefreshCw className="size-3" />
						</Button>
						{resetDropdownOpen && (
							<div className="absolute right-0 top-full mt-1 z-10 p-2 rounded-md border bg-popover shadow-md text-[10px] whitespace-nowrap">
								<button
									onClick={handleResetProvider}
									className="hover:bg-accent px-2 py-1 rounded cursor-pointer"
								>
									Reset to OpenAI
								</button>
							</div>
						)}
					</div>
				</div>
			</div>

			<div className="flex flex-col gap-1.5">
				<label htmlFor="base-url" className="text-xs text-muted-foreground">
					Base URL
				</label>
				<div className="flex gap-2 items-center">
					<Input
						id="base-url"
						placeholder="https://api.openai.com/v1"
						value={baseURL}
						onChange={(e) => {
							setBaseURL(e.target.value)
							setTestResult(null)
						}}
						className="text-xs h-8 flex-1"
					/>
					{PROVIDERS.find((p) => p.id === selectedProvider)?.hasTestButton && (
						<Button
							variant="outline"
							size="icon"
							className="h-8 w-8 shrink-0 cursor-pointer"
							onClick={handleTestConnection}
							disabled={testing}
							title="Test connection"
							aria-label="Test connection"
						>
							{testing ? <Loader2 className="size-3 animate-spin" /> : <Wifi className="size-3" />}
						</Button>
					)}
				</div>
				{testResult && (
					<div
						className={`text-[10px] p-1.5 rounded ${testResult.success ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600'}`}
					>
						{testResult.message}
					</div>
				)}
			</div>

			{/* Testing API notice */}
			{isTestingEndpoint(baseURL) && (
				<div className="p-2.5 rounded-md border border-amber-500/30 bg-amber-500/5 text-[11px] text-muted-foreground leading-relaxed">
					<Scale className="size-3 inline-block mr-1 -mt-0.5 text-amber-600" />
					You are using our testing API. By using this you agree to the{' '}
					<a
						href="https://github.com/alibaba/page-agent/blob/main/docs/terms-and-privacy.md"
						target="_blank"
						rel="noopener noreferrer"
						className="underline hover:text-foreground"
					>
						Terms of Use & Privacy Policy
					</a>
				</div>
			)}

			<div className="flex flex-col gap-1.5">
				<label htmlFor="model" className="text-xs text-muted-foreground">
					Model
				</label>
				<Input
					id="model"
					placeholder="gpt-5.1"
					value={model}
					onChange={(e) => setModel(e.target.value)}
					className="text-xs h-8"
				/>
			</div>

			<div className="flex flex-col gap-1.5">
				<label htmlFor="api-key" className="text-xs text-muted-foreground">
					API Key
				</label>
				<div className="flex gap-2 items-center">
					<Input
						id="api-key"
						type={showApiKey ? 'text' : 'password'}
						// placeholder="sk-..."
						value={apiKey}
						onChange={(e) => setApiKey(e.target.value)}
						className="text-xs h-8"
					/>
					<Button
						variant="outline"
						size="icon"
						className="h-8 w-8 shrink-0 cursor-pointer"
						onClick={() => setShowApiKey(!showApiKey)}
						aria-label={showApiKey ? 'Hide API key' : 'Show API key'}
					>
						{showApiKey ? <EyeOff className="size-3" /> : <Eye className="size-3" />}
					</Button>
				</div>
			</div>

			<div className="flex flex-col gap-1.5">
				<label className="text-xs text-muted-foreground">Response Language</label>
				<select
					value={language ?? ''}
					onChange={(e) => setLanguage((e.target.value || undefined) as LanguagePreference)}
					className="h-8 text-xs rounded-md border border-input bg-background px-2 cursor-pointer"
				>
					<option value="">System</option>
					<option value="en-US">English</option>
					<option value="zh-CN">中文</option>
				</select>
			</div>

			{/* Advanced Config */}
			<button
				type="button"
				onClick={() => setAdvancedOpen(!advancedOpen)}
				className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground cursor-pointer mt-1 font-bold"
			>
				Advanced
				{advancedOpen ? <FoldVertical className="size-3" /> : <UnfoldVertical className="size-3" />}
			</button>

			{advancedOpen && (
				<>
					<div className="flex flex-col gap-1.5">
						<label htmlFor="max-steps" className="text-xs text-muted-foreground">
							Max Steps
						</label>
						<Input
							id="max-steps"
							type="number"
							placeholder="40"
							min={1}
							max={200}
							value={maxSteps ?? ''}
							onChange={(e) => setMaxSteps(e.target.value ? Number(e.target.value) : undefined)}
							className="text-xs h-8 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield]"
						/>
					</div>

					<div className="flex flex-col gap-1.5">
						<label className="text-xs text-muted-foreground">System Instruction</label>
						<textarea
							placeholder="Additional instructions for the agent..."
							value={systemInstruction}
							onChange={(e) => setSystemInstruction(e.target.value)}
							rows={3}
							className="text-xs rounded-md border border-input bg-background px-3 py-2 resize-y min-h-[60px]"
						/>
					</div>

					<label className="flex items-center justify-between cursor-pointer">
						<span className="text-xs text-muted-foreground">Disable named tool_choice</span>
						<Switch checked={disableNamedToolChoice} onCheckedChange={setDisableNamedToolChoice} />
					</label>

					<label className="flex items-center justify-between cursor-pointer">
						<span className="text-xs text-muted-foreground">Experimental llms.txt support</span>
						<Switch checked={experimentalLlmsTxt} onCheckedChange={setExperimentalLlmsTxt} />
					</label>

					<label className="flex items-center justify-between cursor-pointer">
						<span className="text-xs text-muted-foreground">Experimental include all tabs</span>
						<Switch
							checked={experimentalIncludeAllTabs}
							onCheckedChange={setExperimentalIncludeAllTabs}
						/>
					</label>
				</>
			)}

			<div className="flex gap-2 mt-2">
				<Button variant="outline" onClick={onClose} className="flex-1 h-8 text-xs cursor-pointer">
					Cancel
				</Button>
				<Button
					onClick={handleSave}
					disabled={saving}
					className="flex-1 h-8 text-xs cursor-pointer"
				>
					{saving ? <Loader2 className="size-3 animate-spin" /> : 'Save'}
				</Button>
			</div>

			{/* Footer */}
			<div className="mt-4 mb-4 pt-4 border-t border-border/50 flex gap-2 justify-between text-[10px] text-muted-foreground">
				<div className="flex flex-col justify-between">
					<span>
						Version <span className="font-mono">v{__VERSION__}</span>
					</span>

					<a
						href="https://github.com/alibaba/page-agent"
						target="_blank"
						rel="noopener noreferrer"
						className="flex items-center gap-1 hover:text-foreground"
					>
						<svg role="img" viewBox="0 0 24 24" className="size-3 fill-current">
							<path d={siGithub.path} />
						</svg>
						<span>Source Code</span>
					</a>
				</div>

				<div className="flex flex-col items-end">
					<a
						href="https://github.com/alibaba/page-agent/blob/main/docs/terms-and-privacy.md"
						target="_blank"
						rel="noopener noreferrer"
						className="flex items-center gap-1 hover:text-foreground"
					>
						<HatGlasses className="size-3" />
						<span>Privacy</span>
					</a>
				</div>
			</div>

			{/* attribute */}
			<div className="text-[10px] text-muted-foreground bg-background fixed bottom-0 w-full flex justify-around">
				<span className="leading-loose">
					Built with ♥️ by{' '}
					<a
						href="https://github.com/gaomeng1900"
						target="_blank"
						rel="noopener noreferrer"
						className="underline hover:text-foreground"
					>
						@Simon
					</a>
				</span>
			</div>
		</div>
	)
}
