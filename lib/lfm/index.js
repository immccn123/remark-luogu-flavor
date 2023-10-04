/**
 * remark-luogu-flavor
 * Copyright (c) 2023 Imken Luo <me@imken.moe>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 *
 * Please notice that 「洛谷」 (also known as "Luogu") is a registered trademark of
 * Shanghai Luogu Network Technology Co., Ltd (上海洛谷网络科技有限公司).
 *
 * @author Imken Luo <me@imken.moe>
 * @license AGPL-3.0-or-later
 */

/// <reference types="remark-parse" />
/// <reference types="remark-stringify" />

/**
 * @typedef {import('mdast').Root} Root
 * @typedef {import('vfile').VFile} VFile
 * @typedef {import('unified').Processor<Root>} Processor
 */

/**
 * @typedef Options
 *   Configuration.
 * @property {boolean | null | undefined} [someField]
 *   Some option (optional).
 */

import { visit } from "unist-util-visit";

import { gfmFootnote } from "micromark-extension-gfm-footnote";
import { gfmStrikethrough } from "micromark-extension-gfm-strikethrough";
import { gfmTable } from "micromark-extension-gfm-table";
import { gfmAutolinkLiteral } from "micromark-extension-gfm-autolink-literal";

import {
  gfmAutolinkLiteralFromMarkdown,
  gfmAutolinkLiteralToMarkdown,
} from "mdast-util-gfm-autolink-literal";
import { gfmTableFromMarkdown, gfmTableToMarkdown } from "mdast-util-gfm-table";
import {
  gfmStrikethroughFromMarkdown,
  gfmStrikethroughToMarkdown,
} from "mdast-util-gfm-strikethrough";
import {
  gfmFootnoteFromMarkdown,
  gfmFootnoteToMarkdown,
} from "mdast-util-gfm-footnote";

const mentionReg = /^\/user\/(\d+)$/;
const legacyMentionReg = /^\/space\/show\?uid=(\d+)$/;

/** @type {Options} */
const emptyOptions = {};

/**
 * My plugin.
 *
 * @param {Options | null | undefined} [options]
 *   Configuration (optional).
 * @returns
 *   Transform.
 */
export default function remarkLuoguFlavor(options) {
  // @ts-expect-error: TS is wrong about `this`.
  const self = /** @type {Processor} */ (this);
  const settings = options || emptyOptions;
  const data = self.data();

  const micromarkExtensions =
    data.micromarkExtensions || (data.micromarkExtensions = []);
  const fromMarkdownExtensions =
    data.fromMarkdownExtensions || (data.fromMarkdownExtensions = []);
  const toMarkdownExtensions =
    data.toMarkdownExtensions || (data.toMarkdownExtensions = []);

  micromarkExtensions.push(
    gfmFootnote(),
    gfmStrikethrough({ singleTilde: false, ...settings }),
    gfmTable(),
    gfmAutolinkLiteral()
  );

  fromMarkdownExtensions.push(
    gfmFootnoteFromMarkdown(),
    gfmStrikethroughFromMarkdown(),
    gfmTableFromMarkdown(),
    gfmAutolinkLiteralFromMarkdown()
  );

  toMarkdownExtensions.push(
    gfmFootnoteToMarkdown(),
    gfmTableToMarkdown(),
    gfmStrikethroughToMarkdown(),
    gfmAutolinkLiteralToMarkdown()
  );

  /**
   * Transform.
   *
   * @param {Root} tree
   *   Tree.
   * @param {VFile} file
   *   File
   * @returns {undefined}
   *   Nothing.
   */
  return (tree, file) => {
    visit(tree, "paragraph", (node) => {
      const childNode = node.children;
      childNode.forEach((child, index) => {
        const lastNode = childNode[index - 1];
        if (
          child.type === "link" &&
          index >= 1 &&
          lastNode.type === "text" &&
          lastNode.value.endsWith("@")
        ) {
          const match =
            mentionReg.exec(child.url) ?? legacyMentionReg.exec(child.url);
          if (!match) return;
          /** @type {import("mdast").UserMention} */
          const newNode = {
            type: "userMention",
            children: child.children,
            uid: parseInt(match[1]),
          };
          childNode[index] = newNode;
        }
        if (child.type === "image" && child.url.startsWith("bilibili:")) {
          let videoId = child.url.replace("bilibili:", "");
          if (videoId.match(/^[0-9]/)) videoId = "av" + videoId;
          /** @type {import("mdast").BilibiliVideo} */
          const newNode = {
            type: "bilibiliVideo",
            videoId,
          };
          childNode[index] = newNode;
        }
      });
    });
  };
}

/**
 * <iframe scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true" src="https://www.bilibili.com/blackboard/webplayer/embed-old.html?bvid=BV1cf4y1W771&amp;danmaku=0&amp;autoplay=0&amp;playlist=0&amp;high_quality=1&amp;page=2&amp;t=379" style=" position: absolute; top: 0; left: 0; width: 100%; height: 100%;"></iframe>
 */
