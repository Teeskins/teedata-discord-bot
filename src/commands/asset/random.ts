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
  name: String;
  category: String;
  description: String;
  options: ApplicationCommandOption[];
  
  constructor() {
    this.name = 'random';
    this.category = 'asset';
    this.description = 'Random asset of a category';
    this.options = [
      {
        name: 'category',
        type: ApplicationCommandOptionType.String,
        required: true,
        description: 'The asset category',
        choices: teedataCategories
      }
    ];
  }
  
  async run(
    _bot: Bot,
    message: Message<boolean> | CommandInteraction<CacheType>,
    args: Array<CommandInteractionOption>
  ) {
    const [ categoryArg ] = args;
    const category = categoryArg.value.toString();

    const interaction = message as CommandInteraction<CacheType>;
    await interaction.deferReply({ ephemeral: true });

    const asset = await Teedata.assetRandom(category);

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
