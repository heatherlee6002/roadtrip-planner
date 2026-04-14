import {
  consumeStream,
  convertToModelMessages,
  streamText,
  UIMessage,
} from 'ai'
import { stopsData, getStopById, StopData } from '@/lib/stops-data'

export const maxDuration = 30

function formatStopContext(stop: StopData | undefined): string {
  if (!stop) return 'Unknown location'
  
  let context = `${stop.name} (${stop.subtitle})\n`
  context += `Distance from start: ${stop.distance}\n`
  context += `Phase: ${stop.phase}\n`
  context += `Type: ${stop.type}\n\n`
  
  if (stop.stay.length > 0) {
    context += `Stay candidate options (static planning data):\n`
    stop.stay.forEach(s => {
      context += `  ${s.letter}. ${s.name}\n`
    })
    context += '\n'
  }
  
  context += `Dog info: ${stop.dog.primary}`
  if (stop.dog.secondary) context += ` | ${stop.dog.secondary}`
  if (stop.dog.restrictions) context += ` | RESTRICTIONS: ${stop.dog.restrictions}`
  context += '\n\n'
  
  context += `Emergency candidate options (static planning data):\n`
  stop.emergency.forEach(e => {
    context += `  - ${e.label}\n`
  })
  context += '\n'
  
  context += `Logistics: Groceries: ${stop.logistics.groceries} | Gas: ${stop.logistics.gas}\n`
  
  if (stop.notes) {
    context += `Notes: ${stop.notes}\n`
  }
  
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
  
  // Build context about the trip
  const tripContext = `
You are a helpful road trip assistant for a road trip with a dog. You help the user make decisions about where to stay, dog-friendly activities, safety, and navigation.

CURRENT LOCATION:
${formatStopContext(currentStop)}

NEXT PLANNED STOP:
${formatStopContext(nextStop)}

FULL ROUTE OVERVIEW:
The trip has ${stopsData.length} stops total, using a static fallback architecture:
- Outbound leg: coastal corridor down to Florida Keys.
- Return leg: inland corridor back toward Massachusetts.
- Start mode: precise device GPS in the client UI.
- End mode: home.

KEY GUIDELINES:
- Prioritize dog safety and comfort in all recommendations
- Stay/dog/emergency entries are static planning candidates, not live validated inventory
- For "stay-friendly" stops, recommend campgrounds or dispersed camping first
- For "scenic-only" stops, emphasize quick dog breaks and photo ops
- For "transit" stops, focus on efficiency and rest areas
- Emergency recommendations should prioritize 24/7 options
- Be aware of national park dog restrictions (dogs often limited to parking lots, campgrounds, and paved roads)
- Weather and season may affect recommendations

Available stop types: stay-friendly, scenic-only, transit
Route phases: outbound, turning-point, return

ALL STOPS DATA:
${stopsData.map(s => `${s.id}. ${s.shortName} (${s.type}) - ${s.distance}`).join('\n')}
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
