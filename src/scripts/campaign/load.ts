import      { isObj, str, optStr, arr, makeCollector } from "@starweb-libs/engine/validate.js";
import type { Audio                                  } from "@starweb-libs/audio/audio.js";
import type { CampaignData, CampaignEntry, Campaign, CampaignAudio } from "./types.ts";
import type { Level     } from "../level/types.ts";
import      { loadLevel } from "../level/load.ts";

const BASE_PATH = "../../assets/campaigns/";
const campaignFiles = import.meta.glob("../../assets/campaigns/**/*.json", {
  eager: true,
  import: "default"
}) as Record<string, unknown>;

function parseCampaign(data: unknown): CampaignData {
  if (!isObj(data)) throw new Error("Campaign: not an object");
  return {
    name: str(data, "name", "Campaign"),
    levels: arr(data, "levels", "Campaign") as CampaignEntry<unknown>[],
    audio: data["audio"] ?? {},
  }
}

function resolveEntry(entry: unknown, basePath: string, ctx: string): unknown {
  if (!isObj(entry)) throw new Error(`${ctx}: entry must be an object`);

  const hasData = "data" in entry;
  const hasPath = "path" in entry;
  if ( hasData &&  hasPath) throw new Error(`${ctx}: entry has both "data" and "path"`);
  if (!hasData && !hasPath) throw new Error(`${ctx}: entry has neither "data" nor "path"`);
  if (hasData) return entry["data"];

  const path = entry["path"];
  if (typeof path !== "string") throw new Error(`${ctx}: entry "path" must be a string`);

  const fullKey = `${basePath}/${path}`;
  const data = campaignFiles[fullKey];
  if (data === undefined) throw new Error(`${ctx}: file "${path}" not found at ${fullKey}`);
  return data;
}

export async function loadCampaign(folder: string, audio: Audio): Promise<Campaign> {
  const basePath = `${BASE_PATH}${folder}`;
  const campaignKey = `${basePath}/campaign.json`;
  const raw = campaignFiles[campaignKey];
  if (raw === undefined) throw new Error(`Campaign "${folder}": campaign.json not found at ${campaignKey}`);

  const campaign = parseCampaign(raw);
  const ctx = `Campaign "${campaign.name}"`;
  const { errors, tryGet } = makeCollector();

  // Resolve and parse levels
  const levels: Level[] = campaign.levels
    .map((entry, i) => tryGet(() => {
      const data = resolveEntry(entry, basePath, `${ctx}: levels[${i}]`);
      return loadLevel(data);
    }))
    .filter((l): l is NonNullable<typeof l> => l !== undefined);

  const campaignAudio: CampaignAudio = {};
  if (isObj(campaign.audio)) {
    const a = campaign.audio;
    const button = optStr(a, "button", `${ctx}: audio`);
    if (button) campaignAudio.button = button;
  }

  if (errors.length) throw new Error(`${ctx} failed validation:\n  ${errors.join("\n  ")}`);
  if (campaignAudio.button) await audio.registerSound("button", campaignAudio.button);
  return { name: campaign.name, levels, audio: campaignAudio };
}
