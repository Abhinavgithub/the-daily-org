import { getAllStories } from '../lib/stories';

// Every story's id, for the Worker to check that a vote names a story the paper printed (worker/index.ts).
export async function GET() {
  const stories = await getAllStories();
  return new Response(JSON.stringify(stories.map((story) => story.id)), { headers: { 'Content-Type': 'application/json' } });
}
