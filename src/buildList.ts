/* eslint-disable @typescript-eslint/no-non-null-assertion */
import * as fs from "fs/promises";

import Package from "../package.json";
import arbitrum from "./tokens/arbitrum.json";
import celo from "./tokens/celo.json";

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
    tokens: [...celo, ...arbitrum]
      // sort them by symbol for easy readability
      .sort((t1, t2) => {
        if (t1.chainId === t2.chainId) {
          return t1.symbol.toLowerCase() < t2.symbol.toLowerCase() ? -1 : 1;
        }
        return t1.chainId < t2.chainId ? -1 : 1;
      }),
  };

  await fs.writeFile(
    "build/numoen-default.tokenlist.json",
    JSON.stringify(list, null, 2)
  );
};

buildList().catch((err) => console.error(err));
