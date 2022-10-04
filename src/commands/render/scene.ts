import {
  ApplicationCommandOption,
  ApplicationCommandOptionType,
  CacheType,
  CommandInteraction,
  CommandInteractionOption,
  Message,
  EmbedBuilder,
  AttachmentBuilder
} from 'discord.js';

import { v4 as uuidv4 } from 'uuid';

import { Bot } from '../../bot';
import ICommand from '../../interfaces/command';

import Teedata from '../../services/apis/teedata';
import TwUtils from '../../services/apis/twutils';
import ErrorEmbed from '../../utils/msg';

import { files } from '../../utils/files';
import AbstractPageComponent from '../../services/components/page';

type Scenes = string[];

class ScenesPageComponent
extends AbstractPageComponent<Scenes> {
  constructor() {
    super();
  }

  createEmbed(): EmbedBuilder {
    const description = this.getCurrentContent().join('\n');

    return new EmbedBuilder()
      .setTitle('Scene list')
      .setColor(0x000000)
      .setDescription(description)
      .setFooter(
        {
          text: 'Page ' + this.pageNumber + ' / ' + this.pageMax
        }
      );
  }

  async reply() {
    await this.message.followUp(this.createOptions());
  }
}

export default class implements ICommand {
  name: String;
  category: String;
  description: String;
  options: ApplicationCommandOption[];
    
  constructor() {
    this.name = 'scene';
    this.category = 'render';
    this.description = 'Managing Teeworlds skins in scene rendering';
    this.options = [
      {
        name: 'render',
        description: 'Render a Teeworlds skin in a scene (default skin colors)',
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: 'id',
            type: ApplicationCommandOptionType.String,
            required: true,
            description: 'The skin id',
          },
          {
            name: 'scene',
            type: ApplicationCommandOptionType.String,
            description: 'The scene name',
            required: true,
            choices: [
            ]
          }
        ]
      },
      {
        name: 'list',
        description: 'Get every available scene',
        type: ApplicationCommandOptionType.Subcommand,
        options: [
        ]
      }
    ];
  }

  private async sceneListCommand(
    interaction: CommandInteraction<CacheType>
  ) {
    const results = await TwUtils.sceneList();

    if (results === null) {
      await interaction.followUp({embeds: [ ErrorEmbed.wrong() ]});
      return;
    }

    const component = new ScenesPageComponent()
        .setMaxLines(10)
        .setMessage(interaction)
        .addContent(results);
    
    await component.collect();
    await component.reply();
  }

  private async sceneRenderCommand(
    interaction: CommandInteraction<CacheType>,
    skinId: string,
    sceneName: string
  ) {
    const assetInfo = await Teedata.assetInfo(skinId);
    const skinUrl = process.env.TEEDATA_HOST + (assetInfo.path || '');
    const sceneRawBytes =  await TwUtils.sceneRender(
      {
        skin: skinUrl,
        name: sceneName
      }
    );

    if (sceneRawBytes === null) {
      await interaction.followUp({embeds: [ ErrorEmbed.wrong() ]});
      return;
    }
    
    const path = uuidv4() + '.png';

    files.write(path, sceneRawBytes);

    const file = new AttachmentBuilder(path);
    const embed = new EmbedBuilder()
      .setTitle(sceneName)
      .setImage('attachment://' + path)
      .setColor(0x000000);

    await interaction.followUp(
      {
        embeds: [ embed ],
        files: [ file ]
      }
    );

    files.delete(path);
  }

  async run(
    _bot: Bot,
    message: Message<boolean> | CommandInteraction<CacheType>,
    args: Array<CommandInteractionOption>
  ) {
    const [ subCommand ] = args;
    const [ 
      skinId, sceneName
    ] = subCommand.options.map(option => option.value.toString());
  
    const interaction = message as CommandInteraction<CacheType>;

    await interaction.deferReply();

    switch (subCommand.name) {
      case 'list':
        this.sceneListCommand(interaction);
        break;
  
      case 'render':
        this.sceneRenderCommand(
          interaction,
          skinId,
          sceneName
        );
        break;

      default:
        break;
    }
  }
}
    