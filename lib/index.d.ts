/**
 * Copyright (c) 2023 Imken Luo <me@imken.moe>
 * This file is a part of remark-luogu-flavor.
 *
 * Licensed under GNU Affero General Public License version 3 or later.
 * See the LICENSE file for details.
 *
 * @author Imken Luo <me@imken.moe>
 * @license AGPL-3.0-or-later
 */

export { default } from "./lfm/index.js";

declare module "mdast" {
  interface UserMention extends Parent {
    type: "userMention";
    uid: number;
    children: PhrasingContent[];
  }

  interface BilibiliVideo extends Node {
    type: "bilibiliVideo";
    videoId: string;
  }

  interface PhrasingContentMap {
    userMention: UserMention;
    bilibiliVideo: BilibiliVideo;
  }

  interface RootContentMap {
    userMention: UserMention;
    bilibiliVideo: BilibiliVideo;
  }
}
