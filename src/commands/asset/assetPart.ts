import {
  ApplicationCommandOption,
  ApplicationCommandOptionType,
  AttachmentBuilder,
  CacheType,
  CommandInteraction,
  CommandInteractionOption,
  EmbedBuilder,
  Message,
} from 'discord.js';

import { v4 as uuidv4 } from 'uuid';

import Bot from '../../bot';
import ICommand from '../../command';
import { assetKindArgument} from '../../utils/commonArguments';
import { formatAssetParts, resolveAsset, resolvePartExpression } from '../../services/asset';
import { AssetPart, EmoticonPart, GameskinPart, IAsset, ParticulePart, SkinPart } from 'teeworlds-utilities';
import parseCommandOptions, { ParsedOptions } from '../../utils/commandOptions';
import ErrorEmbed from '../../utils/msg';
import { unlink } from 'fs/promises';
import Teedata from '../../services/apis/teedata';
import { getAssetPartsMetadata } from 'teeworlds-utilities/build/main/asset/part';

// enum FileOutput {
//   ZIP = 'zip',
//   TARGZIP = 'targz'
// }

const assetExtraDescription = `Concerning the expression for the asset parts

It must be the following format \`part1,part2,part3,etc...\``

export default class implements ICommand {
  name: string;
  category: string;
  description: string;
  extraDescription: string;
  options: ApplicationCommandOption[];
    
  constructor() {
    this.name = 'assetpart';
    this.category = 'asset';
    this.description = 'Manages asset parts';
    this.extraDescription = 'For more details: /assetpart help'
    this.options = [
      {
        name: 'help',
        description: 'Additional help for the assertpart command',
        type: ApplicationCommandOptionType.Subcommand,
      },
      // {
      //   name: 'extract',
      //   description: 'Exract asset part(s) from a Teeworlds asset',
      //   type: ApplicationCommandOptionType.Subcommand,
      //   options: [
      //     {
      //       name: 'image',
      //       type: ApplicationCommandOptionType.Attachment,
      //       required: true,
      //       description: 'The asset',
      //     },
      //     assetKindArgument,
      //     {
      //       name: 'output',
      //       type: ApplicationCommandOptionType.String,
      //       required: true,
      //       description: 'Output file format',
      //       choices: [
      //         {
      //           name: '.zip',
      //           value: FileOutput.ZIP,
      //         },
      //         {
      //           name: '.tar.gz',
      //           value: FileOutput.TARGZIP,
      //         },
      //       ]
      //     },
      //     {
      //       name: 'expression',
      //       type: ApplicationCommandOptionType.String,
      //       required: true,
      //       description: 'Represents the targeted parts',
      //     },
      //   ]
      // },
      {
        name: 'replace',
        description: 'Replace asset part(s) from a Teeworlds asset',
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: 'source',
            type: ApplicationCommandOptionType.Attachment,
            required: true,
            description: 'The source asset',
          },
          {
            name: 'destination',
            type: ApplicationCommandOptionType.Attachment,
            required: true,
            description: 'The destination asset',
          },
          assetKindArgument,
          {
            name: 'expression',
            type: ApplicationCommandOptionType.String,
            required: true,
            description: 'Represents the targeted parts',
          },
        ]
      },
      {
        name: 'random',
        description: 'Replace random asset part(s) from random Teeworlds assets',
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          assetKindArgument,
          {
            name: 'number',
            type: ApplicationCommandOptionType.Number,
            minValue: 2,
            maxValue: 10,
            required: true,
            description: 'Number of selected random assets',
          },
        ]
      },
    ];
  }

  private async additionalHelp(interaction: CommandInteraction<CacheType>) {
    const embed = new EmbedBuilder()
      .setTitle('/assetpart help')
      .setColor(0x2b2d31)
      .setDescription(assetExtraDescription)
      .setFields(
        {
          name: 'Skin parts',
          value: formatAssetParts(SkinPart)
        },
        {
          name: 'Gameskin parts',
          value: formatAssetParts(GameskinPart)
        },
        {
          name: 'Emoticon parts',
          value: formatAssetParts(EmoticonPart)
        },
        {
          name: 'Particule parts',
          value: formatAssetParts(ParticulePart)
        }
      );
    

      await interaction.followUp(
        {
          embeds: [ embed ]
        }
      );
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

  private async replaceAsset(
    interaction: CommandInteraction<CacheType>,
    options: ParsedOptions
  ) {
    // Load source and destination
    const source = await this.loadAsset(
      options.assetkind,
      options.source.url
    );
    const destination = await this.loadAsset(
      options.assetkind,
      options.destination.url,
    );

    if (source === null || destination === null) {
      await interaction.followUp(
        {
          embeds: [ ErrorEmbed.wrong() ]
        }
      );
      
      return;
    }

    // Resolve the asset parts
    const assetParts = resolvePartExpression(
      options.expression,
      source
    );

    if (assetParts.length === 0) {
      await interaction.followUp(
        {
          embeds: [ ErrorEmbed.wrong("Check /assetpart help") ]
        }
      );

      return;
    }

    const path = uuidv4() + '.png';
    
    destination
      .copyParts(source, ...assetParts)
      .saveAs(path);

    await interaction.followUp(
      {
        files: [ new AttachmentBuilder(path)]
      }
    )

    await unlink(path);
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
    options: ParsedOptions
  ) {
    let sources = await this.getRandomTeedataAssets(
      options.assetkind,
      options.number + 1,
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
    let parts = Object.keys(
      getAssetPartsMetadata(destination.metadata.kind)
    )

    for (const source of sources) {
      for (let i = 0; i < Math.floor(Math.random() * 5); i++) {
        let index = Math.floor(Math.random() * parts.length)
        let part = parts[index]

        destination.copyPart(
          source,
          part as AssetPart
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
    const [ subCommand ] = args;
    const interaction = message as CommandInteraction<CacheType>;
    const options = parseCommandOptions(subCommand)

    await interaction.deferReply({ ephemeral: true });

    switch (subCommand.name) {
      case 'help':
        await this.additionalHelp(interaction);
        break;
      
      case 'replace':
        await this.replaceAsset(interaction, options);
        break;
      
      case 'random':
        await this.randomAsset(interaction, options);
        break;
    
      default:
        break;
    }
  };
}
