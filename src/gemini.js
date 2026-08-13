import { GoogleGenAI } from '@google/genai'
import { SAJU_SYSTEM_INSTRUCTION, buildSajuUserInput } from './sajuPrompt.js'

// Vite 환경변수: .env 의 VITE_GEMINI_API_KEY
const apiKey = import.meta.env.VITE_GEMINI_API_KEY

function extractTextDelta(event) {
  if (!event) return ''

  const type = event.event_type ?? event.eventType
  const delta = event.delta

  if (type === 'step.delta' || type === 'content.delta') {
    if (typeof delta === 'string') return delta
    if (delta?.type === 'text' && delta.text) return delta.text
    if (typeof delta?.text === 'string') return delta.text
    if (typeof delta?.content === 'string') return delta.content
  }

  if (typeof event.text === 'string') return event.text
  return ''
}

/**
 * 사주 해석 요청 (스트리밍)
 * - Interactions API + gemini-3.6-flash
 * - onChunk(fullText) 로 지금까지 받은 전체 텍스트를 전달
 */
export async function analyzeSaju(formData, { onChunk } = {}) {
  if (!apiKey) {
    throw new Error(
      'VITE_GEMINI_API_KEY가 없습니다. 프로젝트 루트 .env에 키를 넣고 dev 서버를 재시작하세요.',
    )
  }

  const ai = new GoogleGenAI({ apiKey })

  const stream = await ai.interactions.create({
    model: 'gemini-3.6-flash',
    system_instruction: SAJU_SYSTEM_INSTRUCTION,
    input: buildSajuUserInput(formData),
    stream: true,
  })

  let text = ''

  for await (const event of stream) {
    const chunk = extractTextDelta(event)
    if (!chunk) continue
    text += chunk
    onChunk?.(text)
  }

  if (!text.trim()) {
    throw new Error('Gemini 응답이 비어 있습니다. 잠시 후 다시 시도해 주세요.')
  }

  return text
}
