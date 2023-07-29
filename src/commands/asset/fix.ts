import {
  ApplicationCommandOption,
  ApplicationCommandOptionType,
  CacheType,
  CommandInteraction,
  CommandInteractionOption,
  Message,
} from 'discord.js';

import { v4 as uuidv4 } from 'uuid';

import Bot from '../../bot';
import ICommand from '../../command';
import sendDiscordRawImage from '../../utils/discordSendImage';
import ErrorEmbed from '../../utils/msg';
import { assetKindArgument } from '../../utils/commonArguments';
import { resolveAsset } from '../../services/asset';
import { IAsset, fixAssetSize } from 'teeworlds-utilities';


export default class implements ICommand {
  name: string;
  category: string;
  description: string;
  options: ApplicationCommandOption[];
  
  constructor() {
    this.name = 'fix';
    this.category = 'asset';
    this.description = 'Fix a Teeworlds asset with wrong size';
    this.options = [
      {
        name: 'image',
        type: ApplicationCommandOptionType.Attachment,
        required: true,
        description: 'The asset to fix'
      },
      assetKindArgument,
    ];
  }
  
  async run(
    _bot: Bot,
    message: Message<boolean> | CommandInteraction<CacheType>,
    args: Array<CommandInteractionOption>
  ) {
    const [ file, category ] = args;
  
    const interaction = message as CommandInteraction<CacheType>;
    await interaction.deferReply({ ephemeral: true });
  
    // Check if its a PNG
    if (file.attachment.contentType !== 'image/png') {
      await interaction.followUp({
        embeds: [ ErrorEmbed.wrong('The content type must be `image/png`')]
      })
      return;
    }

    let asset: IAsset;

    // Resolving an IAsset from the user string argument
    try {
      asset = resolveAsset(category.value.toString());

      asset.setVerification(false);
  
      await asset.load(file.attachment.url);
    } catch (error) {
      await interaction.followUp(
        {
          embeds: [
            ErrorEmbed.wrong(error.message)
          ]
        }
      );

      return;
    }

    // Process the wrong sized asset
    const status = fixAssetSize(asset);

    if (status === false) {
      await interaction.followUp(
        {
          embeds: [
            ErrorEmbed.wrong('This asset probably already has a correct size or is invalid')
          ]
        }
      );

      return;
    }

    const path = uuidv4() + '.png';

    asset.saveAs(path);

    await sendDiscordRawImage(
      interaction,
      {
        title: 'Fixed ' + category.value,
        raw: asset.canvas.toBuffer(),
        path
      }
    );
  };
}
  