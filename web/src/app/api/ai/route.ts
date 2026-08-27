import { NextResponse } from 'next/server'
import { GoogleGenAI } from '@google/genai'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, DELETE',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS })
}

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json()

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400, headers: CORS_HEADERS })
    }

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'GEMINI_API_KEY is not configured on the server' }, { status: 500, headers: CORS_HEADERS })
    }

    const ai = new GoogleGenAI({ apiKey })
    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
    })

    return NextResponse.json({ response: response.text }, { headers: CORS_HEADERS })
  } catch (error: any) {
    console.error('Gemini API Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate content' },
      { status: 500, headers: CORS_HEADERS }
    )
  }
}

