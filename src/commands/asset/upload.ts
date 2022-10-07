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
import downloadAsset from '../../utils/downloadAsset';
import ErrorEmbed from '../../utils/msg';
import teedataCategories from '../../utils/teedataCategories';
    
export default class implements ICommand {
  name: String;
  category: String;
  description: String;
  options: ApplicationCommandOption[];
  
  constructor() {
    this.name = 'upload';
    this.category = 'asset';
    this.description = 'Upload an asset';
    this.options = [
      {
        name: 'name',
        type: ApplicationCommandOptionType.String,
        required: true,
        description: 'The asset name',
        maxLength: 255
      },
      {
        name: 'category',
        type: ApplicationCommandOptionType.String,
        required: true,
        description: 'The asset category',
        choices: teedataCategories
      },
      {
        name: 'author',
        type: ApplicationCommandOptionType.String,
        required: true,
        description: 'The asset creator name',
        maxLength: 255
      },
      {
        name: 'image',
        type: ApplicationCommandOptionType.Attachment,
        required: true,
        description: 'The asset to upload'
      },
    ];
  }
  
  async run(
    _bot: Bot,
    message: Message<boolean> | CommandInteraction<CacheType>,
    args: Array<CommandInteractionOption>
  ) {
    const [ name, category, author, file ] = args;
  
    const interaction = message as CommandInteraction<CacheType>;
    await interaction.deferReply({ ephemeral: true });
  
    // Check if its a PNG
    if (file.attachment.contentType !== 'image/png') {
      await interaction.followUp({
        embeds: [ ErrorEmbed.wrong('The content type must be `image/png`')]
      })
      return;
    }

    console.log(file)
  
    // Download the attachment
    // const imageRawBytes = await downloadAsset(file.attachment.url);

    // if (imageRawBytes === null) {
    //   await interaction.followUp({
    //     embeds: [ ErrorEmbed.wrong('Unable to upload this image')]
    //   })
    //   return;
    // }
  
    // Upload the file to the server
    // const blob = new Blob([imageRawBytes], { type: 'image/png '});
    const asset = await Teedata.assetUpload(
      {
        name: name.value.toString(),
        type: category.value.toString(),
        author: author.value.toString(),
        url: file.attachment.url
      },
    );
  
    if (asset === null) {
      await interaction.followUp({
        embeds: [ ErrorEmbed.wrong() ]
      })
      return;
    }
  
    const embed = new EmbedBuilder()
      .setColor(0x000000)
      .setFields([
        { name: 'Name', value: name.value.toString(), inline: true},
        { name: 'Category', value: category.value.toString(), inline: true }
      ])
      .setAuthor(
        {
          name: '❤️ ' + interaction.member.user.username,
          iconURL: interaction.user.avatarURL()
        }
      );
          
    await interaction.followUp({
      embeds: [ embed ]
    });
  };
}
  