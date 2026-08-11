import { GoogleGenAI } from '@google/genai'
import { SAJU_SYSTEM_INSTRUCTION, buildSajuUserInput } from './sajuPrompt.js'

// Vite 환경변수: .env 의 VITE_GEMINI_API_KEY
const apiKey = import.meta.env.VITE_GEMINI_API_KEY

/**
 * 사주 해석 요청
 * - Interactions API + gemini-3.6-flash 사용
 * - temperature / top_p / top_k 는 새 모델에서 deprecated → 넣지 않음
 */
export async function analyzeSaju(formData) {
  if (!apiKey) {
    throw new Error(
      'VITE_GEMINI_API_KEY가 없습니다. 프로젝트 루트 .env에 키를 넣고 dev 서버를 재시작하세요.',
    )
  }

  const ai = new GoogleGenAI({ apiKey })

  const interaction = await ai.interactions.create({
    model: 'gemini-3.6-flash',
    system_instruction: SAJU_SYSTEM_INSTRUCTION,
    input: buildSajuUserInput(formData),
  })

  // SDK는 output_text / outputText 둘 다 제공할 수 있음
  const text = interaction.output_text ?? interaction.outputText ?? ''
  if (!text.trim()) {
    throw new Error('Gemini 응답이 비어 있습니다. 잠시 후 다시 시도해 주세요.')
  }
  return text
}
