/* eslint-disable @typescript-eslint/no-non-null-assertion */
import axios from "axios";
import * as fs from "fs/promises";
import Vibrant from "node-vibrant";
import sharp from "sharp";

import Package from "../package.json";
import arbitrum from "./tokens/arbitrum.json";
import celo from "./tokens/celo.json";
import polygon from "./tokens/polygon.json";

const getTokenColor = async (url: string) => {
  const { data: iconData } = await axios.get<Buffer>(url, {
    responseType: "arraybuffer",
  });

  const DIMENSION = 256;
  // run through sharp to be save
  const rasterizedIcon = await sharp(iconData)
    .resize(DIMENSION, DIMENSION)
    .png()
    .toBuffer();

  const v = new Vibrant(rasterizedIcon);
  const palette = await v.getPalette();
  return {
    muted: palette.Muted?.hex,
    vibrant: palette.Vibrant?.hex,
    lightMuted: palette.LightMuted?.hex,
    lightVibrant: palette.LightVibrant?.hex,
    darkMuted: palette.DarkMuted?.hex,
    darkVibrant: palette.DarkVibrant?.hex,
  };
};

const buildList = async () => {
  const parsed = Package.version.split(".");
  const list = {
    name: "Numoen Default",
    timestamp: new Date().toISOString(),
    version: {
      major: +parsed[0]!,
      minor: +parsed[1]!,
      patch: +parsed[2]!,
    },
    tags: {},
    keywords: ["numoen", "default"],
    tokens: await Promise.all(
      [...celo, ...arbitrum, ...polygon]
        // sort them by symbol for easy readability
        .sort((t1, t2) => {
          if (t1.chainId === t2.chainId) {
            return t1.symbol.toLowerCase() < t2.symbol.toLowerCase() ? -1 : 1;
          }
          return t1.chainId < t2.chainId ? -1 : 1;
        })
        .map(async (t) => ({ ...t, color: await getTokenColor(t.logoURI) }))
    ),
  };

  await fs.writeFile(
    "build/numoen-default.tokenlist.json",
    JSON.stringify(list, null, 2)
  );
};

buildList().catch((err) => console.error(err));
