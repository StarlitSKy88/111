/**
 * ONE-MCN Loop Runner（vibcoding 自动化）
 */
export async function runLoop(loopId: string, taskFn: () => Promise<boolean>): Promise<boolean> {
  console.log(`[Loop ${loopId}] Start`);
  const ok = await taskFn();
  if (!ok) throw new Error(`Loop ${loopId} failed`);
  console.log(`[Loop ${loopId}] PASS`);
  return true;
}
