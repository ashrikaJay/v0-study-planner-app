import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { url } = await req.json()

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; StudyPath/1.0)',
      },
    })

    if (!response.ok) {
      return NextResponse.json({ title: null })
    }

    const html = await response.text()
    
    // Extract title from HTML
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
    const ogTitleMatch = html.match(/<meta[^>]*property="og:title"[^>]*content="([^"]+)"/i)
    const twitterTitleMatch = html.match(/<meta[^>]*name="twitter:title"[^>]*content="([^"]+)"/i)
    
    const title = ogTitleMatch?.[1] || twitterTitleMatch?.[1] || titleMatch?.[1] || null

    // Extract description
    const descMatch = html.match(/<meta[^>]*name="description"[^>]*content="([^"]+)"/i)
    const ogDescMatch = html.match(/<meta[^>]*property="og:description"[^>]*content="([^"]+)"/i)
    
    const description = ogDescMatch?.[1] || descMatch?.[1] || null

    return NextResponse.json({
      title: title?.trim(),
      description: description?.trim(),
    })
  } catch (error) {
    console.error('Error fetching URL meta:', error)
    return NextResponse.json({ title: null, description: null })
  }
}
