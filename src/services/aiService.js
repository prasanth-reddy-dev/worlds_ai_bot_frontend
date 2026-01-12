// AI Service Utility - Supports multiple AI providers
// Automatically uses the best available provider

const AI_PROVIDERS = {
    gemini: {
        name: 'Google Gemini',
        endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
        makeRequest: async (apiKey, prompt) => {
            const response = await fetch(`${AI_PROVIDERS.gemini.endpoint}?key=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: {
                        temperature: 0.7,
                        maxOutputTokens: 4096,
                    }
                })
            });

            if (!response.ok) {
                const error = await response.json().catch(() => ({}));
                throw new Error(error?.error?.message || 'Gemini API call failed');
            }

            const data = await response.json();
            return data.candidates[0].content.parts[0].text;
        }
    },

    openai: {
        name: 'OpenAI',
        endpoint: 'https://api.openai.com/v1/chat/completions',
        makeRequest: async (apiKey, prompt) => {
            const response = await fetch(AI_PROVIDERS.openai.endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: 'gpt-3.5-turbo',
                    messages: [{ role: 'user', content: prompt }],
                    max_tokens: 4096,
                    temperature: 0.7
                })
            });

            if (!response.ok) {
                const error = await response.json().catch(() => ({}));
                throw new Error(error?.error?.message || 'OpenAI API call failed');
            }

            const data = await response.json();
            return data.choices[0].message.content;
        }
    },

    groq: {
        name: 'Groq',
        endpoint: 'https://api.groq.com/openai/v1/chat/completions',
        makeRequest: async (apiKey, prompt) => {
            const response = await fetch(AI_PROVIDERS.groq.endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: 'llama-3.3-70b-versatile',
                    messages: [{ role: 'user', content: prompt }],
                    max_tokens: 4096,
                    temperature: 0.7
                })
            });

            if (!response.ok) {
                const error = await response.json().catch(() => ({}));
                throw new Error(error?.error?.message || 'Groq API call failed');
            }

            const data = await response.json();
            return data.choices[0].message.content;
        }
    },

    cohere: {
        name: 'Cohere',
        endpoint: 'https://api.cohere.ai/v1/generate',
        makeRequest: async (apiKey, prompt) => {
            const response = await fetch(AI_PROVIDERS.cohere.endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: 'command',
                    prompt: prompt,
                    max_tokens: 4096,
                    temperature: 0.7
                })
            });

            if (!response.ok) {
                const error = await response.json().catch(() => ({}));
                throw new Error(error?.message || 'Cohere API call failed');
            }

            const data = await response.json();
            return data.generations[0].text;
        }
    },

    huggingface: {
        name: 'Hugging Face',
        endpoint: 'https://api-inference.huggingface.co/models/mistralai/Mixtral-8x7B-Instruct-v0.1',
        makeRequest: async (apiKey, prompt) => {
            const response = await fetch(AI_PROVIDERS.huggingface.endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    inputs: prompt,
                    parameters: {
                        max_new_tokens: 4096,
                        temperature: 0.7
                    }
                })
            });

            if (!response.ok) {
                const error = await response.json().catch(() => ({}));
                throw new Error(error?.error || 'Hugging Face API call failed');
            }

            const data = await response.json();
            return Array.isArray(data) ? data[0].generated_text : data.generated_text || data;
        }
    }
};

// Priority order for providers (can be customized)
const PROVIDER_PRIORITY = ['gemini', 'groq', 'openai', 'cohere', 'huggingface'];

/**
 * Get all configured API keys
 */
export const getConfiguredProviders = () => {
    const configured = {};

    PROVIDER_PRIORITY.forEach(provider => {
        const key = localStorage.getItem(`${provider}_api_key`);
        if (key) {
            configured[provider] = key;
        }
    });

    return configured;
};

/**
 * Get the active provider (or first available)
 */
export const getActiveProvider = () => {
    const activeProvider = localStorage.getItem('active_ai_provider');
    const configuredProviders = getConfiguredProviders();

    // If active provider has a key, use it
    if (activeProvider && configuredProviders[activeProvider]) {
        return { provider: activeProvider, apiKey: configuredProviders[activeProvider] };
    }

    // Otherwise, use first configured provider
    const firstConfigured = Object.entries(configuredProviders)[0];
    if (firstConfigured) {
        return { provider: firstConfigured[0], apiKey: firstConfigured[1] };
    }

    return null;
};

/**
 * Check if any AI provider is configured
 */
export const hasAnyProvider = () => {
    return Object.keys(getConfiguredProviders()).length > 0;
};

/**
 * Make an AI API call using the best available provider
 * @param {string} prompt - The prompt to send
 * @param {object} options - Optional settings
 * @returns {Promise<string>} - The AI response
 */
export const callAI = async (prompt, options = {}) => {
    const { preferredProvider = null, fallback = true } = options;

    const configuredProviders = getConfiguredProviders();

    if (Object.keys(configuredProviders).length === 0) {
        throw new Error('No AI provider configured. Please add an API key in AI Settings.');
    }

    // Determine which providers to try
    let providersToTry = [];

    if (preferredProvider && configuredProviders[preferredProvider]) {
        providersToTry.push(preferredProvider);
    }

    // Add active provider
    const activeProvider = getActiveProvider();
    if (activeProvider && !providersToTry.includes(activeProvider.provider)) {
        providersToTry.push(activeProvider.provider);
    }

    // Add remaining providers if fallback is enabled
    if (fallback) {
        PROVIDER_PRIORITY.forEach(provider => {
            if (configuredProviders[provider] && !providersToTry.includes(provider)) {
                providersToTry.push(provider);
            }
        });
    }

    let lastError = null;

    for (const providerName of providersToTry) {
        const apiKey = configuredProviders[providerName];
        const provider = AI_PROVIDERS[providerName];

        if (!provider) continue;

        try {
            console.log(`Trying AI provider: ${provider.name}`);
            const response = await provider.makeRequest(apiKey, prompt);
            console.log(`Success with provider: ${provider.name}`);
            return response;
        } catch (error) {
            console.warn(`Provider ${provider.name} failed:`, error.message);
            lastError = error;
            // Continue to next provider
        }
    }

    throw lastError || new Error('All AI providers failed');
};

/**
 * Get provider info for display
 */
export const getProviderInfo = (providerName) => {
    const provider = AI_PROVIDERS[providerName];
    return provider ? { name: provider.name } : null;
};

export default {
    callAI,
    getActiveProvider,
    getConfiguredProviders,
    hasAnyProvider,
    getProviderInfo,
    PROVIDER_PRIORITY
};
