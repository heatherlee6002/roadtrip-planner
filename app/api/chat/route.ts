import {
  consumeStream,
  convertToModelMessages,
  streamText,
  UIMessage,
} from 'ai'
import { getStayOptions, stopsData, getStopById, StopData } from '@/lib/stops-data'

export const maxDuration = 30

function formatStopContext(stop: StopData | undefined): string {
  if (!stop) return 'Unknown location'

  let context = `${stop.name} (${stop.subtitle})\n`
  context += `Distance from start: ${stop.distance}\n`
  context += `Phase: ${stop.phase}\n`
  context += `Warning rating: ${stop.areaWarnings.rating}/5 - ${stop.areaWarnings.summary}\n\n`

  context += `Stay options:\n`
  getStayOptions(stop).forEach((s) => {
    context += `  ${s.label}. ${s.name} (${s.type}) | Dog: ${s.dogFriendly ? 'Yes' : 'No'} | Shower: ${s.shower} | Grocery: ${s.groceryNearby}\n`
  })
  context += '\n'

  context += `Nearby dog walks:\n`
  stop.dogWalks.forEach((walk) => {
    context += `  - ${walk.name} (${walk.type}) | Leash required: ${walk.leashRequired ? 'Yes' : 'No'}\n`
  })
  context += '\n'

  context += `General grocery proximity: ${stop.groceryNearby}\n`
  context += `Shower info: ${stop.showerInfo}\n`

  return context
}

export async function POST(req: Request) {
  const { messages, currentStopId, nextStopId }: {
    messages: UIMessage[]
    currentStopId: string
    nextStopId: string
  } = await req.json()

  const currentStop = getStopById(currentStopId)
  const nextStop = getStopById(nextStopId)

  const tripContext = `
You are a helpful road trip assistant for a road trip with a dog. Focus on practical decision support.

CURRENT LOCATION:
${formatStopContext(currentStop)}

NEXT PLANNED STOP:
${formatStopContext(nextStop)}

KEY GUIDELINES:
- Prioritize dog safety and comfort
- Explicitly compare stay options A/B/C/D when user asks where to stay
- Treat stay option A as the recommended baseline
- Highlight warning ratings and leash requirements
- Remind users that this is static planning data

ALL STOPS DATA:
${stopsData.map(s => `${s.id}. ${s.shortName} - warning ${s.areaWarnings.rating}/5 - ${s.distance}`).join('\n')}
`

  const result = streamText({
    model: 'openai/gpt-4o-mini',
    system: tripContext,
    messages: await convertToModelMessages(messages),
    abortSignal: req.signal,
  })

  return result.toUIMessageStreamResponse({
    originalMessages: messages,
    consumeSseStream: consumeStream,
  })
}
