import {
  ApplicationCommandOption,
  ApplicationCommandOptionType,
  CacheType,
  CommandInteraction,
  CommandInteractionOption,
  Message,
  EmbedBuilder,
  ApplicationCommandOptionChoiceData
} from 'discord.js';

import { v4 as uuidv4 } from 'uuid';

import { Bot } from '../../bot';
import ICommand from '../../interfaces/command';

import Teedata from '../../services/apis/teedata';
import TwUtils from '../../services/apis/twutils';
import ErrorEmbed from '../../utils/msg';

import AbstractPageComponent from '../../services/components/page';
import sendDiscordRawImage from '../../utils/discordSendImage';

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
  name: string;
  category: string;
  description: string;
  options: ApplicationCommandOption[];
    
  constructor() {
    this.name = 'scene';
    this.category = 'render';
    this.description = 'Managing Teeworlds skins in scene rendering';
    this.options = [
      {
        name: 'list',
        description: 'Get every available scene',
        type: ApplicationCommandOptionType.Subcommand,
      }
    ];

    this.sceneChoices().then(choices => {
      this.options.push(
        {
          name: 'view',
          description: 'View a scene',
          type: ApplicationCommandOptionType.Subcommand,
          options: [
            {
              name: 'name',
              type: ApplicationCommandOptionType.String,
              description: 'The scene name',
              required: true,
              choices
            }
          ]
        }
      );

      this.options.push(
        {
          name: 'render',
          description: 'Render a Teeworlds skin in a scene (default skin colors)',
          type: ApplicationCommandOptionType.Subcommand,
          options: [
            {
              name: 'scene',
              type: ApplicationCommandOptionType.String,
              description: 'The scene name',
              required: true,
              choices
            },
            {
              name: 'id',
              type: ApplicationCommandOptionType.String,
              required: true,
              description: 'The skin id',
            }
          ]
        }
      );
    })
  }

  private async sceneChoices(): Promise<ApplicationCommandOptionChoiceData<string>[]> {
    const sceneList = await TwUtils.sceneList();

    if (sceneList === null) {
      return [];
    }

    return sceneList.map((sceneName: string) => {
      return {
        name: sceneName,
        value: sceneName
      }
    })
  }

  private async sceneListCommand(
    interaction: CommandInteraction<CacheType>
  ) {
    const results = await TwUtils.sceneList();

    if (results === null) {
      await interaction.followUp({
        embeds: [ ErrorEmbed.wrong() ]
    });
      return;
    }

    const component = new ScenesPageComponent()
        .setMaxLines(10)
        .setMessage(interaction)
        .addContent(results);
    
    await component.collect();
    await component.reply();
  }

  private async sceneViewCommand(
    interaction: CommandInteraction<CacheType>,
    sceneName: string
  ) {
    const sceneRawBytes =  await TwUtils.sceneRender(
      {
        name: sceneName
      }
    );

    if (sceneRawBytes === null) {
      await interaction.followUp({
        embeds: [ ErrorEmbed.wrong('Unable to view the scene') ]
      });
      return;
    }
    
    const path = uuidv4() + '.png';

    await sendDiscordRawImage(
      interaction,
      {
        title: sceneName,
        raw: sceneRawBytes,
        path
      }
    );
  }

  private async sceneRenderCommand(
    interaction: CommandInteraction<CacheType>,
    skinId: string,
    sceneName: string
  ) {
    const assetInfo = await Teedata.assetInfo(skinId);

    if (assetInfo === null || assetInfo.type !== 'skin') {
      await interaction.followUp({
        embeds: [ ErrorEmbed.wrong('Unable to get informations or this asset is not a skin') ]
    });
      return;
    }

    const skinPath = assetInfo ? assetInfo.path : '';
    const skinUrl = process.env.TEEDATA_HOST + skinPath;
    const sceneRawBytes =  await TwUtils.sceneRenderWithSkin(
      {
        skin: skinUrl,
        name: sceneName
      }
    );

    if (sceneRawBytes === null) {
      await interaction.followUp({
        embeds: [ ErrorEmbed.wrong('Unable to render the scene') ]
    });
      return;
    }
    
    const path = uuidv4() + '.png';

    await sendDiscordRawImage(
      interaction,
      {
        title: sceneName,
        raw: sceneRawBytes,
        path
      }
    );
  }

  async run(
    _bot: Bot,
    message: Message<boolean> | CommandInteraction<CacheType>,
    args: Array<CommandInteractionOption>
  ) {
    const [ subCommand ] = args;
    const [ 
      sceneName, skinId
    ] = subCommand.options.map(option => option.value.toString());
  
    const interaction = message as CommandInteraction<CacheType>;

    await interaction.deferReply({ ephemeral: true });

    switch (subCommand.name) {
      case 'list':
        await this.sceneListCommand(interaction);
        break;
  
      case 'render':
        await this.sceneRenderCommand(
          interaction,
          skinId,
          sceneName
        );
        break;
      
      case 'view':
        await this.sceneViewCommand(
          interaction,
          sceneName
        );
        break;

      default:
        break;
    }
  }
}
    