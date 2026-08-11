// 사주 기본차트 해석용 시스템/컨텍스트 프롬프트
// (명식·세운 등 차트 데이터는 아직 입력창에서 계산하지 않으므로 기본값으로 사용)

export const SAJU_SYSTEM_INSTRUCTION = `return only Korean.

당신은 사주를 잘 아는 가까운 친구다. 카페에서 마주 앉아 이야기하듯, 따뜻하고 친근한 반말로 조언한다. 전문 용어는 꼭 필요할 때만 짧게 풀어 설명하고, 설교하거나 딱딱하게 정리하지 않는다.

말투 규칙:
- 친구에게 말하듯 부드러운 반말 (예: "~인 것 같아", "~해보면 어때?", "너는~")
- 마크다운 금지: 제목(#), 굵게(**), 목록(-, 1.), 구분선, 코드블록 절대 사용하지 마
- 짧은 문단으로 이어지는 편지/대화체 문장만 써
- 이모지 사용하지 마

내용:
질문: 사주를 통해 이 사람의 전반적인 성격, 기질, 재능을 이야기해 줘.
1) 명식을 바탕으로 차분하지만 재밌게 풀어 줘.
2) 눈에 띄는 점이 있으면 자연스럽게 짚어 줘.
3) 약점도 솔직하되, 상처 주지 않게 말해 줘.
4) 돋보이는 특징을 최소 한 가지는 꼭 짚어 줘.
5) 마지막은 상대가 궁금해할 법한 걸 가볍게 물어보며 끝내 줘.
6) 사용자가 준 정보와 사주 정보를 종합해서 말해 줘.
7) 좋은 면과 조심할 면을 함께 봐 줘.
특이한 점도 한 가지 더 자연스럽게 언급해 줘.

return only Korean.`

/** 기본 사주 차트 컨텍스트 (이후 명식 계산기로 교체 가능) */
export function buildDefaultSajuChart({ gender, age }) {
  return `성별: ${gender || 'male'}
나이: 만 ${age ?? 27}세

년주는 기묘, 월주는 기사, 일주는 을축, 시주는 을유
오행 분포: 금1 목3 수0 화1 토3
십신(천간): 편재 | 편재 | 일주 | 비견
십신(지지): 비견 | 상관 | 편재 | 편관
지장간: 甲 겁재,乙 비견 | 戊 정재,庚 정관,丙 상관 | 癸 편인,辛 편관,己 편재 | 庚 정관,辛 편관
납음: 성두토 | 대림목 | 해중금 | 천중수
십이운성: 건록 | 목욕 | 쇠 | 절
12신살: 재살 | 역마살 | 월살 | 재살
旬/공망: [년]申酉 [일]戌亥
월령: 庚
대운수: 2
세운: 2021: 신축
2022: 임인
2023: 계묘
2024: 갑진
2025: 을사
2026: 병오 (기준)
2027: 정미
2028: 무신
2029: 기유
2030: 경술
2031: 신해
2032: 임자
월운: 01월: 기축
02월: 경인
03월: 신묘
04월: 임진
05월: 계사
06월: 갑오
07월: 을미
08월: 병신
09월: 정유
10월: 무술
11월: 기해
12월: 경자
대운 1: 무진 2001 (2~11세)
대운 2: 정묘 2011 (12~21세)
대운 3: 병인 2021 (22~31세)
대운 4: 을축 2031 (32~41세)
대운 5: 갑자 2041 (42~51세)
대운 6: 계해 2051 (52~61세)
대운 7: 임술 2061 (62~71세)
대운 8: 신유 2071 (72~81세)
대운 9: 경신 2081 (82~91세)`
}

/** 생년월일로 만 나이 계산 */
export function getKoreanAge(birthDate) {
  if (!birthDate) return null
  const birth = new Date(birthDate)
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age -= 1
  }
  return age
}

/** 폼 입력 + 기본 차트를 Gemini에 보낼 사용자 메시지로 합침 */
export function buildSajuUserInput({
  name,
  birthDate,
  birthTime,
  gender,
  calendarType,
}) {
  const age = getKoreanAge(birthDate)
  const genderLabel = gender === 'female' ? '여자' : gender === 'male' ? '남자' : '미입력'
  const calendarLabel = calendarType === 'lunar' ? '음력' : '양력'

  const chart = buildDefaultSajuChart({
    gender: gender || 'male',
    age: age ?? 27,
  })

  return `아래는 사용자가 입력한 정보와 사주 기본 차트입니다. 이 정보만 근거로 해석하세요.

[사용자 입력]
이름: ${name || '미입력'}
생년월일: ${birthDate || '미입력'}
태어난 시간: ${birthTime || '미입력'}
성별: ${genderLabel}
달력: ${calendarLabel}
만 나이: ${age ?? '미계산'}

[사주 기본 차트]
${chart}`
}
