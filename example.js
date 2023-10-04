import fs from "fs";
import rehypeStringify from "rehype-stringify";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";

import remarkLuoguFlavor from "./lib/index.js";

const buffer = fs.readFileSync("example.md");

const file = await unified()
  .use(remarkLuoguFlavor)
  .use(remarkParse)
  .use(rehypeStringify)
  .use(remarkRehype)
  .process(buffer);

console.log((file));
