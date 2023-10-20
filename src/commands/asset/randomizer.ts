import {
  ApplicationCommandOption,
  ApplicationCommandOptionType,
  AttachmentBuilder,
  CacheType,
  CommandInteraction,
  CommandInteractionOption,
  Message,
} from 'discord.js';

import { v4 as uuidv4 } from 'uuid';

import Bot from '../../bot';
import ICommand from '../../command';
import { assetKindArgument} from '../../utils/commonArguments';
import { resolveAsset } from '../../services/asset';
import { AssetPart, IAsset, SkinPart } from 'teeworlds-utilities';
import ErrorEmbed from '../../utils/msg';
import { unlink } from 'fs/promises';
import Teedata from '../../services/apis/teedata';
import { AssetKind, getAssetPartsMetadata } from 'teeworlds-utilities/build/main/asset/part';

const linkedAssetParts = {
  [AssetKind.SKIN]: [
    [
      SkinPart.DEFAULT_EYE,
      SkinPart.ANGRY_EYE,
      SkinPart.BLINK_EYE,
      SkinPart.HAPPY_EYE,
      SkinPart.CROSS_EYE,
      SkinPart.SCARY_EYE,
    ],
    [
      SkinPart.BODY, SkinPart.BODY_SHADOW
    ],
    [
      SkinPart.HAND, SkinPart.HAND_SHADOW
    ],
    [
      SkinPart.FOOT, SkinPart.FOOT_SHADOW
    ]
  ]
}

const getLinkedAssetParts = (kind: AssetKind, part: AssetPart): [AssetPart] => {
  let kinds = Object.keys(linkedAssetParts);

  if (kinds.includes(kind) === false) {
    return [part];
  }

  let partsGroup = linkedAssetParts[kind];

  for (const parts of partsGroup) {
    if (parts.includes(part) === true) {
      return parts
    }
  }

  return [part];
}

export default class implements ICommand {
  name: string;
  category: string;
  description: string;
  extraDescription: string;
  options: ApplicationCommandOption[];
    
  constructor() {
    this.name = 'randomizer';
    this.category = 'asset';
    this.description = 'Get a fresh new random asset';
    this.options = [
      assetKindArgument,
      {
        name: 'amount',
        type: ApplicationCommandOptionType.Number,
        minValue: 2,
        maxValue: 10,
        required: true,
        description: 'Amount of selected random assets',
      },
    ]
  }

  private async loadAsset(
    assetKind: string,
    url: string
  ): Promise<IAsset | null> {
    let ret: IAsset;

    // Resolve the asset
    try {
      ret = resolveAsset(assetKind);
    } catch {
      return null;
    }

    // Load the asset
    try {
      await ret.load(url);
    } catch {
      return null;
    }

    return ret;
  }

  private async getRandomTeedataAssets(
    assetKind: string,
    n: number
  ): Promise<IAsset[]> {
    let sources = []

    for (let i = 0; i < n; i++) {
      const asset = await Teedata.assetRandom(assetKind);

      if (asset === null) {
        continue;
      }

      const assetUrl = process.env.TEEDATA_HOST + asset.path;

      let source = await this.loadAsset(
        assetKind,
        assetUrl
      );

      if (source === null) {
        continue
      }

      sources.push(source)
    }

    return sources;
  }

  private async randomAsset(
    interaction: CommandInteraction<CacheType>,
    assetkind: string,
    number: number
  ) {
    let sources = await this.getRandomTeedataAssets(
      assetkind,
      number + 1,
    )

    if (sources.length === 0) {
      await interaction.followUp(
        {
          embeds: [ ErrorEmbed.wrong("Unable to get assets") ]
        }
      );
      
      return
    }

    let destination = sources.pop()
    let kind = destination.metadata.kind
    let parts = Object.keys(
      getAssetPartsMetadata(kind)
    )

    for (const source of sources) {
      for (let i = 0; i < Math.floor(Math.random() * 5); i++) {
        let index = Math.floor(Math.random() * parts.length)
        let part = parts[index]

        destination.copyParts(
          source,
          ...getLinkedAssetParts(kind, part as AssetPart)
        )
      }
    }

    const path = uuidv4() + '.png';
    
    destination.saveAs(path);

    await interaction.followUp(
      {
        files: [ new AttachmentBuilder(path)]
      }
    )

    await unlink(path);
  }

  async run(
    _bot: Bot,
    message: Message<boolean> | CommandInteraction<CacheType>,
    args: Array<CommandInteractionOption>
  ) {
    const [ assetkind, amount ] = args;
    const interaction = message as CommandInteraction<CacheType>;

    await interaction.deferReply({ ephemeral: true });

    await this.randomAsset(
      interaction,
      assetkind.value.toString(),
      amount.value as number
    );
  };
}
