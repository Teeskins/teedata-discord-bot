import {
  ApplicationCommandOption,
  ApplicationCommandOptionType,
  CacheType,
  CommandInteraction,
  CommandInteractionOption,
  Message,
} from 'discord.js';

import { v4 as uuidv4 } from 'uuid';

import { Bot } from '../../bot';
import ICommand from '../../interfaces/command';
import TwUtils from '../../services/apis/twutils';
import sendDiscordRawImage from '../../utils/discordSendImage';
import ErrorEmbed from '../../utils/msg';
import teedataCategories from '../../utils/teedataCategories';
    
export default class implements ICommand {
  name: String;
  category: String;
  description: String;
  options: ApplicationCommandOption[];
  
  constructor() {
    this.name = 'fix';
    this.category = 'asset';
    this.description = 'Fix a Teeworlds asset with wrong size';
    this.options = [
      {
        name: 'category',
        type: ApplicationCommandOptionType.String,
        required: true,
        description: 'The asset category',
        choices: teedataCategories
      },
      {
        name: 'image',
        type: ApplicationCommandOptionType.Attachment,
        required: true,
        description: 'The asset to fix'
      },
    ];
  }
  
  async run(
    _bot: Bot,
    message: Message<boolean> | CommandInteraction<CacheType>,
    args: Array<CommandInteractionOption>
  ) {
    const [ category, file ] = args;
  
    const interaction = message as CommandInteraction<CacheType>;
    await interaction.deferReply({ ephemeral: true });
  
    // Check if its a PNG
    if (file.attachment.contentType !== 'image/png') {
      await interaction.followUp({
        embeds: [ ErrorEmbed.wrong('The content type must be `image/png`')]
      })
      return;
    }

    const fixedAssetRawBytes = await TwUtils.fixAsset({
      category: category.value.toString(),
      path: file.attachment.url
    });

    if (fixedAssetRawBytes === null) {
      await interaction.followUp({
        embeds: [ ErrorEmbed.wrong('This asset probably already has a correct size or is invalid') ]
      })
      return;
    }

    const path = uuidv4() + '.png';

    await sendDiscordRawImage(
      interaction,
      {
        title: 'Fixed ' + category.value,
        raw: fixedAssetRawBytes,
        path
      }
    );
  };
}
  