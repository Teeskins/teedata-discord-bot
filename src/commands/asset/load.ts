import {
  ApplicationCommandOption,
  ApplicationCommandOptionType,
  CacheType,
  CommandInteraction,
  CommandInteractionOption,
  EmbedBuilder,
  Message,
} from 'discord.js';

import { Bot } from '../../bot';
import ICommand from '../../interfaces/command';
import Teedata from '../../services/apis/teedata';
import ErrorEmbed from '../../utils/msg';
import teedataCategories from '../../utils/teedataCategories';
  
export default class implements ICommand {
  name: string;
  category: string;
  description: string;
  options: ApplicationCommandOption[];
  
  constructor() {
    this.name = 'load';
    this.category = 'asset';
    this.description = 'Load an asset';
    this.options = [
      {
        name: 'id',
        type: ApplicationCommandOptionType.Number,
        required: true,
        description: 'The asset id'
      }
    ];
  }
  
  async run(
    _bot: Bot,
    message: Message<boolean> | CommandInteraction<CacheType>,
    args: Array<CommandInteractionOption>
  ) {
    const [ id ] = args;
    const assetId = id.value.toString();

    const interaction = message as CommandInteraction<CacheType>;
    await interaction.deferReply({ ephemeral: true });

    const asset = await Teedata.assetInfo(assetId);

    if (asset === null) {
      await interaction.followUp({
        embeds: [ ErrorEmbed.wrong() ]
      })
      return;
    }

    const assetUrl = process.env.TEEDATA_HOST + asset.path;

    const embed = new EmbedBuilder()
      .setTitle(asset.name)
      .setURL(assetUrl)
      .setImage(assetUrl)
      .setAuthor({
        name: asset.uploaded_by.name,
        iconURL: asset.uploaded_by.profile_photo_url
      })
      .setColor(0x000000);

    await interaction.followUp({
      embeds: [ embed ]
    })
  };
}
